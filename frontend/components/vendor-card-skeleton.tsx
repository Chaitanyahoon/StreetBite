'use client'

export function VendorCardSkeleton() {
  return (
    <article className="surface-panel flex h-full flex-col overflow-hidden rounded-[1.75rem] border-4 border-black bg-white p-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-h-[460px] animate-pulse">
      {/* Image Area Skeleton */}
      <div className="relative h-44 overflow-hidden bg-orange-50 border-b-4 border-black sm:h-52 md:h-56">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100/40 via-amber-200/50 to-orange-100/40 bg-[length:200%_100%] animate-pulse" />
        
        {/* Floating badge skeleton (left) */}
        <div className="absolute left-3 top-3 h-7 w-20 rounded-full border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
        {/* Floating badge skeleton (right) */}
        <div className="absolute right-3 top-3 h-7 w-12 rounded-full border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
        
        {/* Bottom text skeleton (Name overlay) */}
        <div className="absolute bottom-3 left-3 h-8 w-44 rounded-lg border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
      </div>

      {/* Details Area Skeleton */}
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-5">
        {/* Tag row */}
        <div className="flex gap-2">
          <div className="h-7 w-16 rounded-full border-2 border-black bg-amber-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
          <div className="h-7 w-24 rounded-full border-2 border-black bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border-2 border-black bg-black/[0.02] px-3 py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="h-3 w-12 rounded bg-zinc-300" />
            <div className="mt-2 h-5 w-16 rounded border-2 border-black bg-white" />
          </div>
          <div className="rounded-2xl border-2 border-black bg-black/[0.02] px-3 py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="h-3 w-12 rounded bg-zinc-300" />
            <div className="mt-2 h-5 w-10 rounded border-2 border-black bg-white" />
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="mt-auto flex items-center justify-between gap-4 border-t-2 border-black pt-4">
          <div className="flex-1">
            <div className="h-3.5 w-24 rounded bg-zinc-400" />
            <div className="mt-1.5 h-4 w-4/5 rounded bg-zinc-200" />
          </div>
          <div className="h-11 w-11 shrink-0 rounded-full border-2 border-black bg-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
        </div>
      </div>
    </article>
  )
}
