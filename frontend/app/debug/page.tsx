'use client'

import { useState, useEffect } from 'react'

export default function DebugPage() {
    const [lsUser, setLsUser] = useState<string>('Loading...')

    useEffect(() => {
        setLsUser(localStorage.getItem('user') || 'null')
    }, [])

    return (
        <div className="p-8">
            <h1>Debug Info</h1>
            <pre>
                NEXT_PUBLIC_BACKEND_URL: {process.env.NEXT_PUBLIC_BACKEND_URL || 'undefined'}
            </pre>
            <pre>
                API_BASE_URL (calculated): {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081/api'}
            </pre>
            <div className="mt-4">
                <h2>LocalStorage User</h2>
                <pre id="ls-user">
                    {lsUser}
                </pre>
            </div>
            <div className="mt-4">
                <h2>Signup Debug Log</h2>
                <pre id="ls-debug">
                    {typeof window !== 'undefined' ? localStorage.getItem('signup_debug') : ''}
                </pre>
            </div>
        </div>
    )
}
