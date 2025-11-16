import { NextResponse } from 'next/server'
import { fetchVendors } from '@/lib/firebase'

const TTL_MS = (Number(process.env.VENDOR_CACHE_TTL || '30') || 30) * 1000

declare global {
  // persist cache on globalThis so serverless dev mode preserves it across module reloads
  // Use a type that allows undefined instead of optional property syntax
  var __VENDOR_CACHE: { data: any[]; ts: number } | undefined;
}

export async function GET() {
  try {
    const now = Date.now()
    if (globalThis.__VENDOR_CACHE && (now - globalThis.__VENDOR_CACHE.ts) < TTL_MS) {
      return NextResponse.json({ source: 'cache', vendors: globalThis.__VENDOR_CACHE.data })
    }

    const vendors = await fetchVendors()
    globalThis.__VENDOR_CACHE = { data: vendors, ts: Date.now() }
    return NextResponse.json({ source: 'firestore', vendors })
  } catch (err) {
    console.error('GET /api/vendors error', err)
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 })
  }
}
