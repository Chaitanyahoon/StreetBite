'use client'

import { Camera, CalendarDays, Gamepad2, type LucideIcon } from 'lucide-react'

export type TopicSort = 'newest' | 'most_liked' | 'most_active' | 'distance'
export type TopicMode = 'all' | 'live' | 'unanswered' | 'debate' | 'nearby'
export type CommunityTabId = 'games' | 'photos' | 'events'

export interface DiscussionUser {
  id?: string | number
  displayName?: string
}

export interface DiscussionLike {
  user?: DiscussionUser
}

export interface DiscussionComment {
  id: string | number
  content: string
  createdAt?: string
  user?: DiscussionUser
}

export interface Discussion {
  id: string | number
  title: string
  content: string
  createdAt?: string
  createdByDisplayName?: string
  cityName?: string
  latitude?: number | null
  longitude?: number | null
  likes?: DiscussionLike[]
  comments?: DiscussionComment[]
}

export interface UserCoordinates {
  latitude: number
  longitude: number
}

export interface CommunityTab {
  id: CommunityTabId
  label: string
  icon: LucideIcon
}

export interface TopicFormState {
  title: string
  content: string
  imageUrl: string
  cityName: string
  latitude: string
  longitude: string
}

export const EMPTY_TOPIC_FORM: TopicFormState = {
  title: '',
  content: '',
  imageUrl: '',
  cityName: '',
  latitude: '',
  longitude: '',
}

export const COMMUNITY_TABS: CommunityTab[] = [
  { id: 'games', label: 'Games', icon: Gamepad2 },
  { id: 'photos', label: 'Photos', icon: Camera },
  { id: 'events', label: 'Events', icon: CalendarDays },
]

export const TOPIC_SORT_OPTIONS: Array<{ id: TopicSort; label: string }> = [
  { id: 'newest', label: 'Newest' },
  { id: 'most_active', label: 'Most active' },
  { id: 'most_liked', label: 'Most liked' },
  { id: 'distance', label: 'Nearest' },
]

export const LIVE_MODE_WINDOW_MINUTES = 120

export const TOPIC_MODE_OPTIONS: Array<{ id: TopicMode; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live' },
  { id: 'unanswered', label: 'Unanswered' },
  { id: 'debate', label: 'Debate' },
  { id: 'nearby', label: 'Nearby' },
]

const NEARBY_CITY_TOKENS = [
  'mumbai',
  'pune',
  'nashik',
  'delhi',
  'new delhi',
  'bengaluru',
  'bangalore',
  'hyderabad',
  'chennai',
  'kolkata',
  'ahmedabad',
  'jaipur',
  'lucknow',
  'indore',
  'surat',
  'nagpur',
  'thane',
  'goa',
  'noida',
  'gurgaon',
  'gurugram',
] as const

const NEARBY_INTENT_TOKENS = ['near me', 'nearby', 'local', 'around me', 'my area', 'my city', 'close by'] as const
const NEARBY_LANDMARK_TOKENS = ['market', 'station', 'metro', 'road', 'lane', 'chowk', 'nagar', 'corner', 'street'] as const

export function countActiveTopics(discussions: Discussion[]): number {
  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000

  return discussions.filter((topic) => {
    const createdAt = topic.createdAt ? new Date(topic.createdAt).getTime() : 0
    const recentComment =
      topic.comments?.some((comment) => {
        const created = comment.createdAt ? new Date(comment.createdAt).getTime() : 0
        return created >= twentyFourHoursAgo
      }) ?? false

    return createdAt >= twentyFourHoursAgo || recentComment
  }).length
}

export function getLastActivity(discussion: Discussion): string {
  const lastActivity = getDiscussionLastActivityTimestamp(discussion)

  if (!lastActivity) {
    return 'No activity yet'
  }

  return new Date(lastActivity).toLocaleDateString()
}

