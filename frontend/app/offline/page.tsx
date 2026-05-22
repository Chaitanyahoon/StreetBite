'use client'

import { WifiOff, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-[2rem] border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-black bg-orange-300 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce">
          <WifiOff className="h-10 w-10 text-black" />
        </div>
        <h1 className="text-3xl font-black uppercase text-black mb-3">Connection Lost</h1>
        <p className="text-sm font-bold text-gray-700 mb-6">
          You are currently offline. Check your cellular signal or Wi-Fi settings to continue discovering street food gems!
        </p>
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => window.location.reload()}
            className="h-12 w-full rounded-full border-3 border-black bg-yellow-300 text-black font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 active:translate-y-1"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Retry Connection
          </Button>
          <Link href="/">
            <Button 
              variant="outline"
              className="w-full h-12 rounded-full border-3 border-black bg-white text-black font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <Home className="mr-2 h-4 w-4" /> Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
