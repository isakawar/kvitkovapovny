import { getPayloadClient } from '@/lib/payload'
import { CheckoutForm } from '@/components/storefront/CheckoutForm'

export default async function CheckoutPage() {
  const payload = await getPayloadClient()
  const siteSettings = await payload.findGlobal({ slug: 'site-settings' })

  const cities = (siteSettings.deliveryCities || [])
    .filter((c) => c.active !== false)
    .map((c) => c.name)

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-semibold text-ink">Оформлення замовлення</h1>
      <CheckoutForm cities={cities} />
    </div>
  )
}
