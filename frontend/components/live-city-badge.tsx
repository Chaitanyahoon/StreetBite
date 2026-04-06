"use client"

import { useState } from 'react'
import { Crosshair, MapPin, PencilLine } from 'lucide-react'
import { useCityName } from '@/hooks/use-city-name'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const QUICK_CITIES = ['Mumbai', 'Pune', 'Nashik', 'Delhi', 'Bengaluru', 'Hyderabad']

export function LiveCityBadge() {
  const {
    cityName,
    loading,
    error,
    isManualLocation,
    requestGeolocation,
    setManualLocationByCity,
  } = useCityName()
  const [isOpen, setIsOpen] = useState(false)
  const [manualCity, setManualCity] = useState(cityName)
  const [manualError, setManualError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const badgeText = loading ? 'LOCATING' : cityName?.trim() ? cityName : 'YOUR CITY'
  const statusText =
    error === 'Location permission denied'
      ? 'Location blocked'
      : isManualLocation
        ? 'Custom city'
        : cityName
          ? 'Location active'
          : 'Tap to choose'

  async function handleUseCurrentLocation() {
    setManualError(null)
    setIsSubmitting(true)
    const locationError = await requestGeolocation()
    setIsSubmitting(false)

    if (locationError) {
      setManualError(locationError)
      return
    }

    setIsOpen(false)
  }

  async function handleSaveCity(cityOverride?: string) {
    const nextCity = cityOverride ?? manualCity
    setManualCity(nextCity)
    setManualError(null)
    setIsSubmitting(true)
    const submitError = await setManualLocationByCity(nextCity)
    setIsSubmitting(false)

    if (submitError) {
      setManualError(submitError)
      return
    }

    setIsOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setManualCity(cityName || '')
          setManualError(null)
          setIsOpen(true)
        }}
        className="inline-flex items-center gap-3 rounded-full border-4 border-black bg-white px-6 py-3 text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 group -rotate-1"
        aria-label="Choose your city"
      >
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full border border-black bg-green-500"></span>
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-black uppercase tracking-wide text-black">
            Live in{' '}
            <span className="ml-1 rounded bg-black px-2 py-0.5 text-white transition-colors group-hover:bg-orange-500">
              {badgeText}
            </span>
          </span>
          <span className="mt-1 text-[0.62rem] font-black uppercase tracking-[0.22em] text-black/55">
            {statusText}
          </span>
        </span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[calc(100%-1.5rem)] rounded-[2rem] border-4 border-black bg-[#FFFBF0] p-0 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] sm:max-w-xl">
          <DialogHeader className="border-b-4 border-black bg-yellow-300 px-6 py-6">
            <DialogTitle className="text-3xl font-black uppercase tracking-tight text-black">
              Set your city
            </DialogTitle>
            <DialogDescription className="font-bold text-black/75">
              Use your current location or pick a city manually for better discovery.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 px-6 py-6">
            <div className="rounded-[1.5rem] border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-black/55">Current city</p>
              <div className="mt-3 flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-2xl font-black uppercase text-black">
                  {cityName || 'Not set'}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-black/65">
                {error === 'Location permission denied'
                  ? 'Browser location is blocked. You can still choose your city manually.'
                  : isManualLocation
                    ? 'You are currently using a manual city override.'
                    : 'We use this to personalize nearby vendors and offers.'}
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-[0.24em] text-black/55">
                Type your city
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  value={manualCity}
                  onChange={(event) => setManualCity(event.target.value)}
                  placeholder="Enter city name"
                  className="h-14 rounded-2xl border-4 border-black bg-white px-4 text-lg font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] placeholder:text-black/35 focus-visible:ring-0"
                />
                <Button
                  type="button"
                  onClick={() => handleSaveCity()}
                  disabled={isSubmitting}
                  className="h-14 rounded-2xl border-4 border-black bg-black px-6 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] hover:bg-primary"
                >
                  <PencilLine className="mr-2 h-4 w-4" />
                  Save city
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-black/55">Quick picks</p>
              <div className="flex flex-wrap gap-3">
                {QUICK_CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleSaveCity(city)}
                    disabled={isSubmitting}
                    className="rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 hover:bg-yellow-200 disabled:opacity-60"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {(manualError || error) && (
              <div className="rounded-2xl border-2 border-red-500 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {manualError || error}
              </div>
            )}
          </div>

          <DialogFooter className="border-t-4 border-black bg-white px-6 py-5">
            <Button
              type="button"
              variant="outline"
              onClick={handleUseCurrentLocation}
              disabled={isSubmitting}
              className="h-12 rounded-full border-4 border-black bg-white px-5 font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-200"
            >
              <Crosshair className="mr-2 h-4 w-4" />
              Use current location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
