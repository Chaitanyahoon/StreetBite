'use client'

import { useState } from 'react'
import Script from 'next/script'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { VendorCard } from '@/components/vendor-card'
import { recommendApi, gamificationApi, type RecommendResult, type RecommendRequestPayload } from '@/lib/api'
import {
  Sparkles, ArrowRight, ArrowLeft,
  Flame, Leaf, Zap, LoaderCircle, RotateCcw, Utensils,
  Home, Smile, Thermometer, Skull, Coins, Banknote, Gem,
  Plus, Minus
} from 'lucide-react'

const STEPS = [
  {
    id: 'mood',
    title: "What's your vibe?",
    subtitle: 'Pick the mood that matches your hunger',
    options: [
      { value: 'adventurous', label: 'Adventurous', icon: <Flame className="h-5 w-5 sm:h-7 sm:w-7 text-black" />, desc: 'Surprise me with something wild', color: 'bg-orange-400' },
      { value: 'comfort', label: 'Comfort Food', icon: <Home className="h-5 w-5 sm:h-7 sm:w-7 text-black" />, desc: 'Classic homestyle goodness', color: 'bg-yellow-400' },
      { value: 'quick', label: 'Quick Bite', icon: <Zap className="h-5 w-5 sm:h-7 sm:w-7 text-black" />, desc: 'Fast, tasty, no fuss', color: 'bg-cyan-400' },
      { value: 'healthy', label: 'Healthy', icon: <Leaf className="h-5 w-5 sm:h-7 sm:w-7 text-black" />, desc: 'Light, fresh, guilt-free', color: 'bg-green-400' },
    ],
  },
  {
    id: 'spiceLevel',
    title: 'How spicy?',
    subtitle: 'Your heat tolerance today',
    options: [
      { value: 'mild', label: 'Mild', icon: <Smile className="h-5 w-5 sm:h-7 sm:w-7 text-black" />, desc: 'Keep it chill', color: 'bg-blue-300' },
      { value: 'medium', label: 'Medium', icon: <Thermometer className="h-5 w-5 sm:h-7 sm:w-7 text-black" />, desc: 'A little kick', color: 'bg-yellow-400' },
      { value: 'spicy', label: 'Spicy', icon: <Flame className="h-5 w-5 sm:h-7 sm:w-7 text-black" />, desc: 'Bring the heat', color: 'bg-orange-500' },
      { value: 'fire', label: 'FIRE!', icon: <Skull className="h-5 w-5 sm:h-7 sm:w-7 text-black" />, desc: 'Destroy my tastebuds', color: 'bg-red-500' },
    ],
  },
  {
    id: 'budget',
    title: "What's your budget?",
    subtitle: 'How much are you willing to spend?',
    options: [
      { value: 'low', label: 'Under ₹100', icon: <Coins className="h-5 w-5 sm:h-7 sm:w-7 text-black" />, desc: 'Street food prices', color: 'bg-green-400' },
      { value: 'medium', label: '₹100 - ₹300', icon: <Banknote className="h-5 w-5 sm:h-7 sm:w-7 text-black" />, desc: 'Mid-range feast', color: 'bg-yellow-400' },
      { value: 'high', label: '₹300+', icon: <Gem className="h-5 w-5 sm:h-7 sm:w-7 text-black" />, desc: 'Premium experience', color: 'bg-pink-400' },
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
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

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
        <main className="flex-1 px-3 pb-20 pt-20 sm:px-4 sm:pb-32 sm:pt-24 md:px-6 md:pt-28">
          <div className="mx-auto max-w-5xl">
            {/* Results Header */}
            <div className="text-center mb-6 sm:mb-10 animate-slide-up">
              <div className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border-2 border-black bg-white px-2.5 py-1 sm:px-4 sm:py-2 text-[0.58rem] sm:text-[0.72rem] font-black uppercase tracking-[0.16rem] sm:tracking-[0.24em] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-3 sm:mb-6">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400" />
                AI Results
              </div>
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-6xl font-black text-black leading-[0.9]">
                YOUR <span className="text-primary drop-shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] sm:drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">PERFECT PICKS</span>
              </h1>
              <p className="mt-2 sm:mt-4 text-[0.68rem] xs:text-xs sm:text-lg font-bold text-black/60">
                Based on your {answers.mood} mood, {answers.spiceLevel} spice, {answers.budget} budget
              </p>
            </div>

            {noResults ? (
              <div className="rounded-2xl sm:rounded-[2rem] border-2 sm:border-4 border-black bg-white p-5 sm:p-12 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-slide-up">
                <div className="mx-auto flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-full border-2 sm:border-4 border-black bg-yellow-300">
                  <Utensils className="h-6 w-6 sm:h-9 sm:w-9" />
                </div>
                <h3 className="mt-3 sm:mt-6 text-lg sm:text-2xl font-black">No matches found</h3>
                <p className="mt-1.5 sm:mt-3 text-[0.68rem] sm:text-base font-medium text-black/60 max-w-md mx-auto">
                  Try tweaking your preferences — maybe a different mood or budget range?
                </p>
                <Button onClick={handleReset} className="mt-4 sm:mt-8 h-9 sm:h-14 rounded-full border-2 sm:border-4 border-black bg-black px-5 sm:px-8 text-[0.68rem] sm:text-base font-black uppercase tracking-[0.12em] text-white shadow-[2px_2px_0px_0px_var(--primary)] sm:shadow-[6px_6px_0px_0px_rgba(249,115,22,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                  <RotateCcw className="mr-1 h-3.5 w-3.5 sm:h-5 sm:w-5" /> Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-10">
                {/* Unified VendorCard Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                  {results.map((result, index) => (
                    <div
                      key={result.vendorId}
                      className="relative animate-slide-up pt-2.5 pl-2.5 sm:pt-3 sm:pl-3"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Rank Badge — overlapping top-left */}
                      <div className="absolute -top-1 -left-1 sm:-top-0.5 sm:-left-0.5 z-10 flex h-7 w-7 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 sm:border-4 border-black bg-yellow-300 text-[0.6rem] sm:text-base font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        #{index + 1}
                      </div>
                      {/* Match Reason Badge — overlapping top-right */}
                      <div className="absolute -top-1 right-0 sm:top-0 z-10 max-w-[60%] truncate rounded-full border-[1.5px] sm:border-[3px] border-black bg-primary px-2 py-0.5 sm:px-3 sm:py-1.5 text-[0.5rem] sm:text-[0.68rem] font-black uppercase tracking-[0.06em] text-white shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                        {result.matchReason}
                      </div>
                      <VendorCard
                        id={String(result.vendorId)}
                        slug={result.vendorSlug}
                        name={result.vendorName}
                        cuisine={result.cuisine}
                        rating={result.rating}
                        distance={result.address || ''}
                        displayImageUrl={result.displayImageUrl}
                        reviews={result.reviewCount}
                        tags={result.topDishes?.map(d => d.name) || []}
                        status="AVAILABLE"
                      />
                    </div>
                  ))}
                </div>

                {/* Try Again */}
                <div className="text-center pt-1 sm:pt-4">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="h-9 sm:h-14 rounded-full border-2 sm:border-4 border-black px-6 sm:px-10 text-[0.68rem] sm:text-base font-black uppercase tracking-[0.12em] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                  >
                    <RotateCcw className="mr-1 h-3.5 w-3.5 sm:h-5 sm:w-5" /> Start Over
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

      <main className="flex-1 px-3 pb-20 pt-20 sm:px-4 sm:pb-32 sm:pt-24 md:px-6 md:pt-28">
        {/* Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute left-[-8%] top-10 h-36 w-36 sm:h-56 sm:w-56 rounded-[3rem] sm:rounded-[4rem] border-4 border-black/12 bg-orange-300/20 blur-2xl md:h-72 md:w-72" />
          <div className="absolute right-[6%] top-16 h-20 w-20 sm:h-28 sm:w-28 rotate-12 rounded-[1.5rem] sm:rounded-[2rem] border-4 border-black/12 bg-yellow-300/35 md:h-40 md:w-40" />
          <div className="absolute bottom-20 left-[8%] h-14 w-14 sm:h-20 sm:w-20 -rotate-12 rounded-full border-4 border-black/10 bg-teal-200/45 md:h-28 md:w-28" />
        </div>

        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center mb-5 sm:mb-10 animate-slide-up">
            <div className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border-2 border-black bg-white px-2.5 py-1 sm:px-4 sm:py-2 text-[0.58rem] sm:text-[0.72rem] font-black uppercase tracking-[0.16rem] sm:tracking-[0.24em] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400" />
              AI-Powered
            </div>
            <h1 className="mt-3 sm:mt-6 text-[2.25rem] xs:text-[2.75rem] sm:text-5xl md:text-7xl font-black text-black leading-[0.9] tracking-[-0.04em]">
              WHAT SHOULD
              <br />
              <span className="text-primary drop-shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] sm:drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">I EAT?</span>
            </h1>
            <p className="mt-2 sm:mt-4 text-[0.68rem] xs:text-xs sm:text-lg font-bold text-black/60 max-w-lg mx-auto">
              Answer 3 quick questions and we&apos;ll find your perfect street food match.
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-3 mb-5 sm:mb-8">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-1.5 sm:gap-3">
                <div
                  className={`flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 sm:border-3 border-black text-[0.6rem] sm:text-sm font-black transition-all ${
                    i < currentStep
                      ? 'bg-green-400 text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                      : i === currentStep
                        ? 'bg-yellow-300 text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] scale-110'
                        : 'bg-white text-black/40'
                  }`}
                >
                  {i < currentStep ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 sm:h-1 w-4 sm:w-8 rounded-full ${i < currentStep ? 'bg-green-400' : 'bg-black/15'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Question Card */}
          <div className="rounded-2xl sm:rounded-[2.5rem] border-2 sm:border-4 border-black bg-white p-3.5 sm:p-7 md:p-10 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-slide-up" key={currentStep}>
            <div className="text-center mb-3.5 sm:mb-6">
              <h2 className="text-lg xs:text-2xl sm:text-3xl md:text-4xl font-black text-black">{step.title}</h2>
              <p className="mt-0.5 sm:mt-1 text-[0.68rem] xs:text-xs sm:text-base font-bold text-black/55">{step.subtitle}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
              {step.options.map((option) => {
                const isSelected = answers[step.id as keyof RecommendRequestPayload] === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(step.id, option.value)}
                    className={`group relative rounded-xl sm:rounded-2xl border-2 sm:border-4 border-black p-2.5 sm:p-5 text-left transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                      isSelected
                        ? 'bg-yellow-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                        : 'bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5'
                    }`}
                  >
                    <div className={`inline-flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl border-2 sm:border-4 border-black ${option.color} mb-1.5 sm:mb-2.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-0.5 group-hover:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:group-hover:shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] transition-all`}>
                      {option.icon}
                    </div>
                    <h3 className="text-xs sm:text-lg font-black text-black leading-tight">{option.label}</h3>
                    <p className="mt-0.5 text-[0.6rem] sm:text-sm font-bold text-black/55 leading-snug hidden xs:block">{option.desc}</p>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 flex h-5 w-5 sm:h-8 sm:w-8 items-center justify-center rounded-full border-[1.5px] sm:border-2 border-black bg-green-400 text-[0.55rem] sm:text-sm font-black">
                        ✓
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-3.5 sm:mt-6">
            <Button
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              disabled={currentStep === 0}
              variant="outline"
              className="h-8 sm:h-12 rounded-full border-2 sm:border-4 border-black px-3 sm:px-6 text-[0.62rem] sm:text-sm font-black uppercase tracking-[0.1em] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-30 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-5 sm:w-5" /> Back
            </Button>

            {currentStep === STEPS.length - 1 && allAnswered ? (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="h-8 sm:h-12 rounded-full border-2 sm:border-4 border-black bg-primary px-3.5 sm:px-8 text-[0.62rem] sm:text-base font-black uppercase tracking-[0.1em] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-orange-600 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="mr-1 h-3 w-3 sm:h-5 sm:w-5 animate-spin" /> Finding...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1 h-3 w-3 sm:h-5 sm:w-5" /> Find My Food
                  </>
                )}
              </Button>
            ) : currentStep < STEPS.length - 1 && answers[step.id as keyof RecommendRequestPayload] ? (
              <Button
                onClick={() => setCurrentStep((s) => s + 1)}
                className="h-8 sm:h-12 rounded-full border-2 sm:border-4 border-black bg-black px-3.5 sm:px-8 text-[0.62rem] sm:text-base font-black uppercase tracking-[0.1em] text-white shadow-[2px_2px_0px_0px_var(--primary)] sm:shadow-[6px_6px_0px_0px_rgba(249,115,22,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              >
                Next <ArrowRight className="ml-1 h-3 w-3 sm:h-5 sm:w-5" />
              </Button>
            ) : (
              <div />
            )}
          </div>
        </div>

        {/* GEO Optimization: FAQ Section & Schema */}
        {!showResults && (
          <div className="mx-auto max-w-4xl mt-10 sm:mt-20 mb-8 sm:mb-12 px-1 sm:px-4 animate-slide-up">
            <div className="rounded-2xl sm:rounded-[2rem] border-2 sm:border-4 border-black bg-yellow-300 p-3.5 sm:p-6 md:p-10 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-sm sm:text-2xl font-black text-black mb-4 sm:mb-8 uppercase tracking-widest text-center">Frequently Asked Questions</h2>
              <div className="space-y-2.5 sm:space-y-4 text-left">
                {[
                  {
                    q: "How does the AI Food Recommender work?",
                    a: "According to StreetBite's algorithm, we match your current mood, spice tolerance, and budget with local vendors using real-time data and community reviews to suggest your perfect street food meal."
                  },
                  {
                    q: "Is the street food recommended safe and authentic?",
                    a: "Yes! Our database only pulls from actively vetted vendors who maintain high community trust ratings. Over 85% of our recommendations are authentic local gems rated 4-stars or higher by our foodie community."
                  },
                  {
                    q: "Do I earn rewards for finding food?",
                    a: "Absolutely! By simply using the StreetBite AI Food Recommender, you passively earn Niche XP (like Spice King or Night Owl points) which boosts your rank on the global Flavor Leaderboards."
                  }
                ].map((faq, idx) => {
                  const isOpen = activeFaq === idx
                  return (
                    <div
                      key={idx}
                      className="bg-white border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition-all duration-200"
                    >
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between gap-2.5 sm:gap-4 p-3 sm:p-6 text-left focus:outline-none"
                      >
                        <h3 className="text-[0.72rem] sm:text-base md:text-lg font-black text-black leading-snug break-words">
                          {faq.q}
                        </h3>
                        <div className="shrink-0 flex h-5 w-5 sm:h-8 sm:w-8 items-center justify-center rounded-full border-[1.5px] sm:border-2 border-black bg-yellow-300 text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                          {isOpen ? <Minus className="h-3 w-3 sm:h-4 sm:w-4 stroke-[3px]" /> : <Plus className="h-3 w-3 sm:h-4 sm:w-4 stroke-[3px]" />}
                        </div>
                      </button>
                      
                      <div
                        className={`transition-all duration-300 ease-in-out ${
                          isOpen ? 'max-h-[300px] border-t-[1.5px] sm:border-t-4 border-black p-3 sm:p-6 bg-orange-50/50' : 'max-h-0 pointer-events-none'
                        } overflow-hidden`}
                      >
                        <p className="text-[0.65rem] sm:text-sm md:text-base font-bold text-black/75 leading-relaxed break-words">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* JSON-LD for RAG/AI Search Engines */}
      <Script
        id="recommend-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How does the AI Food Recommender work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "According to StreetBite's algorithm, we match your current mood, spice tolerance, and budget with local vendors using real-time data and community reviews to suggest your perfect street food meal."
                }
              },
              {
                "@type": "Question",
                "name": "Is the street food recommended safe and authentic?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! Our database only pulls from actively vetted vendors who maintain high community trust ratings. Over 85% of our recommendations are authentic local gems rated 4-stars or higher by our foodie community."
                }
              },
              {
                "@type": "Question",
                "name": "Do I earn rewards for finding food?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolutely! By simply using the StreetBite AI Food Recommender, you passively earn Niche XP (like Spice King or Night Owl points) which boosts your rank on the global Flavor Leaderboards."
                }
              }
            ]
          })
        }}
      />

      <Footer />
    </div>
  )
}
