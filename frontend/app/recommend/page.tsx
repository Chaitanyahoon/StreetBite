'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { recommendApi, gamificationApi, type RecommendResult, type RecommendRequestPayload } from '@/lib/api'
import {
  Sparkles, ArrowRight, ArrowLeft, Star, MapPin, ChefHat,
  Flame, Leaf, Zap, Heart, LoaderCircle, RotateCcw, Utensils,
  Home, Smile, Thermometer, Skull, Coins, Banknote, Gem
} from 'lucide-react'
import { ReactNode } from 'react'

const STEPS = [
  {
    id: 'mood',
    title: "What's your vibe?",
    subtitle: 'Pick the mood that matches your hunger',
    options: [
      { value: 'adventurous', label: 'Adventurous', icon: <Flame className="h-7 w-7 text-black" />, desc: 'Surprise me with something wild', color: 'bg-orange-400' },
      { value: 'comfort', label: 'Comfort Food', icon: <Home className="h-7 w-7 text-black" />, desc: 'Classic homestyle goodness', color: 'bg-yellow-400' },
      { value: 'quick', label: 'Quick Bite', icon: <Zap className="h-7 w-7 text-black" />, desc: 'Fast, tasty, no fuss', color: 'bg-cyan-400' },
      { value: 'healthy', label: 'Healthy', icon: <Leaf className="h-7 w-7 text-black" />, desc: 'Light, fresh, guilt-free', color: 'bg-green-400' },
    ],
  },
  {
    id: 'spiceLevel',
    title: 'How spicy?',
    subtitle: 'Your heat tolerance today',
    options: [
      { value: 'mild', label: 'Mild', icon: <Smile className="h-7 w-7 text-black" />, desc: 'Keep it chill', color: 'bg-blue-300' },
      { value: 'medium', label: 'Medium', icon: <Thermometer className="h-7 w-7 text-black" />, desc: 'A little kick', color: 'bg-yellow-400' },
      { value: 'spicy', label: 'Spicy', icon: <Flame className="h-7 w-7 text-black" />, desc: 'Bring the heat', color: 'bg-orange-500' },
      { value: 'fire', label: 'FIRE!', icon: <Skull className="h-7 w-7 text-black" />, desc: 'Destroy my tastebuds', color: 'bg-red-500' },
    ],
  },
  {
    id: 'budget',
    title: 'What\'s your budget?',
    subtitle: 'How much are you willing to spend?',
    options: [
      { value: 'low', label: 'Under ₹100', icon: <Coins className="h-7 w-7 text-black" />, desc: 'Street food prices', color: 'bg-green-400' },
      { value: 'medium', label: '₹100 - ₹300', icon: <Banknote className="h-7 w-7 text-black" />, desc: 'Mid-range feast', color: 'bg-yellow-400' },
      { value: 'high', label: '₹300+', icon: <Gem className="h-7 w-7 text-black" />, desc: 'Premium experience', color: 'bg-pink-400' },
    ],
  },
]

