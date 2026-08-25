// Server-only client for the official Nova Poshta JSON API v2.0
// (https://developers.novaposhta.ua/). NOVA_POSHTA_API_KEY must never be
// exposed to the browser — only call these from Route Handlers / Server Actions.

const NP_API_URL = 'https://api.novaposhta.ua/v2.0/json/'

export type NovaPoshtaCity = { ref: string; name: string }
export type NovaPoshtaWarehouse = { ref: string; description: string; number: string }

type NpResponse<T> = { success: boolean; data: T[]; errors?: string[] }

async function callNovaPoshta<T>(modelName: string, calledMethod: string, methodProperties: Record<string, unknown>) {
  const apiKey = process.env.NOVA_POSHTA_API_KEY
  if (!apiKey) throw new Error('NOVA_POSHTA_API_KEY is not configured')

  const res = await fetch(NP_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey, modelName, calledMethod, methodProperties }),
    cache: 'no-store',
  })

  if (!res.ok) throw new Error(`Nova Poshta API request failed: ${res.status}`)

  const json = (await res.json()) as NpResponse<T>
  if (!json.success) throw new Error(json.errors?.join('; ') || 'Nova Poshta API returned an error')
  return json.data
}

export async function searchCities(query: string): Promise<NovaPoshtaCity[]> {
  if (!query.trim()) return []

  const data = await callNovaPoshta<{
    // `Ref` here is the address-search result's own ref — NOT what
    // `getWarehouses` expects as CityRef. `DeliveryCity` is the actual city
    // reference to use for that call.
    Addresses: { Ref: string; DeliveryCity: string; Present: string }[]
  }>('Address', 'searchSettlements', { CityName: query, Limit: 10 })

  return (data[0]?.Addresses || []).map((a) => ({ ref: a.DeliveryCity, name: a.Present }))
}

export async function getWarehouses(cityRef: string): Promise<NovaPoshtaWarehouse[]> {
  if (!cityRef) return []

  const data = await callNovaPoshta<{ Ref: string; Description: string; Number: string }>('Address', 'getWarehouses', {
    CityRef: cityRef,
    Limit: 200,
  })

  return data.map((w) => ({ ref: w.Ref, description: w.Description, number: w.Number }))
}
