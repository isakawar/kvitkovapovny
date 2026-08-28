'use client'

import { useField, FieldLabel } from '@payloadcms/ui'
import type { NumberFieldClientComponent } from 'payload'

const KOPIYKY_IN_UAH = 100

/**
 * Money is stored in kopecks (integer) to avoid floating-point rounding — and
 * because Monobank's API expects kopecks. This field lets editors read and
 * type the value in hryvnia; the kopeck conversion happens here, invisibly.
 */
export const PriceField: NumberFieldClientComponent = ({ field, path: pathFromProps }) => {
  const { value, setValue, showError, errorMessage, path } = useField<number | null>({
    potentiallyStalePath: pathFromProps,
  })

  const uah = typeof value === 'number' ? value / KOPIYKY_IN_UAH : ''
  const description = typeof field?.admin?.description === 'string' ? field.admin.description : undefined

  return (
    <div className={`field-type number${showError ? ' error' : ''}`}>
      <FieldLabel label={field?.label} required={field?.required} path={path} />
      <div className="field-type__wrap">
        <input
          type="number"
          step="0.01"
          inputMode="decimal"
          name={path}
          value={uah}
          onChange={(e) => {
            const raw = e.target.value
            if (raw === '') {
              setValue(null)
              return
            }
            const n = Number(raw)
            setValue(Number.isNaN(n) ? null : Math.round(n * KOPIYKY_IN_UAH))
          }}
        />
      </div>
      {showError && errorMessage && <div className="field-error">{errorMessage}</div>}
      {description && <div className="field-description">{description}</div>}
    </div>
  )
}
