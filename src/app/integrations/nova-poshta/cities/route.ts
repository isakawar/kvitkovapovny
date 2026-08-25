import { NextResponse } from 'next/server'

import { searchCities } from '@/lib/novaPoshta'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''

  try {
    const cities = await searchCities(query)
    return NextResponse.json({ cities })
  } catch (error) {
    console.error('Nova Poshta city search failed:', error)
    return NextResponse.json({ cities: [], error: 'Помилка пошуку міста' }, { status: 502 })
  }
}
