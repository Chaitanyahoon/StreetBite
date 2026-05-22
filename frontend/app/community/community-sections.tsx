'use client'

import Image from 'next/image'
import { Award, Flame, Heart, Loader2, MapPin, MessageSquare, Send, ShieldCheck, Share2, Star, UtensilsCrossed, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { type Discussion, type TopicFormState } from './community-helpers'

interface CommunityAnnouncement {
  message: string
  type?: string
}

interface CommunitySidebarProps {
  authIsLoggedIn: boolean
  vendor: any
  handleVendorClick: () => void
  signInHref?: string
  leaderboard: React.ReactNode
  userStats: React.ReactNode
}

interface TopicSubmissionDialogProps {
  isOpen: boolean
  isSubmitting: boolean
  isLocationLoading: boolean
  topicForm: TopicFormState
  onOpenChange: (open: boolean) => void
  onTopicFormChange: (value: TopicFormState) => void
  onUseCurrentLocation: () => void
  onSubmit: (e: React.FormEvent) => void
}

interface DiscussionModalProps {
  authUser: any
  hasLiked: boolean
  newComment: string
  selectedDiscussion: Discussion | null
  isSubmittingComment?: boolean
  onClose: () => void
  onCommentChange: (value: string) => void
  onLike: () => void
  onPostComment: () => void
  onShare: () => void
}

const formatDiscussionDate = (createdAt?: string | null) => {
  if (!createdAt) {
    return 'Recently'
  }

  return new Date(createdAt).toLocaleDateString()
}

export function CommunityAnnouncementsBanner({ announcements }: { announcements: CommunityAnnouncement[] }) {
  if (!announcements.length) return null

  return (
    <div className="bg-red-500 text-white rounded-[1.5rem] sm:rounded-2xl p-4 sm:p-6 border-2.5 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden animate-slide-up">
      <div className="absolute top-0 right-0 p-4 opacity-20 hidden xs:block">
        <ShieldCheck className="w-16 h-16 sm:w-24 sm:h-24" />
      </div>
      <h2 className="text-lg sm:text-2xl font-black uppercase mb-3 sm:mb-4 flex items-center gap-2 relative z-10">
        <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" /> Official Announcements
      </h2>
      <div className="space-y-3 sm:space-y-4 relative z-10">
        {announcements.map((announcement, idx) => (
          <div
            key={`${announcement.message}-${idx}`}
            className="bg-white text-black p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 border-black flex gap-2 sm:gap-3 text-xs sm:text-sm md:text-base font-bold hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            {announcement.type === 'ALERT' ? (
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
            ) : (
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 shrink-0" />
            )}
            <p className="leading-snug">{announcement.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CommunityHallOfFameCard({ signInHref = '/signin' }: { signInHref?: string }) {
  return (
    <Card className="border-2.5 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-5 sm:p-8 text-center relative overflow-hidden group rounded-[1.5rem] sm:rounded-[2rem]">
      <div className="absolute top-0 left-0 w-full h-3 sm:h-4 bg-gradient-to-r from-orange-400 to-red-500 border-b-2.5 sm:border-b-4 border-black"></div>
      <div className="w-14 h-14 sm:w-20 sm:h-20 bg-yellow-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:rotate-6 transition-transform duration-300 border-2.5 sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <Award className="w-6 h-6 sm:w-10 sm:h-10 text-black" />
      </div>
      <h3 className="font-black text-lg sm:text-2xl mb-1 sm:mb-2 text-black leading-none uppercase">
        Join The <br className="hidden sm:inline" /> Hall of Fame
      </h3>
      <p className="text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm font-bold leading-relaxed px-2 sm:px-4">
        Compete with top foodies, earn XP, and unlock exclusive badges!
      </p>
      <Button
        className="w-full bg-black text-white hover:bg-orange-500 font-black border-2.5 sm:border-4 border-black shadow-[3px_3px_0px_0px_#9ca3af] hover:shadow-[3px_3px_0px_0px_#000000] sm:shadow-[4px_4px_0px_0px_#9ca3af] sm:hover:shadow-[4px_4px_0px_0px_#000000] rounded-lg sm:rounded-xl h-10 sm:h-12 text-sm sm:text-base uppercase cursor-pointer"
        onClick={() => { window.location.href = signInHref }}
      >
        Sign In to Play
      </Button>
    </Card>
  )
}

function VendorSpotlightCard({ vendor, onViewProfile }: { vendor: any; onViewProfile: () => void }) {
  return (
    <Card className="border-2.5 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#000] text-white overflow-hidden relative rounded-[1.5rem] sm:rounded-[2rem]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gray-800 rounded-full opacity-50 -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gray-800 rounded-full opacity-50 -ml-12 -mb-12"></div>

      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 relative z-10 border-b-2 border-gray-800">
        <CardTitle className="text-base sm:text-lg font-black uppercase tracking-wider flex items-center gap-2 text-yellow-400">
          <Award className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          Vendor Spotlight
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-6">
          <div className="w-full aspect-video bg-white rounded-lg sm:rounded-xl flex items-center justify-center border-2 sm:border-4 border-white overflow-hidden relative group">
            {vendor?.displayImageUrl ? (
              <Image
                src={vendor.displayImageUrl}
                alt={vendor.name}
                fill
                sizes="(max-width: 1024px) 100vw, 320px"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                unoptimized
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-yellow-400 opacity-20 group-hover:opacity-0 transition-opacity"></div>
                <div className="flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-xl sm:rounded-[2rem] border-2 sm:border-4 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <UtensilsCrossed className="h-8 w-8 sm:h-12 sm:w-12 text-orange-500" strokeWidth={2.7} />
                </div>
              </>
            )}
          </div>
          <div>
            <h4 className="font-black text-xl sm:text-2xl mb-1 sm:mb-2 leading-tight">{vendor?.name || 'Loading...'}</h4>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-gray-300 text-xs sm:text-sm font-bold">
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 shrink-0" />
                <span className="line-clamp-1">{vendor?.address || 'Unknown Location'}</span>
              </div>
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-600 rounded-full shrink-0 hidden xs:inline-block"></span>
              <span className="inline-flex items-center gap-1 text-yellow-400 shrink-0">
                <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                {vendor?.rating ? vendor.rating.toFixed(1) : 'New'}
              </span>
            </div>
          </div>
          <Button
            className="w-full font-black bg-white text-black hover:bg-yellow-400 border-none h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm sm:text-lg uppercase tracking-wide cursor-pointer"
            onClick={onViewProfile}
          >
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function CommunitySidebar({
  authIsLoggedIn,
  vendor,
  handleVendorClick,
  signInHref,
  leaderboard,
  userStats,
}: CommunitySidebarProps) {
  return (
    <div className="lg:col-span-4 space-y-6 sm:space-y-8 px-4 sm:px-0">
      <details className="lg:hidden border-2.5 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white group">
        <summary className="cursor-pointer list-none px-4 py-3 border-b-2.5 border-black bg-yellow-200 font-black uppercase tracking-wider text-sm flex items-center justify-between select-none [&::-webkit-details-marker]:hidden">
          <span>Community toolbox</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 border-2 border-black rounded bg-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">TAP</span>
            <ChevronDown className="w-4 h-4 transition-transform duration-200 group-open:rotate-180 text-black border-2 border-black rounded-md bg-white shrink-0 p-0.5 box-content" />
          </div>
        </summary>
        <div className="p-4 space-y-5 bg-gray-50">
          {authIsLoggedIn ? (
            <>
              <div className="border-2.5 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                {userStats}
              </div>
              <div className="border-2.5 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                {leaderboard}
              </div>
            </>
          ) : (
            <CommunityHallOfFameCard signInHref={signInHref} />
          )}

          <VendorSpotlightCard vendor={vendor} onViewProfile={handleVendorClick} />
        </div>
      </details>

      <div className="sticky top-24 space-y-8 hidden lg:block">
        {authIsLoggedIn ? (
          <>
            <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
              {userStats}
            </div>
            <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
              {leaderboard}
            </div>
          </>
        ) : (
          <CommunityHallOfFameCard signInHref={signInHref} />
        )}

        <VendorSpotlightCard vendor={vendor} onViewProfile={handleVendorClick} />
      </div>
    </div>
  )
}

export function TopicSubmissionDialog({
  isOpen,
  isSubmitting,
  isLocationLoading,
  topicForm,
  onOpenChange,
  onTopicFormChange,
  onUseCurrentLocation,
  onSubmit,
}: TopicSubmissionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[92vw] sm:w-full max-h-[92vh] overflow-y-auto border-2 sm:border-4 border-black rounded-[1.5rem] sm:rounded-[2rem] shadow-[3.5px_3.5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-tight">Start a Topic</DialogTitle>
            <DialogDescription className="font-bold text-xs sm:text-sm text-gray-600">
              Topics are reviewed before going live. You can post up to 3 topics every 24 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-black">Topic Title</label>
              <Input
                value={topicForm.title}
                onChange={(e) => onTopicFormChange({ ...topicForm, title: e.target.value })}
                placeholder="Ask the community your boldest food question"
                className="border-2 sm:border-4 border-black rounded-lg sm:rounded-xl h-9 sm:h-11 text-xs sm:text-sm font-bold focus-visible:ring-0 focus-visible:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                minLength={8}
                maxLength={140}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-black">Details</label>
              <Textarea
                value={topicForm.content}
                onChange={(e) => onTopicFormChange({ ...topicForm, content: e.target.value })}
                placeholder="Share context, the location, or why this matters."
                className="min-h-[80px] sm:min-h-[120px] border-2 sm:border-4 border-black rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold focus-visible:ring-0 focus-visible:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                minLength={20}
                maxLength={800}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-black">Image URL (Optional)</label>
              <Input
                value={topicForm.imageUrl}
                onChange={(e) => onTopicFormChange({ ...topicForm, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="border-2 sm:border-4 border-black rounded-lg sm:rounded-xl h-9 sm:h-11 text-xs sm:text-sm font-bold focus-visible:ring-0 focus-visible:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-black">City (Optional)</label>
              <Input
                value={topicForm.cityName}
                onChange={(e) => onTopicFormChange({ ...topicForm, cityName: e.target.value })}
                placeholder="Mumbai, Pune, Bengaluru..."
                className="border-2 sm:border-4 border-black rounded-lg sm:rounded-xl h-9 sm:h-11 text-xs sm:text-sm font-bold focus-visible:ring-0 focus-visible:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-black">Latitude (Optional)</label>
                <Input
                  value={topicForm.latitude}
                  onChange={(e) => onTopicFormChange({ ...topicForm, latitude: e.target.value })}
                  placeholder="19.0760"
                  className="border-2 sm:border-4 border-black rounded-lg sm:rounded-xl h-9 sm:h-11 text-xs sm:text-sm font-bold focus-visible:ring-0 focus-visible:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-black">Longitude (Optional)</label>
                <Input
                  value={topicForm.longitude}
                  onChange={(e) => onTopicFormChange({ ...topicForm, longitude: e.target.value })}
                  placeholder="72.8777"
                  className="border-2 sm:border-4 border-black rounded-lg sm:rounded-xl h-9 sm:h-11 text-xs sm:text-sm font-bold focus-visible:ring-0 focus-visible:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={onUseCurrentLocation}
                disabled={isLocationLoading}
                className="h-9 sm:h-10 border-2 border-black rounded-lg sm:rounded-xl font-black uppercase text-xs tracking-wider"
              >
                {isLocationLoading ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Locating
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Use Current Location
                  </span>
                )}
              </Button>
            </div>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-black/60">
              Add both latitude and longitude if you include coordinates.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 pt-2 sm:pt-4 border-t-2 border-dashed border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-2 sm:border-4 border-black rounded-lg sm:rounded-xl font-black uppercase h-9 sm:h-11 text-xs sm:text-sm cursor-pointer active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-black text-white font-black uppercase border-2 sm:border-4 border-black h-9 sm:h-11 rounded-lg sm:rounded-xl shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none transition-all text-xs sm:text-sm cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Submitting
                </span>
              ) : (
                'Submit for Review'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function DiscussionModal({
  authUser,
  hasLiked,
  newComment,
  selectedDiscussion,
  isSubmittingComment,
  onClose,
  onCommentChange,
  onLike,
  onPostComment,
  onShare,
}: DiscussionModalProps) {
  if (!selectedDiscussion) return null

  const hasCoordinates =
    typeof selectedDiscussion.latitude === 'number' &&
    typeof selectedDiscussion.longitude === 'number'
  const locationLabel = selectedDiscussion.cityName?.trim()
    ? selectedDiscussion.cityName.trim()
    : hasCoordinates
      ? `${selectedDiscussion.latitude!.toFixed(4)}, ${selectedDiscussion.longitude!.toFixed(4)}`
      : null

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-[1.5rem] sm:rounded-[2rem] max-w-2xl w-full h-[90vh] sm:h-auto sm:max-h-[92vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border-2.5 sm:border-4 border-black flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2.5 right-2.5 xs:top-4 xs:right-4 z-20 text-white bg-black/40 hover:bg-black/60 rounded-full w-8 h-8 flex items-center justify-center border border-white/20"
          onClick={onClose}
        >
          <X className="w-4 h-4 xs:w-5 xs:h-5" />
        </Button>

        <div className="bg-orange-500 text-white p-4 xs:p-5 sm:p-8 relative overflow-hidden border-b-2.5 sm:border-b-4 border-black flex-shrink-0">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

          <div className="relative z-10 flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 bg-black rounded-xl sm:rounded-2xl flex items-center justify-center border-2 sm:border-4 border-white shadow-[2px_2px_rgba(0,0,0,0.2)] sm:shadow-[4px_4px_rgba(0,0,0,0.2)] shrink-0">
              <MessageSquare className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-xs font-bold text-black/80">
                <span className="bg-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg border-1.5 sm:border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[10px] sm:text-xs">
                  @{selectedDiscussion.createdByDisplayName || 'StreetBiteTeam'}
                </span>
                <span className="text-white text-[10px] sm:text-xs shrink-0">• {formatDiscussionDate(selectedDiscussion.createdAt)}</span>
              </div>
              {locationLabel && (
                <div className="mb-1.5 inline-flex items-center gap-1 rounded-full border-1.5 sm:border-2 border-black bg-white px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-black">
                  <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span className="line-clamp-1">{locationLabel}</span>
                </div>
              )}
              <h3 className="text-base xs:text-xl sm:text-3xl font-black leading-tight drop-shadow-md mb-1 sm:mb-2 line-clamp-2">{selectedDiscussion.title}</h3>
              <p className="text-white/95 font-medium text-[11px] xs:text-xs sm:text-lg line-clamp-2 xs:line-clamp-3 overflow-y-auto max-h-[50px] sm:max-h-[80px]">{selectedDiscussion.content}</p>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap gap-1.5 sm:gap-3 w-full">
            <button
              onClick={onLike}
              className={`flex items-center gap-1 px-2.5 xs:px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] xs:text-xs sm:text-sm font-black uppercase tracking-wider transition-all border-2 border-black shadow-[1.5px_1.5px_rgba(0,0,0,1)] sm:shadow-[4px_4px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none cursor-pointer ${
                hasLiked ? 'bg-pink-500 text-white' : 'bg-white text-black'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${hasLiked ? 'fill-current' : ''}`} />
              <span>{selectedDiscussion.likes?.length || 0} LIKES</span>
            </button>
            <button
              onClick={onShare}
              className="flex items-center gap-1 px-2.5 xs:px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] xs:text-xs sm:text-sm font-black uppercase tracking-wider transition-all border-2 border-black bg-white text-black shadow-[1.5px_1.5px_rgba(0,0,0,1)] sm:shadow-[4px_4px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Share</span>
            </button>
            <div className="flex items-center gap-1 px-2.5 xs:px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-black/20 text-[10px] xs:text-xs sm:text-sm font-black text-white border-2 border-white/30 backdrop-blur-sm shrink-0">
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{selectedDiscussion.comments?.length || 0} replies</span>
            </div>
          </div>
        </div>

        <div className="p-3 xs:p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto space-y-3 sm:space-y-4 bg-gray-50">
          <div className="sticky top-0 z-10 -mx-3 xs:-mx-4 sm:-mx-6 mb-2 border-b-2 border-black bg-gray-50 px-3 xs:px-4 sm:px-6 pb-2 pt-1">
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.16em] text-black/60">
              Newest replies first
            </p>
          </div>
          {(selectedDiscussion.comments ?? []).slice().reverse().map((comment: any) => (
            <div key={comment.id} className="p-2.5 sm:p-4 bg-white rounded-xl border-2 border-black shadow-[1.5px_1.5px_0px_0px_#e5e7eb] sm:shadow-[4px_4px_0px_0px_#e5e7eb]">
              <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border-2 border-black flex items-center justify-center text-xs sm:text-sm font-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      comment.user?.id === authUser?.id ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {(comment.user?.displayName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-black text-2xs sm:text-xs text-black uppercase">@{comment.user?.displayName || 'Unknown'}</div>
                    <div className="text-[8px] sm:text-[9px] text-gray-500 font-bold">{new Date(comment.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
              <p className="text-xs xs:text-sm sm:text-base font-medium text-gray-800 leading-relaxed">{comment.content}</p>
            </div>
          ))}
          {(!selectedDiscussion.comments || selectedDiscussion.comments.length === 0) && (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm font-bold">No comments yet. Be the first to yap!</p>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 bg-white border-t-2.5 sm:border-t-4 border-black flex-shrink-0">
          <div className="flex gap-2 sm:gap-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => onCommentChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isSubmittingComment) {
                  e.preventDefault()
                  onPostComment()
                }
              }}
              disabled={isSubmittingComment}
              placeholder="Add a comment..."
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 sm:border-4 border-black font-bold placeholder:text-gray-400 focus:ring-0 focus:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs sm:text-sm bg-white transition-all disabled:bg-gray-100 disabled:text-gray-500"
            />
            <Button
              onClick={onPostComment}
              disabled={!newComment.trim() || isSubmittingComment}
              className="h-auto px-4 sm:px-6 rounded-lg sm:rounded-xl bg-orange-500 hover:bg-orange-600 text-white border-2 sm:border-4 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmittingComment ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>
          </div>
          <p className="mt-1.5 text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.14em] text-black/50">
            Tip: Press Enter to send
          </p>
        </div>
      </div>
    </div>
  )
}
