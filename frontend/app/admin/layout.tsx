'use client'

import { useState } from 'react'
import { AdminSidebar } from "@/components/dashboard/admin-sidebar"
import { AdminNavbar } from "@/components/dashboard/admin-navbar"
import { AdminGuard } from "@/components/auth/admin-guard"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AdminGuard>
      <div className="flex h-screen bg-background relative overflow-hidden">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  )
}
