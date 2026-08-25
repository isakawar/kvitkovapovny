import { NextResponse } from 'next/server'

import { getWarehouses } from '@/lib/novaPoshta'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cityRef = searchParams.get('cityRef') || ''

  try {
    const warehouses = await getWarehouses(cityRef)
    return NextResponse.json({ warehouses })
  } catch (error) {
    console.error('Nova Poshta warehouses lookup failed:', error)
    return NextResponse.json({ warehouses: [], error: 'Помилка завантаження відділень' }, { status: 502 })
  }
}
