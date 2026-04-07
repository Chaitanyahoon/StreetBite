'use client'

import { Camera, CalendarDays, Gamepad2, type LucideIcon } from 'lucide-react'

export type TopicSort = 'newest' | 'most_liked' | 'most_active'
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
  likes?: DiscussionLike[]
  comments?: DiscussionComment[]
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
}

export const EMPTY_TOPIC_FORM: TopicFormState = {
  title: '',
  content: '',
  imageUrl: '',
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
]

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
  const commentDates =
    discussion.comments
      ?.map((comment) => new Date(comment.createdAt ?? '').getTime())
      .filter((date) => !Number.isNaN(date)) ?? []

  const latestComment = commentDates.length ? Math.max(...commentDates) : 0
  const createdAt = discussion.createdAt ? new Date(discussion.createdAt).getTime() : 0
  const lastActivity = Math.max(latestComment, createdAt)

  if (!lastActivity) {
    return 'No activity yet'
  }

  return new Date(lastActivity).toLocaleDateString()
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
    ? discussions.filter((discussion) => discussion.title.toLowerCase().includes(normalizedQuery))
    : discussions

  return [...filteredDiscussions].sort((a, b) => {
    if (topicSort === 'most_liked') {
      return (b.likes?.length || 0) - (a.likes?.length || 0)
    }

    if (topicSort === 'most_active') {
      return (b.comments?.length || 0) - (a.comments?.length || 0)
    }

    const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return bDate - aDate
  })
}