export default function RecommendPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<RecommendRequestPayload>({})
  const [results, setResults] = useState<RecommendResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [noResults, setNoResults] = useState(false)

  const handleSelect = (stepId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [stepId]: value }))

    if (currentStep < STEPS.length - 1) {
      setTimeout(() => setCurrentStep((s) => s + 1), 300)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setNoResults(false)
    try {
      // 1. Give Passive Niche XP based on their preference
      try {
          if (answers.spiceLevel === 'fire' || answers.spiceLevel === 'spicy') {
              await gamificationApi.performNicheAction('spice', 500);
          } else if (answers.mood === 'comfort') {
              await gamificationApi.performNicheAction('sugar', 500);
          } else if (answers.budget === 'low') {
              await gamificationApi.performNicheAction('night', 500);
          } else {
               // Default participation XP
              await gamificationApi.performNicheAction('spice', 100);
          }
      } catch (e) {
          // Ignore failures (e.g. unauthenticated, guest user)
          console.warn('Silent gamification fail:', e);
      }

      const data = await recommendApi.getRecommendations(answers)
      if (data.results && data.results.length > 0) {
        setResults(data.results)
        setShowResults(true)
      } else {
        setNoResults(true)
        setShowResults(true)
      }
    } catch (err) {
      console.error('Recommendation error:', err)
      setNoResults(true)
      setShowResults(true)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setCurrentStep(0)
    setAnswers({})
    setResults([])
    setShowResults(false)
    setNoResults(false)
  }

  const step = STEPS[currentStep]
  const allAnswered = STEPS.every((s) => answers[s.id as keyof RecommendRequestPayload])

  if (showResults) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 px-4 pb-32 pt-24 md:px-6 md:pt-28">
          <div className="mx-auto max-w-5xl">
            {/* Results Header */}
            <div className="text-center mb-12 animate-slide-up">
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-[0.72rem] font-black uppercase tracking-[0.24em] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                AI Results
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-black leading-[0.9]">
                YOUR <span className="text-primary drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">PERFECT PICKS</span>
              </h1>
              <p className="mt-4 text-lg font-bold text-black/60">
                Based on your {answers.mood} mood, {answers.spiceLevel} spice, {answers.budget} budget
              </p>
            </div>

            {noResults ? (
              <div className="rounded-[2rem] border-4 border-black bg-white p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-slide-up">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-black bg-yellow-300">
                  <Utensils className="h-9 w-9" />
                </div>
                <h3 className="mt-6 text-2xl font-black">No matches found</h3>
                <p className="mt-3 text-base font-medium text-black/60 max-w-md mx-auto">
                  Try tweaking your preferences — maybe a different mood or budget range?
                </p>
                <Button onClick={handleReset} className="mt-8 h-14 rounded-full border-4 border-black bg-black px-8 text-base font-black uppercase tracking-[0.14em] text-white shadow-[6px_6px_0px_0px_rgba(249,115,22,1)]">
                  <RotateCcw className="mr-2 h-5 w-5" /> Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {results.map((result, index) => (
                  <div
                    key={result.vendorId}
                    className="group rounded-[2rem] border-4 border-black bg-white overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image/Rank Badge */}
                      <div className="relative w-full md:w-64 h-48 md:h-auto bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center shrink-0">
                        {result.displayImageUrl ? (
                          <img
                            src={result.displayImageUrl}
                            alt={result.vendorName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ChefHat className="h-16 w-16 text-black/20" />
                        )}
                        <div className="absolute top-4 left-4 flex h-12 w-12 items-center justify-center rounded-full border-4 border-black bg-yellow-300 text-xl font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                          #{index + 1}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6 md:p-8">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-black uppercase tracking-[0.16em] text-primary mb-1">
                              {result.matchReason}
                            </p>
                            <h3 className="text-2xl md:text-3xl font-black text-black">
                              {result.vendorName}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1 rounded-full border-2 border-black bg-yellow-300 px-3 py-1.5 text-sm font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                            <Star className="h-4 w-4 fill-black" />
                            {result.rating?.toFixed(1) || '—'}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-bold text-black/55">
                          {result.cuisine && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-black/15 px-3 py-1 bg-white">
                              <Flame className="h-3.5 w-3.5 text-orange-500" /> {result.cuisine}
                            </span>
                          )}
                          {result.address && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-primary" /> {result.address}
                            </span>
                          )}
                          {result.reviewCount > 0 && (
                            <span>{result.reviewCount} reviews</span>
                          )}
                        </div>

                        {/* Top Dishes */}
                        {result.topDishes && result.topDishes.length > 0 && (
                          <div className="mt-5">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-black/40 mb-2">Top Picks</p>
                            <div className="flex flex-wrap gap-2">
                              {result.topDishes.map((dish, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-2 rounded-full border-2 border-black/15 bg-orange-50 px-4 py-2 text-sm font-bold text-black"
                                >
                                  {dish.name}
                                  {dish.price != null && (
                                    <span className="text-primary font-black">₹{dish.price}</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-6">
                          <Link href={result.vendorSlug ? `/vendors/${result.vendorSlug}` : `/explore`}>
                            <Button className="h-12 rounded-full border-3 border-black bg-black px-6 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] hover:bg-primary hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                              View Stall <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Try Again */}
                <div className="text-center pt-8">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="h-14 rounded-full border-4 border-black px-10 text-base font-black uppercase tracking-[0.14em] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <RotateCcw className="mr-2 h-5 w-5" /> Start Over
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 pb-32 pt-24 md:px-6 md:pt-28">
        {/* Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute left-[-8%] top-10 h-56 w-56 rounded-[4rem] border-4 border-black/12 bg-orange-300/20 blur-2xl md:h-72 md:w-72" />
          <div className="absolute right-[6%] top-16 h-28 w-28 rotate-12 rounded-[2rem] border-4 border-black/12 bg-yellow-300/35 md:h-40 md:w-40" />
          <div className="absolute bottom-20 left-[8%] h-20 w-20 -rotate-12 rounded-full border-4 border-black/10 bg-teal-200/45 md:h-28 md:w-28" />
        </div>

        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-[0.72rem] font-black uppercase tracking-[0.24em] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              AI-Powered
            </div>
            <h1 className="mt-8 text-5xl md:text-7xl font-black text-black leading-[0.9] tracking-[-0.04em]">
              WHAT SHOULD
              <br />
              <span className="text-primary drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">I EAT?</span>
            </h1>
            <p className="mt-6 text-lg font-bold text-black/60 max-w-lg mx-auto">
              Answer 3 quick questions and we&apos;ll find your perfect street food match.
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-3 mb-10">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-3 border-black text-sm font-black transition-all ${
                    i < currentStep
                      ? 'bg-green-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                      : i === currentStep
                        ? 'bg-yellow-300 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] scale-110'
                        : 'bg-white text-black/40'
                  }`}
                >
                  {i < currentStep ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-1 w-8 rounded-full ${i < currentStep ? 'bg-green-400' : 'bg-black/15'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Question Card */}
          <div className="rounded-[2.5rem] border-4 border-black bg-white p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-slide-up" key={currentStep}>
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-black text-black">{step.title}</h2>
              <p className="mt-2 text-base font-bold text-black/55">{step.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {step.options.map((option) => {
                const isSelected = answers[step.id as keyof RecommendRequestPayload] === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(step.id, option.value)}
                    className={`group relative rounded-2xl border-4 border-black p-6 text-left transition-all ${
                      isSelected
                        ? 'bg-yellow-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -translate-y-1'
                        : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1'
                    }`}
                  >
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl border-4 border-black ${option.color} text-2xl mb-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-1 group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all`}>
                      {option.icon}
                    </div>
                    <h3 className="text-xl font-black text-black">{option.label}</h3>
                    <p className="mt-1 text-sm font-bold text-black/55">{option.desc}</p>
                    {isSelected && (
                      <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-green-400 text-sm font-black">
                        ✓
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              disabled={currentStep === 0}
              variant="outline"
              className="h-13 rounded-full border-4 border-black px-6 font-black uppercase tracking-[0.14em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-30"
            >
              <ArrowLeft className="mr-2 h-5 w-5" /> Back
            </Button>

            {currentStep === STEPS.length - 1 && allAnswered ? (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="h-13 rounded-full border-4 border-black bg-primary px-8 text-base font-black uppercase tracking-[0.14em] text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-orange-600 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> Finding...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" /> Find My Food
                  </>
                )}
              </Button>
            ) : currentStep < STEPS.length - 1 && answers[step.id as keyof RecommendRequestPayload] ? (
              <Button
                onClick={() => setCurrentStep((s) => s + 1)}
                className="h-13 rounded-full border-4 border-black bg-black px-8 text-base font-black uppercase tracking-[0.14em] text-white shadow-[6px_6px_0px_0px_rgba(249,115,22,1)]"
              >
                Next <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
