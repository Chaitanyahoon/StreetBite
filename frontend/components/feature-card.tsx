import { ReactNode } from 'react'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group p-8 rounded-2xl bg-white border border-border/30 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
      {/* CHANGE: improved icon background with better visual hierarchy */}
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/10 group-hover:from-primary/25 group-hover:to-secondary/15 flex items-center justify-center mb-6 transition-all">
        <div className="text-primary group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <h3 className="font-bold text-lg text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-sm">{description}</p>
    </div>
  )
}
