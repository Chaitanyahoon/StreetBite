'use client'

import Image from 'next/image'
import { Award, Flame, Heart, Loader2, MapPin, MessageSquare, Search, Send, ShieldCheck, Star, UtensilsCrossed, X } from 'lucide-react'
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
  onClose: () => void
  onCommentChange: (value: string) => void
  onLike: () => void
  onPostComment: () => void
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
    <div className="bg-red-500 text-white rounded-2xl p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden animate-slide-up">
      <div className="absolute top-0 right-0 p-4 opacity-20">
        <ShieldCheck className="w-24 h-24" />
      </div>
      <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2 relative z-10">
        <ShieldCheck className="w-6 h-6" /> Official Announcements
      </h2>
      <div className="space-y-4 relative z-10">
        {announcements.map((announcement, idx) => (
          <div
            key={`${announcement.message}-${idx}`}
            className="bg-white text-black p-4 rounded-xl border-2 border-black flex gap-3 font-bold hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            {announcement.type === 'ALERT' ? (
              <Flame className="w-5 h-5 text-red-500 shrink-0" />
            ) : (
              <Star className="w-5 h-5 text-orange-500 shrink-0" />
            )}
            <p>{announcement.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CommunityHallOfFameCard({ signInHref = '/signin' }: { signInHref?: string }) {
  return (
    <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 text-center relative overflow-hidden group rounded-[2rem]">
      <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-orange-400 to-red-500 border-b-4 border-black"></div>
      <div className="w-20 h-20 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform duration-300 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <Award className="w-10 h-10 text-black" />
      </div>
      <h3 className="font-black text-2xl mb-2 text-black leading-none">
        JOIN THE <br /> HALL OF FAME
      </h3>
      <p className="text-gray-600 mb-6 text-sm font-bold leading-relaxed px-4">
        Compete with top foodies, earn XP, and unlock exclusive badges!
      </p>
      <Button
        className="w-full bg-black text-white hover:bg-orange-500 font-black border-4 border-black shadow-[4px_4px_0px_0px_#9ca3af] hover:shadow-[4px_4px_0px_0px_#000000] rounded-xl h-12 uppercase"
        onClick={() => { window.location.href = signInHref }}
      >
        Sign In to Play
      </Button>
    </Card>
  )
}

function VendorSpotlightCard({ vendor, onViewProfile }: { vendor: any; onViewProfile: () => void }) {
  return (
    <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#000] text-white overflow-hidden relative rounded-[2rem]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gray-800 rounded-full opacity-50 -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gray-800 rounded-full opacity-50 -ml-12 -mb-12"></div>

      <CardHeader className="pb-4 relative z-10 border-b-2 border-gray-800">
        <CardTitle className="text-lg font-black uppercase tracking-wider flex items-center gap-2 text-yellow-400">
          <Award className="w-5 h-5" />
          Vendor Spotlight
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 p-6">
        <div className="space-y-6">
          <div className="w-full aspect-video bg-white rounded-xl flex items-center justify-center border-4 border-white overflow-hidden relative group">
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
                <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <UtensilsCrossed className="h-12 w-12 text-orange-500" strokeWidth={2.7} />
                </div>
              </>
            )}
          </div>
          <div>
            <h4 className="font-black text-2xl mb-2">{vendor?.name || 'Loading...'}</h4>
            <div className="flex items-center gap-3 text-gray-300 text-sm font-bold">
              <div className="flex items-center gap-1 shrink-0">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span className="line-clamp-1">{vendor?.address || 'Unknown Location'}</span>
              </div>
              <span className="w-1.5 h-1.5 bg-gray-600 rounded-full shrink-0"></span>
              <span className="inline-flex items-center gap-1 text-yellow-400 shrink-0">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {vendor?.rating ? vendor.rating.toFixed(1) : 'New'}
              </span>
            </div>
          </div>
          <Button
            className="w-full font-black bg-white text-black hover:bg-yellow-400 border-none h-12 rounded-xl text-lg uppercase tracking-wide"
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
    <div className="lg:col-span-4 space-y-8">
      <details className="lg:hidden border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
        <summary className="cursor-pointer list-none px-6 py-4 border-b-4 border-black bg-yellow-200 font-black uppercase tracking-wider">
          Community toolbox
        </summary>
        <div className="p-6 space-y-6">
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
      <DialogContent className="max-w-xl border-4 border-black rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <form onSubmit={onSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Start a Topic</DialogTitle>
            <DialogDescription className="font-bold text-gray-600">
              Topics are reviewed before going live. You can post up to 3 topics every 24 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-black">Topic Title</label>
              <Input
                value={topicForm.title}
                onChange={(e) => onTopicFormChange({ ...topicForm, title: e.target.value })}
                placeholder="Ask the community your boldest food question"
                className="border-4 border-black rounded-xl h-12 font-bold focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                minLength={8}
                maxLength={140}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-black">Details</label>
              <Textarea
                value={topicForm.content}
                onChange={(e) => onTopicFormChange({ ...topicForm, content: e.target.value })}
                placeholder="Share context, the location, or why this matters."
                className="min-h-[140px] border-4 border-black rounded-xl font-bold focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                minLength={20}
                maxLength={800}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-black">Image URL (Optional)</label>
              <Input
                value={topicForm.imageUrl}
                onChange={(e) => onTopicFormChange({ ...topicForm, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="border-4 border-black rounded-xl h-12 font-bold focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-black">City (Optional)</label>
              <Input
                value={topicForm.cityName}
                onChange={(e) => onTopicFormChange({ ...topicForm, cityName: e.target.value })}
                placeholder="Mumbai, Pune, Bengaluru..."
                className="border-4 border-black rounded-xl h-12 font-bold focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-black">Latitude (Optional)</label>
                <Input
                  value={topicForm.latitude}
                  onChange={(e) => onTopicFormChange({ ...topicForm, latitude: e.target.value })}
                  placeholder="19.0760"
                  className="border-4 border-black rounded-xl h-12 font-bold focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-black">Longitude (Optional)</label>
                <Input
                  value={topicForm.longitude}
                  onChange={(e) => onTopicFormChange({ ...topicForm, longitude: e.target.value })}
                  placeholder="72.8777"
                  className="border-4 border-black rounded-xl h-12 font-bold focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onUseCurrentLocation}
                disabled={isLocationLoading}
                className="h-10 border-2 border-black rounded-xl font-black uppercase tracking-[0.12em]"
              >
                {isLocationLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Locating
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Use Current Location
                  </span>
                )}
              </Button>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/60">
              Add both latitude and longitude if you include coordinates.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-4 border-black rounded-xl font-black uppercase h-12"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-black text-white font-black uppercase border-4 border-black h-12 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
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
  onClose,
  onCommentChange,
  onLike,
  onPostComment,
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
        className="relative bg-white rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border-4 border-black"
        onClick={(e) => e.stopPropagation()}
      >
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-10 text-white hover:bg-black/20 rounded-full" onClick={onClose}>
          <X className="w-6 h-6" />
        </Button>

        <div className="bg-orange-500 text-white p-8 relative overflow-hidden border-b-4 border-black">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

          <div className="relative z-10 flex items-start gap-4 mb-6">
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center border-4 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 text-sm font-bold text-black/80">
                <span className="bg-white px-3 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  @{selectedDiscussion.createdByDisplayName || 'StreetBiteTeam'}
                </span>
                <span className="text-white">• {formatDiscussionDate(selectedDiscussion.createdAt)}</span>
              </div>
              {locationLabel && (
                <div className="mb-2 inline-flex items-center gap-1 rounded-full border-2 border-black bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-black">
                  <MapPin className="h-3 w-3" />
                  {locationLabel}
                </div>
              )}
              <h3 className="text-3xl font-black leading-tight drop-shadow-md mb-2">{selectedDiscussion.title}</h3>
              <p className="text-white/90 font-medium text-lg">{selectedDiscussion.content}</p>
            </div>
          </div>

          <div className="relative z-10 flex gap-4">
            <button
              onClick={onLike}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-black uppercase tracking-wider transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none ${
                hasLiked ? 'bg-pink-500 text-white' : 'bg-white text-black'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
              <span>{selectedDiscussion.likes?.length || 0} LIKES</span>
            </button>
            <div className="flex items-center gap-2 px-6 py-2 rounded-xl bg-black/20 text-sm font-black text-white border-2 border-white/30 backdrop-blur-sm">
              <MessageSquare className="w-4 h-4" />
              <span>{selectedDiscussion.comments?.length || 0} replies</span>
            </div>
          </div>
        </div>

        <div className="p-6 max-h-[400px] overflow-y-auto space-y-4 bg-gray-50">
          <div className="sticky top-0 z-10 -mx-6 mb-2 border-b-2 border-black bg-gray-50 px-6 pb-2 pt-1">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-black/60">
              Newest replies first
            </p>
          </div>
          {selectedDiscussion.comments?.slice().reverse().map((comment: any) => (
            <div key={comment.id} className="p-4 bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#e5e7eb]">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center text-sm font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      comment.user?.id === authUser?.id ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {(comment.user?.displayName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-black text-sm text-black uppercase">@{comment.user?.displayName || 'Unknown'}</div>
                    <div className="text-[10px] text-gray-500 font-bold">{new Date(comment.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
              <p className="text-base font-medium text-gray-800 leading-relaxed">{comment.content}</p>
            </div>
          ))}
          {(!selectedDiscussion.comments || selectedDiscussion.comments.length === 0) && (
            <div className="text-center py-10 text-gray-400">
              <p>No comments yet. Be the first to yap!</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t-4 border-black">
          <div className="flex gap-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => onCommentChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onPostComment()
                }
              }}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-3 rounded-xl border-4 border-black font-bold placeholder:text-gray-400 focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm bg-white transition-all"
            />
            <Button
              onClick={onPostComment}
              disabled={!newComment.trim()}
              className="h-auto px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-black/50">
            Tip: Press Enter to send
          </p>
        </div>
      </div>
    </div>
  )
}
