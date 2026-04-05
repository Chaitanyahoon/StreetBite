import type { Metadata } from 'next'
import { AdminSidebar } from "@/components/dashboard/admin-sidebar"
import { AdminNavbar } from "@/components/dashboard/admin-navbar"

export const metadata: Metadata = {
  title: 'Admin Panel',
  description: 'StreetBite administration dashboard for managing vendors, users, and platform settings.',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
