import { NextResponse } from 'next/server'
import { catalogPayload } from '@/lib/catalog'

export function GET() {
  return NextResponse.json(catalogPayload(), { headers: { 'Cache-Control': 'public, max-age=60' } })
}
