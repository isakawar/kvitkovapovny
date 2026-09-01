'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

import { getOrderPaymentStatus } from '@/app/actions/getOrderPaymentStatus'
import { track } from '@/lib/analytics'

const POLL_INTERVAL_MS = 2000
const MAX_POLL_ATTEMPTS = 6

export type PurchaseTrackerItem = {
  item_id: string
  item_name: string
  item_variant?: string
  price: number
  quantity: number
}

export function PurchaseTracker({
  orderId,
  initialPaymentStatus,
  requiresOnlinePayment,
  value,
  items,
}: {
  orderId: string
  initialPaymentStatus: string
  requiresOnlinePayment: boolean
  value: number
  items: PurchaseTrackerItem[]
}) {
  const firedRef = useRef(false)
  const router = useRouter()

  useEffect(() => {
    if (!requiresOnlinePayment) return

    const storageKey = `purchase_tracked_${orderId}`
    if (window.localStorage.getItem(storageKey)) return

    function firePurchase() {
      if (firedRef.current) return
      firedRef.current = true
      track('purchase', { transaction_id: orderId, value, currency: 'UAH', items })
      window.localStorage.setItem(storageKey, '1')
    }

    if (initialPaymentStatus === 'paid') {
      firePurchase()
      return
    }

    if (initialPaymentStatus !== 'pending') return

    let cancelled = false

    async function pollForPayment() {
      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS && !cancelled; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
        if (cancelled) return

        const result = await getOrderPaymentStatus(orderId)
        if (cancelled) return

        if (result?.paymentStatus === 'paid') {
          firePurchase()
          // Re-render the server component so the "awaiting payment" banner
          // flips to the paid state without a manual reload.
          router.refresh()
          return
        }
        if (result?.paymentStatus === 'failed') {
          router.refresh()
          return
        }
      }
    }

    pollForPayment()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, initialPaymentStatus, requiresOnlinePayment])

  return null
}