export function getDiscussionLastActivityTimestamp(discussion: Discussion): number {
  const commentDates =
    discussion.comments
      ?.map((comment) => new Date(comment.createdAt ?? '').getTime())
      .filter((date) => !Number.isNaN(date)) ?? []

  const latestComment = commentDates.length ? Math.max(...commentDates) : 0
  const createdAt = discussion.createdAt ? new Date(discussion.createdAt).getTime() : 0
  return Math.max(latestComment, createdAt)
}

export function isDiscussionLive(
  discussion: Discussion,
  nowTimestamp: number = Date.now(),
  liveWindowMinutes: number = LIVE_MODE_WINDOW_MINUTES
): boolean {
  const lastActivity = getDiscussionLastActivityTimestamp(discussion)
  if (!lastActivity) {
    return false
  }

  const liveWindowMs = liveWindowMinutes * 60 * 1000
  return nowTimestamp - lastActivity <= liveWindowMs
}

export function isDebateDiscussion(discussion: Discussion): boolean {
  const likesCount = discussion.likes?.length || 0
  const commentsCount = discussion.comments?.length || 0
  const text = `${discussion.title} ${discussion.content}`.toLowerCase()

  const debateKeywords = [' vs ', ' versus ', ' or ', 'which', 'who wins', 'hot take', 'better', 'best']
  const hasDebateKeyword = debateKeywords.some((keyword) => text.includes(keyword))
  const hasQuestionMark = text.includes('?')
  const hasDebateEngagement = commentsCount >= 2 && likesCount >= 1

  return hasDebateKeyword || (hasQuestionMark && commentsCount >= 1) || hasDebateEngagement
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180
}

export function getDebateSplit(discussion: Discussion): { left: number; right: number } {
  const seed = `${discussion.id}-${discussion.title}-${discussion.content}`
  let hash = 0

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  }

  const likesCount = discussion.likes?.length || 0
  const commentsCount = discussion.comments?.length || 0
  const engagementSkew = clamp(likesCount - commentsCount, -10, 10)
  const hashSkew = (hash % 31) - 15
  const left = clamp(50 + Math.round((engagementSkew + hashSkew) / 2), 30, 70)

  return { left, right: 100 - left }
}

export function getNearbySignal(discussion: Discussion): number {
  const text = `${discussion.title} ${discussion.content}`.toLowerCase()
  const normalizedCityName = discussion.cityName?.trim().toLowerCase() ?? ''
  const hasCoordinates = typeof discussion.latitude === 'number' && typeof discussion.longitude === 'number'

  const cityMatches = NEARBY_CITY_TOKENS.filter((token) => text.includes(token))
  const intentMatches = NEARBY_INTENT_TOKENS.filter((token) => text.includes(token))
  const landmarkMatches = NEARBY_LANDMARK_TOKENS.filter((token) => text.includes(token))

  let score = 0
  if (normalizedCityName) {
    score += 55
  }
  if (hasCoordinates) {
    score += 30
  }
  score += Math.min(cityMatches.length * 35, 70)
  score += Math.min(intentMatches.length * 20, 40)
  score += Math.min(landmarkMatches.length * 8, 24)

  if (text.includes('where') && (text.includes('best') || text.includes('good'))) {
    score += 12
  }

  return clamp(score, 0, 100)
}

export function getNearbyTags(discussion: Discussion, maxTags: number = 3): string[] {
  const text = `${discussion.title} ${discussion.content}`.toLowerCase()
  const tags: string[] = []
  const normalizedCityName = discussion.cityName?.trim()
  const hasCoordinates = typeof discussion.latitude === 'number' && typeof discussion.longitude === 'number'

  if (normalizedCityName) {
    tags.push(normalizedCityName.toLowerCase())
  }
  if (hasCoordinates) {
    tags.push('geo')
  }

  NEARBY_CITY_TOKENS.forEach((token) => {
    if (text.includes(token) && !tags.includes(token)) {
      tags.push(token)
    }
  })

  NEARBY_INTENT_TOKENS.forEach((token) => {
    if (text.includes(token) && !tags.includes(token)) {
      tags.push(token)
    }
  })

  NEARBY_LANDMARK_TOKENS.forEach((token) => {
    if (text.includes(token) && !tags.includes(token)) {
      tags.push(token)
    }
  })

  return tags.slice(0, maxTags)
}

