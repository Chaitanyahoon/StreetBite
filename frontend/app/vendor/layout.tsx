'use client'

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/vendor-sidebar"
import { VendorNavbar } from "@/components/dashboard/vendor-navbar"

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden backdrop-blur-[2px]">
        <VendorNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
