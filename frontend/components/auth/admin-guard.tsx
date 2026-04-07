'use client'

import { ReactNode, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!user) {
      router.replace(`/signin?next=${encodeURIComponent(pathname || '/admin')}`)
      return
    }

    if (user.role?.toUpperCase() !== 'ADMIN') {
      router.replace('/community')
    }
  }, [isLoading, pathname, router, user])

  if (isLoading || !user || user.role?.toUpperCase() !== 'ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <ShieldCheck className="h-10 w-10 text-primary opacity-60" />
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Checking admin access
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
