'use client'

import { useEffect, useRef, useState } from 'react'

type City = { ref: string; name: string }
type Warehouse = { ref: string; description: string; number: string }

export function NovaPoshtaFields() {
  const [cityQuery, setCityQuery] = useState('')
  const [citySuggestions, setCitySuggestions] = useState<City[]>([])
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [selectedWarehouseRef, setSelectedWarehouseRef] = useState('')
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingWarehouses, setLoadingWarehouses] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (selectedCity || cityQuery.trim().length < 2) {
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoadingCities(true)
      try {
        const res = await fetch(`/integrations/nova-poshta/cities?q=${encodeURIComponent(cityQuery)}`)
        const data = await res.json()
        setCitySuggestions(data.cities || [])
      } catch {
        setCitySuggestions([])
      } finally {
        setLoadingCities(false)
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [cityQuery, selectedCity])

  function pickCity(city: City) {
    setSelectedCity(city)
    setCityQuery(city.name)
    setCitySuggestions([])
    setSelectedWarehouseRef('')
    setWarehouses([])
    setLoadingWarehouses(true)
    fetch(`/integrations/nova-poshta/warehouses?cityRef=${encodeURIComponent(city.ref)}`)
      .then((res) => res.json())
      .then((data) => setWarehouses(data.warehouses || []))
      .catch(() => setWarehouses([]))
      .finally(() => setLoadingWarehouses(false))
  }

  function clearCity() {
    setSelectedCity(null)
    setCityQuery('')
    setWarehouses([])
    setSelectedWarehouseRef('')
  }

  const selectedWarehouse = warehouses.find((w) => w.ref === selectedWarehouseRef)

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <input
          value={cityQuery}
          onChange={(e) => {
            setCityQuery(e.target.value)
            if (selectedCity) clearCity()
          }}
          placeholder="Місто"
          required
          className="input"
          autoComplete="off"
        />
        {loadingCities && <p className="mt-1 text-xs text-ink-soft">Пошук…</p>}
        {!selectedCity && cityQuery.trim().length >= 2 && citySuggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded-xl border border-ink/10 bg-cream shadow-md">
            {citySuggestions.map((city) => (
              <li key={city.ref}>
                <button
                  type="button"
                  onClick={() => pickCity(city)}
                  className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-blush"
                >
                  {city.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedCity && (
        <select
          required
          value={selectedWarehouseRef}
          onChange={(e) => setSelectedWarehouseRef(e.target.value)}
          className="input"
        >
          <option value="" disabled>
            {loadingWarehouses ? 'Завантаження відділень…' : 'Відділення / поштомат'}
          </option>
          {warehouses.map((w) => (
            <option key={w.ref} value={w.ref}>
              {w.description}
            </option>
          ))}
        </select>
      )}

      <input type="hidden" name="deliveryCity" value={selectedCity?.name || ''} />
      <input type="hidden" name="npCityRef" value={selectedCity?.ref || ''} />
      <input type="hidden" name="npWarehouseRef" value={selectedWarehouseRef} />
      <input type="hidden" name="npOfficeNumber" value={selectedWarehouse?.description || ''} />
    </div>
  )
}
