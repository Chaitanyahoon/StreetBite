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
        className="inline-flex items-center gap-3 rounded-full border-4 border-black bg-white px-5 py-3 text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 group"
        aria-label="Choose your city"
      >
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full border border-black bg-green-500"></span>
        </span>
        <span className="flex flex-col leading-none">
          <span className="text-sm font-black uppercase tracking-[0.16em] text-black sm:text-base">
            Live in{' '}
            <span className="ml-1 inline-block rounded-md bg-black px-2.5 py-1 text-white transition-colors group-hover:bg-orange-500">
              {badgeText}
            </span>
          </span>
          <span className="mt-2 text-[0.58rem] font-black uppercase tracking-[0.28em] text-black/50">
            {statusText}
          </span>
        </span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[calc(100vh-1.5rem)] max-w-[calc(100%-1rem)] overflow-hidden rounded-[1.75rem] border-4 border-black bg-[#FFFBF0] p-0 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:max-w-[40rem]">
          <DialogHeader className="border-b-4 border-black bg-yellow-300 px-5 py-5 sm:px-6">
            <DialogTitle className="text-2xl font-black uppercase tracking-[-0.04em] text-black sm:text-3xl">
              Set your city
            </DialogTitle>
            <DialogDescription className="max-w-xl text-sm font-bold leading-6 text-black/70 sm:text-base">
              Use your current location or pick a city manually for better discovery.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            <div className="space-y-5">
              <div className="rounded-[1.5rem] border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-[0.68rem] font-black uppercase tracking-[0.24em] text-black/45">Current city</p>
                <div className="mt-3 flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-xl font-black uppercase text-black sm:text-2xl">
                    {cityName || 'Not set'}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-black/62">
                  {error === 'Location permission denied'
                    ? 'Browser location is blocked. You can still choose your city manually.'
                    : isManualLocation
                      ? 'You are currently using a manual city override.'
                      : 'We use this to personalize nearby vendors and offers.'}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <div className="space-y-2">
                  <label className="block text-[0.68rem] font-black uppercase tracking-[0.24em] text-black/45">
                    Type your city
                  </label>
                  <Input
                    value={manualCity}
                    onChange={(event) => setManualCity(event.target.value)}
                    placeholder="Enter city name"
                    className="h-14 rounded-2xl border-4 border-black bg-white px-4 text-base font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] placeholder:text-black/35 focus-visible:ring-0 sm:text-lg"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => handleSaveCity()}
                  disabled={isSubmitting}
                  className="h-14 rounded-2xl border-4 border-black bg-black px-5 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] hover:bg-primary sm:px-6"
                >
                  <PencilLine className="mr-2 h-4 w-4" />
                  Save city
                </Button>
              </div>

              <div className="space-y-3">
                <p className="text-[0.68rem] font-black uppercase tracking-[0.24em] text-black/45">Quick picks</p>
                <div className="flex flex-wrap gap-2.5">
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
          </div>

          <DialogFooter className="border-t-4 border-black bg-white px-5 py-4 sm:px-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleUseCurrentLocation}
              disabled={isSubmitting}
              className="h-12 rounded-full border-4 border-black bg-white px-5 font-black uppercase tracking-[0.14em] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-200 sm:ml-auto"
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
