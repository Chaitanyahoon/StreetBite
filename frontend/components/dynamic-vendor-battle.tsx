"use client"

import dynamic from "next/dynamic"

export const DynamicVendorBattle = dynamic(
  () => import("./VendorBattle").then((mod) => mod.VendorBattle),
  {
    ssr: false,
    loading: () => (
      <div className="w-full min-h-[400px] flex items-center justify-center border-4 border-black bg-white rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="font-bold text-lg">Loading Battle Arena...</p>
        </div>
      </div>
    ),
  }
)
