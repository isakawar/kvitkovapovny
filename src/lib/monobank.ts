import { createPublicKey, verify as cryptoVerify } from 'node:crypto'

// Server-only client for Monobank Acquiring (monopay). MONOBANK_TOKEN (X-Token)
// must never be exposed to the browser — only call these from Server Actions /
// Route Handlers. Docs: https://monobank.ua/api-docs/acquiring

const MONO_API_URL = 'https://api.monobank.ua/api/merchant'

function getToken(): string {
  const token = process.env.MONOBANK_TOKEN
  if (!token) throw new Error('MONOBANK_TOKEN is not configured')
  return token
}

export type CreateInvoiceInput = {
  amount: number // kopecks
  reference: string // our order id
  destination: string // human-readable description shown to the payer
  redirectUrl: string
  webHookUrl: string
}

export type CreateInvoiceResult = { invoiceId: string; pageUrl: string }

export async function createInvoice(input: CreateInvoiceInput): Promise<CreateInvoiceResult> {
  const res = await fetch(`${MONO_API_URL}/invoice/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Token': getToken() },
    body: JSON.stringify({
      amount: input.amount,
      ccy: 980,
      merchantPaymInfo: {
        reference: input.reference,
        destination: input.destination,
      },
      redirectUrl: input.redirectUrl,
      webHookUrl: input.webHookUrl,
      validity: 3600 * 24,
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Monobank invoice/create failed: ${res.status} ${body}`)
  }

  const json = (await res.json()) as { invoiceId: string; pageUrl: string }
  return { invoiceId: json.invoiceId, pageUrl: json.pageUrl }
}

// The pubkey rarely changes; cache it in-memory per server instance for a day
// to avoid an extra Monobank round-trip on every webhook delivery.
let cachedPubKey: { key: ReturnType<typeof createPublicKey>; fetchedAt: number } | null = null
const PUBKEY_TTL_MS = 24 * 60 * 60 * 1000

async function getMonobankPublicKey() {
  if (cachedPubKey && Date.now() - cachedPubKey.fetchedAt < PUBKEY_TTL_MS) {
    return cachedPubKey.key
  }

  const res = await fetch(`${MONO_API_URL}/pubkey`, {
    headers: { 'X-Token': getToken() },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Monobank pubkey request failed: ${res.status}`)

  const json = (await res.json()) as { key: string }
  const key = createPublicKey({ key: Buffer.from(json.key, 'base64'), format: 'der', type: 'spki' })
  cachedPubKey = { key, fetchedAt: Date.now() }
  return key
}

// Verifies the `X-Sign` header Monobank sends on every webhook call: a
// base64 ECDSA (SHA-256) signature over the raw request body, checked
// against the public key from GET /api/merchant/pubkey.
export async function verifyWebhookSignature(rawBody: string, signatureBase64: string): Promise<boolean> {
  try {
    const publicKey = await getMonobankPublicKey()
    return cryptoVerify('sha256', Buffer.from(rawBody), publicKey, Buffer.from(signatureBase64, 'base64'))
  } catch (error) {
    console.error('Monobank webhook signature verification failed:', error)
    return false
  }
}

export type MonobankWebhookPayload = {
  invoiceId: string
  status: 'created' | 'processing' | 'hold' | 'success' | 'failure' | 'reversed' | 'expired'
  amount: number
  ccy: number
  reference?: string
}