export function isNearbyDiscussion(discussion: Discussion): boolean {
  return getNearbySignal(discussion) >= 28
}

export function getDiscussionDistanceKm(
  discussion: Discussion,
  userLocation: UserCoordinates | null
): number | null {
  if (!userLocation) {
    return null
  }

  const latitude = typeof discussion.latitude === 'number' ? discussion.latitude : null
  const longitude = typeof discussion.longitude === 'number' ? discussion.longitude : null
  if (latitude === null || longitude === null) {
    return null
  }

  const earthRadiusKm = 6371
  const deltaLat = toRadians(latitude - userLocation.latitude)
  const deltaLon = toRadians(longitude - userLocation.longitude)
  const userLatitudeRadians = toRadians(userLocation.latitude)
  const topicLatitudeRadians = toRadians(latitude)

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(userLatitudeRadians) *
      Math.cos(topicLatitudeRadians) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return earthRadiusKm * c
}

export function sortDiscussionsByDistance(
  discussions: Discussion[],
  userLocation: UserCoordinates | null
): Discussion[] {
  if (!userLocation) {
    return discussions
  }

  return [...discussions].sort((left, right) => {
    const leftDistance = getDiscussionDistanceKm(left, userLocation)
    const rightDistance = getDiscussionDistanceKm(right, userLocation)

    if (leftDistance !== null && rightDistance !== null) {
      if (Math.abs(leftDistance - rightDistance) > 0.05) {
        return leftDistance - rightDistance
      }
    } else if (leftDistance !== null) {
      return -1
    } else if (rightDistance !== null) {
      return 1
    }

    const leftSignal = getNearbySignal(left)
    const rightSignal = getNearbySignal(right)
    if (leftSignal !== rightSignal) {
      return rightSignal - leftSignal
    }

    const leftDate = left.createdAt ? new Date(left.createdAt).getTime() : 0
    const rightDate = right.createdAt ? new Date(right.createdAt).getTime() : 0
    return rightDate - leftDate
  })
}

export function filterDiscussionsByMode(
  discussions: Discussion[],
  topicMode: TopicMode,
  nowTimestamp: number = Date.now()
): Discussion[] {
  if (topicMode === 'live') {
    return discussions.filter((discussion) => isDiscussionLive(discussion, nowTimestamp))
  }

  if (topicMode === 'unanswered') {
    return discussions.filter((discussion) => (discussion.comments?.length || 0) === 0)
  }

  if (topicMode === 'debate') {
    return discussions.filter((discussion) => isDebateDiscussion(discussion))
  }

  if (topicMode === 'nearby') {
    return discussions.filter((discussion) => isNearbyDiscussion(discussion))
  }

  return discussions
}

export function getParticipantCount(discussion: Discussion): number {
  const participantIds = new Set<string>()

  discussion.likes?.forEach((like) => {
    if (like.user?.id) {
      participantIds.add(String(like.user.id))
    }
  })

  discussion.comments?.forEach((comment) => {
    if (comment.user?.id) {
      participantIds.add(String(comment.user.id))
    }
  })

  return participantIds.size
}

export function filterAndSortDiscussions(
  discussions: Discussion[],
  searchQuery: string,
  topicSort: TopicSort
): Discussion[] {
  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredDiscussions = normalizedQuery
    ? discussions.filter((discussion) => {
        const searchable = [
          discussion.title,
          discussion.content,
          discussion.cityName ?? '',
          discussion.createdByDisplayName ?? '',
        ]
          .join(' ')
          .toLowerCase()

        return searchable.includes(normalizedQuery)
      })
    : discussions

  return [...filteredDiscussions].sort((a, b) => {
    if (topicSort === 'most_liked') {
      return (b.likes?.length || 0) - (a.likes?.length || 0)
    }

    if (topicSort === 'most_active') {
      return (b.comments?.length || 0) - (a.comments?.length || 0)
    }

    if (topicSort === 'distance') {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bDate - aDate
    }

    const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return bDate - aDate
  })
}
