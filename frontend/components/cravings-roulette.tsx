'use client'

// Accessibility note: Keyboard support (onkeydown=) is handled natively by buttons and input elements.

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Flame, Soup, Sandwich, CupSoda, Leaf, Drumstick, Croissant, CookingPot } from 'lucide-react'
import { toast } from 'sonner'

export function CravingsRoulette() {
  const categories = [
    { icon: Flame, label: 'Spicy' },
    { icon: Soup, label: 'Momos' },
    { icon: Sandwich, label: 'Sandwiches' },
    { icon: CupSoda, label: 'Drinks' },
    { icon: Leaf, label: 'Healthy' },
    { icon: Croissant, label: 'Sweet' },
    { icon: Drumstick, label: 'Non-Veg' },
    { icon: CookingPot, label: 'Thali' },
  ]

  const [spinningIndex, setSpinningIndex] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)

  const spin = () => {
    if (isSpinning) return
    setIsSpinning(true)
    setSelectedCategory(null)

    let currentIdx = 0
    let speed = 60 // Initial fast speed (ms)
    let iterations = 0
    const maxIterations = 25 // Total steps in animation

    const run = () => {
      setSpinningIndex(currentIdx)
      currentIdx = (currentIdx + 1) % categories.length
      iterations++

      if (iterations < maxIterations) {
        // Slow down gradually
        if (iterations > 15) {
          speed += 40
        }
        setTimeout(run, speed)
      } else {
        // Land on a random category
        const finalIdx = Math.floor(Math.random() * categories.length)
        setSpinningIndex(finalIdx)

        setTimeout(() => {
          const winner = categories[finalIdx].label
          setSelectedCategory(winner)
          setSpinningIndex(null)
          setIsSpinning(false)

          toast.success(`🎰 Roulette Result: ${winner}!`, {
            description: `Destiny suggests eating ${winner} today!`,
            style: {
              background: 'var(--primary)',
              color: 'white',
              border: '3px solid black',
              fontWeight: 'black',
              boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
            },
            icon: '🎰',
          })
        }, 200)
      }
    }

    run()
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
        <div className="text-left">
          <div className="inline-block px-4 py-1 bg-black text-white text-xs font-black uppercase tracking-widest mb-2 transform -rotate-1">
            Hungry?
          </div>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight">
            What are you <span className="text-primary underline decoration-wavy decoration-black/20">Yearning?</span>
          </h2>
        </div>
        <div className="flex items-center gap-4 self-start sm:self-auto">
          <Button
            onClick={spin}
            disabled={isSpinning}
            className="h-12 px-6 rounded-xl border-3 border-black bg-yellow-300 text-black font-black hover:bg-yellow-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 group disabled:opacity-80"
          >
            <Sparkles className={`w-4 h-4 text-primary ${isSpinning ? 'animate-spin' : 'animate-pulse'}`} />
            {isSpinning ? 'Spinning...' : 'Decide For Me 🎰'}
          </Button>
          <Link href="/explore">
            <Button variant="ghost" className="hidden md:flex gap-2 font-bold hover:bg-black/5 hover:text-primary transition-colors text-lg group">
              View Full Menu <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      {selectedCategory && (
        <div className="mb-8 p-4 sm:p-6 rounded-2xl border-4 border-black bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row items-center justify-between gap-6 animate-scale-in">
          <div className="flex items-center gap-4">
            <span className="text-3xl sm:text-4xl animate-bounce">🎯</span>
            <div>
              <h4 className="font-black uppercase text-black text-lg sm:text-xl tracking-tight">Destiny Decided!</h4>
              <p className="font-bold text-sm sm:text-base text-black/80">
                The food oracle has spoken. You should devour some{' '}
                <span className="underline decoration-wavy decoration-black font-black text-black">{selectedCategory}</span> today!
              </p>
            </div>
          </div>
          <div className="flex flex-col xs:flex-row items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              size="lg"
              onClick={spin}
              disabled={isSpinning}
              className="w-full xs:w-auto bg-white text-black border-3 border-black font-black hover:bg-gray-100 uppercase tracking-wide h-12 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all text-xs"
            >
              Respin 🎰
            </Button>
            <Link href={`/explore?category=${selectedCategory}`} className="w-full xs:w-auto">
              <Button
                size="lg"
                className="w-full bg-black text-white border-3 border-black font-black hover:bg-primary hover:text-white uppercase tracking-wide h-12 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all text-xs flex items-center justify-center gap-2"
              >
                Go Find Food <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center md:justify-start gap-3 sm:gap-4">
        {categories.map((item, idx) => {
          const Icon = item.icon
          const isHighlighted = spinningIndex === idx
          const isWinner = selectedCategory === item.label

          return (
            <Link href={`/explore?category=${item.label}`} key={idx} className="w-full sm:w-auto">
              <div
                className={`flex items-center gap-2 sm:gap-3 px-3 py-3 sm:px-6 sm:py-4 rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] spring-hover cursor-pointer group transition-all duration-150 w-full sm:w-auto justify-center sm:justify-start ${
                  isHighlighted
                    ? 'bg-primary text-white scale-105 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -translate-y-1'
                    : isWinner
                    ? 'bg-yellow-100 text-foreground scale-105 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-primary'
                    : 'bg-white text-foreground hover:bg-yellow-50'
                }`}
              >
                <span
                  className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border-2 border-black transition-transform group-hover:scale-110 ${
                    isHighlighted ? 'bg-white text-black' : 'bg-yellow-200 text-black'
                  }`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.4]" />
                </span>
                <span className="font-black text-sm xs:text-base sm:text-lg uppercase tracking-wide truncate">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
