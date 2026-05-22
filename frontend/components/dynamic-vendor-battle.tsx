"use client"

import dynamic from "next/dynamic"

export const DynamicVendorBattle = dynamic(
  () => import("./VendorBattle").then((mod) => mod.VendorBattle),
  {
    ssr: false,
    loading: () => (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center border-4 border-black bg-white rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden animate-pulse">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50/10 via-amber-100/30 to-orange-50/10 bg-[length:200%_100%]" />
        
        <div className="text-center z-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-black bg-yellow-300 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-black border-t-transparent" />
          </div>
          <h3 className="text-2xl font-black uppercase text-black mb-2 tracking-wider">Entering Arena</h3>
          <p className="font-bold text-sm text-gray-600 uppercase tracking-widest animate-pulse">Preparing the Ultimate Food Fight...</p>
        </div>
      </div>
    ),
  }
)
