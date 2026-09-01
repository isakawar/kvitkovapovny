'use client'

import { useEffect, useState } from 'react'
import { useFormFields } from '@payloadcms/ui'

function formatPrice(kopecks: number | undefined | null): string {
  if (typeof kopecks !== 'number' || Number.isNaN(kopecks)) return '—'
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0,
  }).format(kopecks / 100)
}

/**
 * Sidebar live preview of the catalog card — mirrors the key fields an editor
 * touches (photo, name, subtitle, price, badge, bullets, CTA) as they type.
 */
export function ProductCardPreview() {
  const { name, cardSubtitle, price, priceSuffixLabel, badge, ctaLabel, firstImageId } = useFormFields(
    ([fields]) => ({
      name: fields?.name?.value as string | undefined,
      cardSubtitle: fields?.cardSubtitle?.value as string | undefined,
      price: fields?.price?.value as number | undefined,
      priceSuffixLabel: fields?.priceSuffixLabel?.value as string | undefined,
      badge: fields?.badge?.value as string | undefined,
      ctaLabel: fields?.ctaLabel?.value as string | undefined,
      firstImageId: (fields?.images?.value as (string | number)[] | undefined)?.[0],
    }),
  )

  const bulletLabels = useFormFields(([fields]) => {
    const count = (fields?.bullets?.value as number | undefined) ?? 0
    const labels: string[] = []
    for (let i = 0; i < count; i++) {
      const label = fields?.[`bullets.${i}.label`]?.value as string | undefined
      if (label) labels.push(label)
    }
    return labels
  })

  const [loaded, setLoaded] = useState<{ id: string; url: string | null } | null>(null)
  const imageUrl = loaded && loaded.id === String(firstImageId ?? '') ? loaded.url : null

  useEffect(() => {
    if (!firstImageId) return
    const id = String(firstImageId)
    let cancelled = false
    fetch(`/api/media/${id}?depth=0`)
      .then((res) => (res.ok ? res.json() : null))
      .then((doc) => {
        if (cancelled) return
        const url = doc ? doc.sizes?.card?.url || doc.sizes?.thumbnail?.url || doc.url || null : null
        setLoaded({ id, url })
      })
      .catch(() => {
        if (!cancelled) setLoaded({ id, url: null })
      })
    return () => {
      cancelled = true
    }
  }, [firstImageId])

  return (
    <div className="field-type ui">
      <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 8, color: 'var(--theme-elevation-600)' }}>
        Превʼю картки
      </div>
      <div
        style={{
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 8,
          overflow: 'hidden',
          background: 'var(--theme-elevation-50)',
        }}
      >
        <div style={{ position: 'relative', aspectRatio: '4 / 5', background: 'var(--theme-elevation-100)' }}>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                color: 'var(--theme-elevation-400)',
              }}
            >
              Немає фото
            </div>
          )}
          {badge ? (
            <span
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                background: 'var(--theme-success-500)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 999,
              }}
            >
              {badge}
            </span>
          ) : null}
        </div>
        <div style={{ padding: 12 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{name || 'Назва товару'}</div>
          {cardSubtitle ? (
            <div style={{ fontSize: '0.75rem', color: 'var(--theme-elevation-500)', marginTop: 2 }}>
              {cardSubtitle}
            </div>
          ) : null}
          {bulletLabels.length > 0 ? (
            <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', fontSize: '0.75rem' }}>
              {bulletLabels.map((label, i) => (
                <li key={i} style={{ color: 'var(--theme-elevation-600)' }}>
                  ✓ {label}
                </li>
              ))}
            </ul>
          ) : null}
          <div style={{ marginTop: 8, fontWeight: 700 }}>
            {formatPrice(price)}
            {priceSuffixLabel ? (
              <span style={{ fontWeight: 400, fontSize: '0.7rem', color: 'var(--theme-elevation-500)' }}>
                {' '}
                {priceSuffixLabel}
              </span>
            ) : null}
          </div>
          <div
            style={{
              marginTop: 8,
              textAlign: 'center',
              background: 'var(--theme-elevation-800)',
              color: 'var(--theme-elevation-0)',
              borderRadius: 999,
              padding: '6px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {ctaLabel || 'У кошик'}
          </div>
        </div>
      </div>
    </div>
  )
}
