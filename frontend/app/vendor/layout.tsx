import { Sidebar } from "@/components/dashboard/vendor-sidebar"
import { VendorNavbar } from "@/components/dashboard/vendor-navbar"

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <VendorNavbar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
