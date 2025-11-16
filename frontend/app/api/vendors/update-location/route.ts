import { NextResponse } from 'next/server'
import { updateVendor } from '@/lib/firebase'

declare global {
  var __VENDOR_CACHE?: { data: any[]; ts: number }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, latitude, longitude } = body
    if (!id || typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // update Firestore
    await updateVendor(String(id), { latitude, longitude, updatedAt: new Date().toISOString() })

    // update in-memory cache if present (keep timestamp unchanged or refresh)
    if (globalThis.__VENDOR_CACHE?.data) {
      const idx = globalThis.__VENDOR_CACHE.data.findIndex(v => String(v.id) === String(id))
      if (idx !== -1) {
        globalThis.__VENDOR_CACHE.data[idx] = {
          ...globalThis.__VENDOR_CACHE.data[idx],
          latitude,
          longitude,
          updatedAt: new Date().toISOString()
        }
        // update timestamp so subsequent GETs see fresh data
        globalThis.__VENDOR_CACHE.ts = Date.now()
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/vendors/update-location error', err)
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
  }
}
