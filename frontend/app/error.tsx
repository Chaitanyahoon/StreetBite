'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertOctagon, RotateCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log the error to an error reporting service if available
        console.error('Next.js global application crash boundary:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
            <div className="max-w-xl w-full rounded-[2rem] border-4 border-black bg-white p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center animate-slide-up">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-black bg-orange-400 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <AlertOctagon className="h-10 w-10 text-black" />
                </div>
                
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black mb-4">
                    SOMETHING WENT <span className="text-primary">WRONG!</span>
                </h1>
                
                <p className="text-base font-bold text-gray-700 mb-8 max-w-md mx-auto">
                    StreetBite encountered an unexpected error on this page. We've logged it for our devs to investigate.
                </p>

                {error.digest && (
                    <div className="mb-8 p-3 bg-gray-100 border-2 border-black rounded-xl text-left font-mono text-xs overflow-x-auto">
                        <span className="font-bold text-gray-500 block mb-1">Diagnostic ID:</span>
                        <code className="text-black break-all">{error.digest}</code>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button 
                        onClick={() => reset()}
                        className="w-full sm:w-auto h-14 rounded-full border-4 border-black bg-black px-8 text-base font-black uppercase tracking-[0.1em] text-white shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(249,115,22,1)] transition-all active:translate-y-0 active:shadow-none"
                    >
                        <RotateCcw className="mr-2 h-5 w-5" /> Try Again
                    </Button>
                    <Link 
                        href="/"
                        className="w-full sm:w-auto flex items-center justify-center h-14 rounded-full border-4 border-black bg-white px-8 text-base font-black uppercase tracking-[0.1em] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0 active:shadow-none"
                    >
                        <Home className="mr-2 h-5 w-5" /> Go Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
