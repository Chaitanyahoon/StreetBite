'use client'

import { Suspense, useDeferredValue, useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { MessageSquare, Gamepad2, Search, Flame, Loader2, Heart, MapPin, Scale, Star, LocateFixed } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import {
    COMMUNITY_TABS,
    EMPTY_TOPIC_FORM,
    LIVE_MODE_WINDOW_MINUTES,
    TOPIC_MODE_OPTIONS,
    TOPIC_SORT_OPTIONS,
    countActiveTopics,
    getDebateSplit,
    filterDiscussionsByMode,
    filterAndSortDiscussions,
    getLastActivity,
    getNearbySignal,
    getNearbyTags,
    getDiscussionDistanceKm,
    getParticipantCount,
    sortDiscussionsByDistance,
    type CommunityTabId,
    type DiscussionComment,
    type Discussion,
    type TopicMode,
    type TopicFormState,
    type TopicSort,
    type UserCoordinates,
} from './community-helpers'
import {
    CommunityAnnouncementsBanner,
    CommunitySidebar,
    DiscussionModal,
    TopicSubmissionDialog,
} from './community-sections'

// Lazy-load heavy community widgets — only loaded when scrolled into view
const ZodiacCard = dynamic(() => import('@/components/ZodiacCard').then(m => m.ZodiacCard), { ssr: false, loading: () => <WidgetSkeleton /> })
const DailyPoll = dynamic(() => import('@/components/DailyPoll').then(m => m.DailyPoll), { ssr: false, loading: () => <WidgetSkeleton /> })
const VendorBattle = dynamic(() => import('@/components/VendorBattle').then(m => m.VendorBattle), { ssr: false, loading: () => <WidgetSkeleton /> })
const StreakTracker = dynamic(() => import('@/components/StreakTracker').then(m => m.StreakTracker), { ssr: false, loading: () => <WidgetSkeleton /> })
const PhotoWall = dynamic(() => import('@/components/PhotoWall').then(m => m.PhotoWall), { ssr: false, loading: () => <WidgetSkeleton /> })
const EventsCalendar = dynamic(() => import('@/components/EventsCalendar').then(m => m.EventsCalendar), { ssr: false, loading: () => <WidgetSkeleton /> })
const Leaderboard = dynamic(() => import('@/components/Leaderboard').then(m => m.Leaderboard), { ssr: false, loading: () => <WidgetSkeleton /> })
const FoodPersonalityQuiz = dynamic(() => import('@/components/FoodPersonalityQuiz').then(m => m.FoodPersonalityQuiz), { ssr: false, loading: () => <WidgetSkeleton /> })
const UserStats = dynamic(() => import('@/components/UserStats').then(m => m.UserStats), { ssr: false, loading: () => <WidgetSkeleton /> })
const CommunityMap = dynamic(() => import('@/components/CommunityMap').then(m => m.CommunityMap), { ssr: false, loading: () => <WidgetSkeleton h="h-64" /> })

function WidgetSkeleton({ h = 'h-48' }: { h?: string }) {
    return (
        <div className={`${h} w-full rounded-2xl bg-gray-100 border-4 border-gray-200 animate-pulse flex items-center justify-center`}>
            <div className="w-8 h-8 border-4 border-gray-300 border-t-orange-400 rounded-full animate-spin" />
        </div>
    )
}

import { useGamification } from '@/context/GamificationContext'
import { hotTopicApi, vendorApi, announcementApi } from '@/lib/api';
import { BreadcrumbListSchema } from '@/components/seo/breadcrumb-schema'

// ... existing imports ...

function CommunityPageContent() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { performAction } = useGamification()
    const { user: authUser, isLoggedIn: authIsLoggedIn, logout } = useAuth()
    const [vendor, setVendor] = useState<any>(null);
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [topicSort, setTopicSort] = useState<TopicSort>('newest');
    const [topicMode, setTopicMode] = useState<TopicMode>('all');
    const [activeTab, setActiveTab] = useState<CommunityTabId>('games');
    const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
    const [newComment, setNewComment] = useState('');
    const [hasLiked, setHasLiked] = useState(false);
    const [hotAnnouncements, setHotAnnouncements] = useState<any[]>([]);
    const [activeNowCount, setActiveNowCount] = useState(0);
    const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false);
    const [isSubmittingTopic, setIsSubmittingTopic] = useState(false);
    const [topicForm, setTopicForm] = useState<TopicFormState>(EMPTY_TOPIC_FORM);
    const [pendingTopicSubmissions, setPendingTopicSubmissions] = useState<Discussion[]>([]);
    const [isTopicsLoading, setIsTopicsLoading] = useState(true);
    const [topicsError, setTopicsError] = useState<string | null>(null);
    const [lastTopicsRefreshAt, setLastTopicsRefreshAt] = useState<Date | null>(null);
    const [hasInitializedUrlState, setHasInitializedUrlState] = useState(false);
    const [userLocation, setUserLocation] = useState<UserCoordinates | null>(null);
    const [isLocationLoading, setIsLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const topicsRequestIdRef = useRef(0);
    const discussionsRef = useRef<Discussion[]>([]);

    const isSameDiscussionId = (leftId: Discussion['id'], rightId: Discussion['id']) =>
        String(leftId) === String(rightId);

    const updateDiscussionById = (discussionId: Discussion['id'], updater: (discussion: Discussion) => Discussion) => {
        setDiscussions((previousDiscussions) =>
            previousDiscussions.map((discussion) =>
                isSameDiscussionId(discussion.id, discussionId) ? updater(discussion) : discussion
            )
        );
        setSelectedDiscussion((previousSelected) => {
            if (!previousSelected || !isSameDiscussionId(previousSelected.id, discussionId)) {
                return previousSelected;
            }
            return updater(previousSelected);
        });
    };

    useEffect(() => {
        discussionsRef.current = discussions;
    }, [discussions]);

    useEffect(() => {
        const tabParam = searchParams.get('tab')
        const sortParam = searchParams.get('sort')
        const modeParam = searchParams.get('mode')
        const queryParam = searchParams.get('q')

        const validTab = COMMUNITY_TABS.some((tab) => tab.id === tabParam)
            ? (tabParam as CommunityTabId)
            : null
        const validSort = TOPIC_SORT_OPTIONS.some((option) => option.id === sortParam)
            ? (sortParam as TopicSort)
            : null
        const validMode = TOPIC_MODE_OPTIONS.some((option) => option.id === modeParam)
            ? (modeParam as TopicMode)
            : null

        if (validTab) {
            setActiveTab((previous) => (previous === validTab ? previous : validTab))
        }

        if (validSort) {
            setTopicSort((previous) => (previous === validSort ? previous : validSort))
        }

        if (validMode) {
            setTopicMode((previous) => (previous === validMode ? previous : validMode))
        }

        const normalizedQuery = queryParam ?? ''
        setSearchQuery((previous) => (previous === normalizedQuery ? previous : normalizedQuery))

        if (!hasInitializedUrlState) {
            setHasInitializedUrlState(true)
        }
    }, [searchParams, hasInitializedUrlState])

    useEffect(() => {
        if (!hasInitializedUrlState) {
            return
        }

        const nextParams = new URLSearchParams(searchParams.toString())
        nextParams.set('tab', activeTab)
        nextParams.set('sort', topicSort)
        nextParams.set('mode', topicMode)

        const trimmedQuery = searchQuery.trim()
        if (trimmedQuery) {
            nextParams.set('q', trimmedQuery)
        } else {
            nextParams.delete('q')
        }

        if (selectedDiscussion) {
            nextParams.set('topic', String(selectedDiscussion.id))
        } else {
            nextParams.delete('topic')
        }

        const nextQueryString = nextParams.toString()
        const currentQueryString = searchParams.toString()
        if (nextQueryString === currentQueryString) {
            return
        }

        const nextHref = nextQueryString ? `${pathname}?${nextQueryString}` : pathname
        router.replace(nextHref, { scroll: false })
    }, [
        activeTab,
        topicSort,
        topicMode,
        searchQuery,
        selectedDiscussion,
        hasInitializedUrlState,
        pathname,
        router,
        searchParams,
    ])

    useEffect(() => {
        fetchRandomVendor();
        fetchHotTopics(true);
        fetchAnnouncements();
    }, []);

    const fetchHotTopics = async (showLoadingState = false) => {
        const requestId = topicsRequestIdRef.current + 1;
        topicsRequestIdRef.current = requestId;
        if (showLoadingState) {
            setIsTopicsLoading(true);
            setTopicsError(null);
        }
        try {
            const data = await hotTopicApi.getAllActive();
            if (topicsRequestIdRef.current !== requestId) {
                return;
            }
            setDiscussions(data);
            setActiveNowCount(countActiveTopics(data));
            setLastTopicsRefreshAt(new Date());
            setTopicsError(null);
        } catch (error) {
            if (topicsRequestIdRef.current !== requestId) {
                return;
            }
            console.error('Failed to fetch hot topics:', error);
            const hasCurrentTopics = discussionsRef.current.length > 0;
            if (showLoadingState || !hasCurrentTopics) {
                setTopicsError('Could not load discussions right now. Please try again.');
            }
        } finally {
            if (topicsRequestIdRef.current === requestId && showLoadingState) {
                setIsTopicsLoading(false);
            }
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const data = await announcementApi.getHot();
            setHotAnnouncements(data || []);
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
        }
    };

    const fetchRandomVendor = async () => {
        try {
            const vendors = await vendorApi.getAll();
            if (vendors && vendors.length > 0) {
                const random = vendors[Math.floor(Math.random() * vendors.length)];
                setVendor(random);
            }
        } catch (error) {
            console.error("Failed to fetch vendor for spotlight", error);
        }
    };

    useEffect(() => {
        const refreshTopicsInBackground = () => {
            if (document.visibilityState === 'visible') {
                fetchHotTopics(false);
            }
        };

        const intervalId = window.setInterval(refreshTopicsInBackground, 45000);
        document.addEventListener('visibilitychange', refreshTopicsInBackground);

        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener('visibilitychange', refreshTopicsInBackground);
        };
    }, []);

    const handleDiscussionClick = (discussion: Discussion) => {
        setSelectedDiscussion(discussion);
        if (authUser && discussion.likes) {
            const liked = discussion.likes.some((l: any) => l.user?.id === authUser.id);
            setHasLiked(liked);
        } else {
            setHasLiked(false);
        }
        setNewComment('');
    };

    const handleMapDiscussionSelect = (discussionId: Discussion['id']) => {
        const matchedDiscussion = discussions.find((discussion) => isSameDiscussionId(discussion.id, discussionId));
        if (!matchedDiscussion) {
            toast.error('Discussion is no longer available');
            return;
        }
        handleDiscussionClick(matchedDiscussion);
    };

    const requestUserLocation = () => {
        if (typeof window === 'undefined' || !('geolocation' in navigator)) {
            const message = 'Location is not supported in this browser.';
            setLocationError(message);
            toast.error(message);
            return;
        }

        setIsLocationLoading(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coordinates: UserCoordinates = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                setUserLocation(coordinates);
                setIsLocationLoading(false);
                toast.success('Using your location to rank nearby topics.');
            },
            (error) => {
                const message =
                    error.code === error.PERMISSION_DENIED
                        ? 'Location permission denied. Enable it to rank by distance.'
                        : 'Could not fetch your location.';
                setLocationError(message);
                setIsLocationLoading(false);
                toast.error(message);
            },
            {
                enableHighAccuracy: true,
                timeout: 12000,
                maximumAge: 5 * 60 * 1000,
            }
        );
    };

    const handleLikeDiscussion = async () => {
        if (!selectedDiscussion) return;

        if (!authIsLoggedIn) {
            toast('Please sign in to like', {
                description: 'You need to be logged in to interact',
            });
            setTimeout(() => window.location.href = '/signin', 1500);
            return;
        }

        const discussionId = selectedDiscussion.id;
        const authUserId = authUser?.id ? String(authUser.id) : null;
        const previousDiscussions = discussions;
        const previousSelectedDiscussion = selectedDiscussion;
        const currentlyLiked = selectedDiscussion.likes?.some((like: any) =>
            authUserId ? String(like.user?.id) === authUserId : false
        ) ?? false;
        const optimisticLike = {
            user: {
                id: authUser?.id ?? `optimistic-like-${Date.now()}`,
                displayName: authUser?.displayName || 'You',
            },
        };

        updateDiscussionById(discussionId, (discussion) => {
            const likes = discussion.likes ?? [];
            const nextLikes = currentlyLiked
                ? likes.filter((like: any) => String(like.user?.id) !== authUserId)
                : [...likes, optimisticLike];
            return { ...discussion, likes: nextLikes };
        });
        setHasLiked(!currentlyLiked);

        try {
            await hotTopicApi.toggleLike(discussionId);
            toast.success(!currentlyLiked ? "Discussion liked! ❤️" : "Like removed", {
                style: {
                    background: '#3B82F6',
                    color: 'white',
                    border: 'none',
                    fontWeight: 'bold'
                },
                icon: !currentlyLiked ? '❤️' : '💔'
            });
        } catch (error) {
            console.error('Failed to toggle like', error);
            setDiscussions(previousDiscussions);
            setSelectedDiscussion(previousSelectedDiscussion);
            if (authUserId) {
                const likedBeforeRollback = previousSelectedDiscussion.likes?.some((like: any) => String(like.user?.id) === authUserId) ?? false;
                setHasLiked(likedBeforeRollback);
            } else {
                setHasLiked(false);
            }
            toast.error('Failed to update like');
        }
    };

    const handlePostComment = async () => {
        const trimmedComment = newComment.trim();
        if (!trimmedComment) return;
        if (!selectedDiscussion) return;

        if (!authIsLoggedIn) {
            toast('Please sign in to comment', {
                description: 'You need to be logged in to participate in discussions',
            });
            setTimeout(() => window.location.href = '/signin', 1500);
            return;
        }

        const discussionId = selectedDiscussion.id;
        const optimisticCommentId = `optimistic-comment-${Date.now()}`;
        const optimisticComment: DiscussionComment = {
            id: optimisticCommentId,
            content: trimmedComment,
            createdAt: new Date().toISOString(),
            user: {
                id: authUser?.id ?? optimisticCommentId,
                displayName: authUser?.displayName || 'You',
            },
        };

        setNewComment('');
        updateDiscussionById(discussionId, (discussion) => ({
            ...discussion,
            comments: [...(discussion.comments ?? []), optimisticComment],
        }));

        try {
            const createdCommentResponse = await hotTopicApi.addComment(discussionId, trimmedComment);
            const createdComment: DiscussionComment = {
                id: createdCommentResponse?.id ?? optimisticCommentId,
                content: createdCommentResponse?.content ?? trimmedComment,
                createdAt: createdCommentResponse?.createdAt ?? optimisticComment.createdAt,
                user: createdCommentResponse?.user ?? optimisticComment.user,
            };

            updateDiscussionById(discussionId, (discussion) => ({
                ...discussion,
                comments: (discussion.comments ?? []).map((comment) =>
                    comment.id === optimisticCommentId ? createdComment : comment
                ),
            }));

            // Award XP for commenting (only for customers)
            if (authUser?.role !== 'VENDOR') {
                performAction('community_post');
                toast.success("Comment posted! +10 XP 💬", {
                    description: "Great contribution! Keep it up!",
                    style: {
                        background: '#10B981',
                        color: 'white',
                        border: 'none',
                        fontWeight: 'bold'
                    },
                    icon: '✅'
                });
            } else {
                toast.success("Comment posted!");
            }
        } catch (error: any) {
            console.error('Failed to post comment', error);
            // Check for authentication errors
            if (error?.response?.status === 401 || error?.response?.status === 400) {
                const errorMsg = error?.response?.data?.error || '';
                if (errorMsg.includes('log in') || errorMsg.includes('session') || errorMsg.includes('Invalid')) {
                    toast.error('Session expired. Please log in again.', {
                        description: 'Redirecting to sign in...'
                    });
                    await logout();
                    setTimeout(() => window.location.href = '/signin', 1500);
                    return;
                }
            }
            updateDiscussionById(discussionId, (discussion) => ({
                ...discussion,
                comments: (discussion.comments ?? []).filter((comment) => comment.id !== optimisticCommentId),
            }));
            setNewComment(trimmedComment);
            toast.error('Failed to post comment');
        }
    };

    const handleVendorClick = () => {
        if (!vendor) return;
        const target = vendor.slug || vendor.id;
        router.push(`/vendors/${target}`);
    };

    const openTopicDialog = () => {
        if (!authIsLoggedIn) {
            toast('Please sign in to start a topic', {
                description: 'Community topics are tied to your account',
            });
            setTimeout(() => window.location.href = '/signin', 1500);
            return;
        }
        setIsTopicDialogOpen(true);
    };

    const handleSubmitTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!authIsLoggedIn) {
            toast('Please sign in to start a topic');
            return;
        }

        const trimmedTitle = topicForm.title.trim();
        const trimmedContent = topicForm.content.trim();
        const trimmedImageUrl = topicForm.imageUrl.trim();
        const trimmedCityName = topicForm.cityName.trim();
        const trimmedLatitude = topicForm.latitude.trim();
        const trimmedLongitude = topicForm.longitude.trim();
        const hasLatitude = trimmedLatitude.length > 0;
        const hasLongitude = trimmedLongitude.length > 0;

        if (hasLatitude !== hasLongitude) {
            toast.error('Please provide both latitude and longitude');
            return;
        }

        let latitude: number | undefined;
        let longitude: number | undefined;

        if (hasLatitude && hasLongitude) {
            const parsedLatitude = Number.parseFloat(trimmedLatitude);
            const parsedLongitude = Number.parseFloat(trimmedLongitude);
            if (Number.isNaN(parsedLatitude) || Number.isNaN(parsedLongitude)) {
                toast.error('Latitude and longitude must be valid numbers');
                return;
            }
            if (parsedLatitude < -90 || parsedLatitude > 90) {
                toast.error('Latitude must be between -90 and 90');
                return;
            }
            if (parsedLongitude < -180 || parsedLongitude > 180) {
                toast.error('Longitude must be between -180 and 180');
                return;
            }
            latitude = parsedLatitude;
            longitude = parsedLongitude;
        }

        const topicFormSnapshot: TopicFormState = {
            title: trimmedTitle,
            content: trimmedContent,
            imageUrl: trimmedImageUrl,
            cityName: trimmedCityName,
            latitude: trimmedLatitude,
            longitude: trimmedLongitude,
        };

        const optimisticTopicId = `pending-topic-${Date.now()}`;
        const optimisticTopic: Discussion = {
            id: optimisticTopicId,
            title: trimmedTitle,
            content: trimmedContent,
            createdAt: new Date().toISOString(),
            createdByDisplayName: authUser?.displayName || 'You',
            cityName: trimmedCityName || undefined,
            latitude: latitude ?? null,
            longitude: longitude ?? null,
            likes: [],
            comments: [],
        };

        try {
            setIsSubmittingTopic(true);
            setPendingTopicSubmissions((previousTopics) => [optimisticTopic, ...previousTopics]);
            setIsTopicDialogOpen(false);
            setTopicForm(EMPTY_TOPIC_FORM);

            const submissionResponse = await hotTopicApi.createCommunity({
                title: trimmedTitle,
                content: trimmedContent,
                imageUrl: trimmedImageUrl || undefined,
                cityName: trimmedCityName || undefined,
                latitude,
                longitude,
            });

            if (submissionResponse?.topicId) {
                setPendingTopicSubmissions((previousTopics) =>
                    previousTopics.map((topic) =>
                        topic.id === optimisticTopicId
                            ? { ...topic, id: submissionResponse.topicId as string | number }
                            : topic
                    )
                );
            }

            toast.success('Topic submitted for review', {
                description: 'Our team will approve it shortly.',
            });
        } catch (error: any) {
            setPendingTopicSubmissions((previousTopics) =>
                previousTopics.filter((topic) => topic.id !== optimisticTopicId)
            );
            const status = error?.response?.status;
            const errorMsg = error?.response?.data?.error || 'Failed to submit topic';
            if (status === 401) {
                toast.error('Session expired. Please log in again.');
                await logout();
                setTimeout(() => window.location.href = '/signin', 1500);
                return;
            }
            if (status === 429) {
                setTopicForm(topicFormSnapshot);
                setIsTopicDialogOpen(true);
                toast.error('You have reached the daily topic limit', {
                    description: 'Please try again after some time.',
                });
                return;
            }
            setTopicForm(topicFormSnapshot);
            setIsTopicDialogOpen(true);
            toast.error(errorMsg);
        } finally {
            setIsSubmittingTopic(false);
        }
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handlePlayGames = () => {
        setActiveTab('games');
        scrollToSection('games');
    };

    const deferredSearchQuery = useDeferredValue(searchQuery);
    const nowTimestamp = Date.now();
    const liveModeCount = filterDiscussionsByMode(discussions, 'live', nowTimestamp).length;
    const unansweredModeCount = filterDiscussionsByMode(discussions, 'unanswered', nowTimestamp).length;
    const debateModeCount = filterDiscussionsByMode(discussions, 'debate', nowTimestamp).length;
    const nearbyModeCount = filterDiscussionsByMode(discussions, 'nearby', nowTimestamp).length;
    const modeFilteredDiscussions = filterDiscussionsByMode(discussions, topicMode, nowTimestamp);
    const modeSortedDiscussions = filterAndSortDiscussions(modeFilteredDiscussions, deferredSearchQuery, topicSort);
    const sortedDiscussions =
        topicMode === 'nearby'
            ? sortDiscussionsByDistance(modeSortedDiscussions, userLocation)
            : modeSortedDiscussions;
    const sortedPendingSubmissions = filterAndSortDiscussions(pendingTopicSubmissions, deferredSearchQuery, 'newest');
    const hasSearchQuery = deferredSearchQuery.trim().length > 0;
    const lastTopicsRefreshLabel = lastTopicsRefreshAt
        ? new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(lastTopicsRefreshAt)
        : null;
    const getDiscussionBadges = (discussion: Discussion) => {
        const likesCount = discussion.likes?.length || 0;
        const commentsCount = discussion.comments?.length || 0;
        const createdAtTime = discussion.createdAt ? new Date(discussion.createdAt).getTime() : 0;
        const isNewTopic = createdAtTime > 0 && Date.now() - createdAtTime <= 36 * 60 * 60 * 1000;

        const badges: Array<{ label: string; className: string }> = [];

        if (likesCount >= 5) {
            badges.push({ label: 'TRENDING', className: 'bg-red-500 text-white' });
        }
        if (commentsCount >= 4) {
            badges.push({ label: 'ACTIVE', className: 'bg-emerald-500 text-white' });
        }
        if (isNewTopic) {
            badges.push({ label: 'NEW', className: 'bg-blue-500 text-white' });
        }
        if (commentsCount === 0) {
            badges.push({ label: 'UNANSWERED', className: 'bg-white text-black' });
        }
        if (badges.length === 0) {
            badges.push({ label: 'FEATURED', className: 'bg-orange-500 text-white' });
        }

        return badges.slice(0, 2);
    };

    useEffect(() => {
        if (!hasInitializedUrlState) {
            return
        }

        const topicId = searchParams.get('topic')
        if (!topicId) {
            if (selectedDiscussion) {
                setSelectedDiscussion(null)
                setHasLiked(false)
                setNewComment('')
            }
            return
        }

        const matchedDiscussion = discussions.find((discussion) => String(discussion.id) === topicId)
        if (!matchedDiscussion) {
            return
        }

        if (selectedDiscussion?.id === matchedDiscussion.id) {
            return
        }

        setSelectedDiscussion(matchedDiscussion)
        if (authUser && matchedDiscussion.likes) {
            const liked = matchedDiscussion.likes.some((like: any) => like.user?.id === authUser.id)
            setHasLiked(liked)
        } else {
            setHasLiked(false)
        }
        setNewComment('')
    }, [discussions, searchParams, hasInitializedUrlState, selectedDiscussion, authUser])

    return (
        <div className="min-h-screen">
            <BreadcrumbListSchema items={[
                { name: 'Home', item: 'https://streetbitego.vercel.app' },
                { name: 'Community', item: 'https://streetbitego.vercel.app/community' }
            ]} />
            <Navbar />

            {/* Dynamic Hero Section */}
            <section className="relative pt-32 pb-16 overflow-hidden">
                {/* Floating Elements - keeping animations but making them bolder */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-200/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-[400px] h-[400px] bg-pink-200/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-4000"></div>

                <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-black text-white border-2 border-black text-sm font-black uppercase tracking-wider mb-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] -rotate-1">
                        <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                        {activeNowCount} Hot Topics Active
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-black/60 mb-6">
                        Live in the last 24 hours
                    </p>

                    <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9] text-black">
                        THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">FOODIE</span> SOCIAL
                    </h1>

                    <p className="text-2xl text-black font-bold max-w-2xl mx-auto mb-10 border-b-4 border-black pb-8 inline-block transform rotate-1">
                        Yap about the best bites, then jump into games to earn XP.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Button
                            size="lg"
                            className="h-16 px-10 rounded-full text-xl font-black uppercase bg-black text-white border-4 border-black hover:bg-white hover:text-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1"
                            onClick={() => scrollToSection('discussions')}
                        >
                            <MessageSquare className="w-6 h-6 mr-3" />
                            Start Yap
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-16 px-10 rounded-full text-xl font-black uppercase bg-white text-black border-4 border-black hover:bg-orange-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1"
                            onClick={handlePlayGames}
                        >
                            <Gamepad2 className="w-6 h-6 mr-3" />
                            Play Games
                        </Button>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className="mb-10 flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => scrollToSection('discussions')}
                        className="rounded-full border-2 border-black bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        Jump to Yaps
                    </button>
                    <button
                        onClick={() => scrollToSection('games')}
                        className="rounded-full border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        Jump to Games
                    </button>
                    <span className="rounded-full border-2 border-black bg-yellow-300 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        Both live now
                    </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column - Main Feed (8 cols) */}
                    <div className="lg:col-span-8 space-y-10">

                        <CommunityAnnouncementsBanner announcements={hotAnnouncements} />

                        {/* Hot Discussions */}
                        <Card id="discussions" className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white rounded-[2rem] overflow-hidden">
                            <CardHeader className="pb-6 border-b-4 border-black bg-yellow-300 p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-black rounded-xl -rotate-3 shadow-md">
                                            <MessageSquare className="w-6 h-6 text-white" />
                                        </div>
                                        <h2 className="text-3xl font-black uppercase tracking-tight text-black">
                                            Hot Topics
                                        </h2>
                                    </div>
                                    {authUser?.role === 'ADMIN' ? (
                                        <Button
                                            className="border-4 border-black bg-black text-white font-black uppercase tracking-wider"
                                            onClick={() => router.push('/admin/hot-topics')}
                                        >
                                            Start a topic
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            className="border-4 border-black font-black uppercase tracking-wider"
                                            onClick={openTopicDialog}
                                        >
                                            Start a topic
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fetchHotTopics(true)}
                                        disabled={isTopicsLoading}
                                        className="border-4 border-black font-black uppercase tracking-wider"
                                    >
                                        {isTopicsLoading ? (
                                            <span className="inline-flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Refreshing
                                            </span>
                                        ) : (
                                            'Refresh'
                                        )}
                                    </Button>
                                    <div className="relative w-full sm:w-72">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
                                        <Input
                                            type="text"
                                            placeholder="Search yaps..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-12 h-12 bg-white border-4 border-black rounded-xl font-bold placeholder:text-gray-400 focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <span className="rounded-full border-2 border-black bg-black px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.2em] text-emerald-300">
                                        Mode
                                    </span>
                                    {TOPIC_MODE_OPTIONS.map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => setTopicMode(option.id)}
                                            className={`rounded-full border-2 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.18em] ${
                                                topicMode === option.id
                                                    ? 'border-black bg-emerald-300 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                                                    : 'border-black bg-white text-black/70'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                    <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.14em] text-black/70 inline-flex items-center gap-1.5">
                                        <Flame className="h-3 w-3 text-orange-500" />
                                        {liveModeCount} live now
                                    </span>
                                    <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.14em] text-black/70 inline-flex items-center gap-1.5">
                                        <MessageSquare className="h-3 w-3 text-blue-500" />
                                        {unansweredModeCount} unanswered
                                    </span>
                                    <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.14em] text-black/70 inline-flex items-center gap-1.5">
                                        <Scale className="h-3 w-3 text-red-500" />
                                        {debateModeCount} debate-ready
                                    </span>
                                    <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.14em] text-black/70 inline-flex items-center gap-1.5">
                                        <MapPin className="h-3 w-3 text-teal-500" />
                                        {nearbyModeCount} nearby-signals
                                    </span>
                                    <span className="rounded-full border-2 border-black bg-black px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.2em] text-yellow-300">
                                        Sort by
                                    </span>
                                    {TOPIC_SORT_OPTIONS.map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => setTopicSort(option.id)}
                                            className={`rounded-full border-2 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.18em] ${
                                                topicSort === option.id
                                                    ? 'border-black bg-yellow-300 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                                                    : 'border-black bg-white text-black/70'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                    {lastTopicsRefreshLabel && (
                                        <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.14em] text-black/70">
                                            Updated {lastTopicsRefreshLabel}
                                        </span>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 bg-white">
                                {topicMode === 'live' && (
                                    <div className="mb-6 rounded-2xl border-4 border-black bg-emerald-100 px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <p className="text-xs font-black uppercase tracking-[0.16em] text-black inline-flex items-center gap-2">
                                            <Flame className="h-4 w-4 text-orange-500" />
                                            Live Mode
                                        </p>
                                        <p className="mt-1 text-xs font-bold text-black/70">
                                            Showing discussions active in the last {LIVE_MODE_WINDOW_MINUTES} minutes.
                                        </p>
                                    </div>
                                )}
                                {topicMode === 'unanswered' && (
                                    <div className="mb-6 rounded-2xl border-4 border-black bg-blue-100 px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <p className="text-xs font-black uppercase tracking-[0.16em] text-black inline-flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-blue-600" />
                                            Unanswered Mode
                                        </p>
                                        <p className="mt-1 text-xs font-bold text-black/70">
                                            Showing topics with zero replies so the community can respond faster.
                                        </p>
                                    </div>
                                )}
                                {topicMode === 'debate' && (
                                    <div className="mb-6 rounded-2xl border-4 border-black bg-rose-100 px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <p className="text-xs font-black uppercase tracking-[0.16em] text-black inline-flex items-center gap-2">
                                            <Scale className="h-4 w-4 text-rose-600" />
                                            Debate Mode
                                        </p>
                                        <p className="mt-1 text-xs font-bold text-black/70">
                                            Showing hot-take style topics and likely opinion battles.
                                        </p>
                                    </div>
                                )}
                                {topicMode === 'nearby' && (
                                    <div className="mb-6 rounded-2xl border-4 border-black bg-teal-100 px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <p className="text-xs font-black uppercase tracking-[0.16em] text-black inline-flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-teal-600" />
                                            Nearby Mode
                                        </p>
                                        <p className="mt-1 text-xs font-bold text-black/70">
                                            {userLocation
                                                ? 'Ranking topics by nearest distance whenever coordinates are available.'
                                                : 'Showing nearby-signal topics. Enable location to rank by true distance.'}
                                        </p>
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={requestUserLocation}
                                                disabled={isLocationLoading}
                                                className="h-8 border-2 border-black bg-white px-3 text-[0.65rem] font-black uppercase tracking-[0.14em] text-black"
                                            >
                                                {isLocationLoading ? (
                                                    <span className="inline-flex items-center gap-2">
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        Locating
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2">
                                                        <LocateFixed className="h-3.5 w-3.5" />
                                                        {userLocation ? 'Update my location' : 'Use my location'}
                                                    </span>
                                                )}
                                            </Button>
                                            {userLocation && (
                                                <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-[0.6rem] font-black uppercase tracking-[0.14em] text-black/70">
                                                    {userLocation.latitude.toFixed(2)}, {userLocation.longitude.toFixed(2)}
                                                </span>
                                            )}
                                            {!userLocation && locationError && (
                                                <span className="rounded-full border-2 border-black bg-rose-100 px-3 py-1 text-[0.6rem] font-black uppercase tracking-[0.14em] text-black/70">
                                                    {locationError}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {topicMode === 'all' && sortedPendingSubmissions.length > 0 && (
                                    <div className="mb-6 rounded-2xl border-4 border-dashed border-amber-500 bg-amber-100 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <p className="text-xs font-black uppercase tracking-[0.2em] text-black">
                                                Pending Review
                                            </p>
                                            <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.18em] text-black">
                                                {sortedPendingSubmissions.length} awaiting approval
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            {sortedPendingSubmissions.map((topic) => (
                                                <div
                                                    key={topic.id}
                                                    className="rounded-xl border-2 border-black bg-white px-4 py-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                                                >
                                                    <p className="text-sm font-black uppercase tracking-[0.12em] text-black">
                                                        {topic.title}
                                                    </p>
                                                    <p className="mt-1 line-clamp-2 text-xs font-bold text-black/70">{topic.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {isTopicsLoading && (
                                    <div className="grid grid-cols-1 gap-4">
                                        {Array.from({ length: 3 }).map((_, index) => (
                                            <div
                                                key={`topics-loading-${index}`}
                                                className="h-40 rounded-2xl border-4 border-black bg-gray-100 animate-pulse shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                            />
                                        ))}
                                    </div>
                                )}
                                {topicsError && !isTopicsLoading && (
                                    <div className="rounded-2xl border-4 border-black bg-red-50 p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <p className="text-lg font-black uppercase text-black">Unable to load discussions</p>
                                        <p className="mt-2 text-sm font-bold text-black/70">{topicsError}</p>
                                        <Button
                                            type="button"
                                            onClick={() => fetchHotTopics(true)}
                                            className="mt-4 border-4 border-black bg-black text-white font-black uppercase tracking-wider"
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                )}
                                {!isTopicsLoading && !topicsError && (
                                    <div className="grid grid-cols-1 gap-4">
                                        {sortedDiscussions.map((discussion, index) => (
                                            (() => {
                                                const baseBadges = getDiscussionBadges(discussion);
                                                const discussionBadges = topicMode === 'debate'
                                                    ? [{ label: 'DEBATE', className: 'bg-rose-500 text-white' }, ...baseBadges].slice(0, 2)
                                                    : topicMode === 'nearby'
                                                        ? [{ label: 'NEARBY', className: 'bg-teal-500 text-white' }, ...baseBadges].slice(0, 2)
                                                        : baseBadges;
                                                const likesCount = discussion.likes?.length || 0;
                                                const commentsCount = discussion.comments?.length || 0;
                                                const participantsCount = getParticipantCount(discussion);
                                                const activityScore = Math.min(100, commentsCount * 14 + likesCount * 11 + participantsCount * 8);
                                                const debateSplit = getDebateSplit(discussion);
                                                const nearbySignal = getNearbySignal(discussion);
                                                const nearbyTags = getNearbyTags(discussion, 2);
                                                const nearbyDistanceKm = getDiscussionDistanceKm(discussion, userLocation);
                                                const authorLabel = discussion.createdByDisplayName
                                                    ? `@${discussion.createdByDisplayName}`
                                                    : '@StreetBiteTeam';

                                                return (
                                            <button
                                                    key={discussion.id}
                                                    onClick={() => handleDiscussionClick(discussion)}
                                                    className="group p-5 bg-white hover:bg-orange-50 rounded-2xl border-4 border-black transition-all text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none animate-slide-up"
                                                    style={{ animationDelay: `${index * 0.1}s` }}
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex gap-2 flex-wrap">
                                                            {discussionBadges.map((badge) => (
                                                                <span
                                                                    key={`${discussion.id}-${badge.label}`}
                                                                    className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border border-black transform group-hover:rotate-2 transition-transform ${badge.className}`}
                                                                >
                                                                    {badge.label}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-gray-500 font-black uppercase tracking-wide">
                                                            Last activity {getLastActivity(discussion)}
                                                        </span>
                                                    </div>
                                                    <div className="mb-2 text-xs font-black uppercase tracking-widest text-black/60">
                                                        {discussion.createdByDisplayName ? `By ${discussion.createdByDisplayName}` : 'Community'}
                                                    </div>
                                                    <h3 className="font-black text-xl text-black mb-4 group-hover:text-orange-600 transition-colors line-clamp-2">
                                                        {discussion.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{discussion.content}</p>
                                                    <div className="mb-4">
                                                        <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.14em] text-black/60">
                                                            <span>Activity level</span>
                                                            <span>{activityScore}%</span>
                                                        </div>
                                                        <div className="h-2 rounded-full border-2 border-black bg-white overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-300 transition-all"
                                                                style={{ width: `${activityScore}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    {topicMode === 'debate' && (
                                                        <div className="mb-4 rounded-xl border-2 border-black bg-rose-50 p-3">
                                                            <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.14em] text-black/70">
                                                                <span>Side A {debateSplit.left}%</span>
                                                                <span>Side B {debateSplit.right}%</span>
                                                            </div>
                                                            <div className="h-3 overflow-hidden rounded-full border-2 border-black bg-white flex">
                                                                <div className="h-full bg-rose-500" style={{ width: `${debateSplit.left}%` }} />
                                                                <div className="h-full bg-blue-500" style={{ width: `${debateSplit.right}%` }} />
                                                            </div>
                                                            <div className="mt-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.12em] text-black/60">
                                                                <span>Team spice</span>
                                                                <span>Team crunch</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {topicMode === 'nearby' && (
                                                        <div className="mb-4 rounded-xl border-2 border-black bg-teal-50 p-3">
                                                            <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.14em] text-black/70">
                                                                <span>Local signal</span>
                                                                <span>{nearbySignal}%</span>
                                                            </div>
                                                            <div className="h-3 overflow-hidden rounded-full border-2 border-black bg-white">
                                                                <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all" style={{ width: `${nearbySignal}%` }} />
                                                            </div>
                                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                                {nearbyDistanceKm !== null && (
                                                                    <span className="rounded-full border border-black bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-black/70">
                                                                        {nearbyDistanceKm < 1
                                                                            ? `${Math.round(nearbyDistanceKm * 1000)}m away`
                                                                            : `${nearbyDistanceKm.toFixed(1)}km away`}
                                                                    </span>
                                                                )}
                                                                {nearbyTags.length > 0 ? nearbyTags.map((tag) => (
                                                                    <span
                                                                        key={`${discussion.id}-nearby-${tag}`}
                                                                        className="rounded-full border border-black bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-black/70"
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                )) : (
                                                                    <span className="text-[10px] font-black uppercase tracking-[0.12em] text-black/60">
                                                                        local intent detected
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-6 text-sm text-gray-600 font-bold">
                                                        <span className="flex items-center gap-2">
                                                            <MessageSquare className="w-4 h-4" />
                                                            {commentsCount}
                                                        </span>
                                                        <span className="flex items-center gap-2">
                                                            <Heart className="w-4 h-4" />
                                                            {likesCount}
                                                        </span>
                                                        <span className="flex items-center gap-2">
                                                            <Star className="w-4 h-4" />
                                                            {participantsCount} participants
                                                        </span>
                                                        <span className="flex items-center gap-2 ml-auto text-black">
                                                            {authorLabel}
                                                        </span>
                                                        <span className="hidden sm:inline-flex items-center gap-2 text-black/70 text-xs uppercase tracking-[0.12em]">
                                                            Tap to open
                                                        </span>
                                                    </div>
                                                </button>
                                                );
                                            })()
                                        ))}
                                    </div>
                                )}
                                {hasSearchQuery && !isTopicsLoading && !topicsError && sortedDiscussions.length === 0 && (
                                    <div className="text-center py-16">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-black border-dashed">
                                            <Search className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="font-black text-xl text-black">
                                            {topicMode === 'live'
                                                ? 'NO LIVE YAPS FOUND'
                                                : topicMode === 'unanswered'
                                                    ? 'NO UNANSWERED YAPS FOUND'
                                                    : topicMode === 'debate'
                                                        ? 'NO DEBATE YAPS FOUND'
                                                        : topicMode === 'nearby'
                                                            ? 'NO NEARBY YAPS FOUND'
                                                    : 'NO YAPS FOUND'}
                                        </p>
                                        <p className="text-gray-500 font-medium mt-2">
                                            {topicMode === 'live'
                                                ? 'Try another search or switch to All mode'
                                                : topicMode === 'unanswered'
                                                    ? 'Try another search or switch to Live/All mode'
                                                    : topicMode === 'debate'
                                                        ? 'Try another search or switch to Live/All mode'
                                                        : topicMode === 'nearby'
                                                            ? 'Try another search or switch to Live/All mode'
                                                    : 'Try searching for something else'}
                                        </p>
                                    </div>
                                )}
                                {!hasSearchQuery && !isTopicsLoading && !topicsError && sortedDiscussions.length === 0 && (
                                    <div className="text-center py-16">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-black border-dashed">
                                            <MessageSquare className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="font-black text-xl text-black">
                                            {topicMode === 'live'
                                                ? 'NO LIVE TOPICS RIGHT NOW'
                                                : topicMode === 'unanswered'
                                                    ? 'NO UNANSWERED TOPICS RIGHT NOW'
                                                    : topicMode === 'debate'
                                                        ? 'NO DEBATE TOPICS RIGHT NOW'
                                                        : topicMode === 'nearby'
                                                            ? 'NO NEARBY TOPICS RIGHT NOW'
                                                    : 'NO TOPICS YET'}
                                        </p>
                                        <p className="text-gray-500 font-medium mt-2">
                                            {topicMode === 'live'
                                                ? 'Switch to All mode to browse every topic'
                                                : topicMode === 'unanswered'
                                                    ? 'Switch to Live or All mode to browse more topics'
                                                    : topicMode === 'debate'
                                                        ? 'Switch to Live or All mode to browse more topics'
                                                        : topicMode === 'nearby'
                                                            ? 'Switch to Live or All mode to browse more topics'
                                                    : 'Be the first one to start a discussion'}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Games Hub */}
                        <Card id="games" className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white rounded-[2rem] overflow-hidden">
                            <CardHeader className="border-b-4 border-black bg-[#fff3d2] p-6">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-black rounded-xl -rotate-2 shadow-md">
                                            <Gamepad2 className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black uppercase tracking-tight text-black">
                                                Games & Challenges
                                            </h2>
                                            <p className="text-sm font-bold text-black/70">Earn XP, unlock streaks, and compete.</p>
                                        </div>
                                    </div>
                                    <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                                        Fresh each day
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="transform hover:-translate-y-2 transition-transform duration-300">
                                        <VendorBattle />
                                    </div>
                                    <div className="transform hover:-translate-y-2 transition-transform duration-300">
                                        {authIsLoggedIn ? (
                                            <StreakTracker />
                                        ) : (
                                            <Card className="h-full border-4 border-black rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-orange-500 text-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                                                <div className="relative z-10 flex flex-col items-center">
                                                    <div className="p-4 bg-black rounded-full mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300 border-4 border-white">
                                                        <Flame className="w-10 h-10 text-orange-500 fill-orange-500 animate-pulse" />
                                                    </div>
                                                    <h3 className="font-black text-3xl mb-2 tracking-tight uppercase">Ignite Your Streak</h3>
                                                    <p className="text-black font-bold mb-8 text-lg leading-relaxed max-w-[200px]">
                                                        Log in daily to build your flame and earn spicy rewards.
                                                    </p>
                                                    <Button
                                                        className="bg-white text-black hover:bg-black hover:text-white font-black border-4 border-black text-lg py-6 px-8 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all transform hover:-translate-y-1"
                                                        onClick={() => window.location.href = '/signin'}
                                                    >
                                                        Start Streak
                                                    </Button>
                                                </div>
                                            </Card>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="inline-flex items-center rounded-full border-2 border-black bg-blue-100 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-black">
                                        Community Radar
                                    </div>
                                    <CommunityMap
                                        discussions={modeFilteredDiscussions}
                                        onSelectDiscussion={handleMapDiscussionSelect}
                                    />
                                </div>

                                <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                                    <ZodiacCard />
                                </div>
                            </CardContent>

                            <div className="border-b-4 border-black bg-black p-4">
                                <div className="flex gap-4 overflow-x-auto no-scrollbar justify-center">
                                    {COMMUNITY_TABS.map(tab => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all whitespace-nowrap border-2 ${isActive
                                                    ? 'bg-yellow-400 text-black border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transform -translate-y-1'
                                                    : 'bg-black text-gray-400 border-transparent hover:text-white'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <CardContent className="p-6 min-h-[400px]">
                                <div key={activeTab} className="animate-fade-in">
                                    {activeTab === 'games' && (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <DailyPoll />
                                            <FoodPersonalityQuiz />
                                            <Card className="border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white">
                                                <CardContent className="p-6 space-y-4">
                                                    <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-yellow-300 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-black">
                                                        Challenge deck
                                                    </div>
                                                    <h3 className="text-2xl font-black text-black">Daily XP boosters</h3>
                                                    <p className="text-sm font-bold text-black/60">
                                                        Vote in battles, keep streaks alive, and finish a poll to stack XP faster.
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-black">Battle</span>
                                                        <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-black">Streak</span>
                                                        <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-black">Poll</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}
                                    {activeTab === 'photos' && <PhotoWall />}
                                    {activeTab === 'events' && <EventsCalendar />}
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    <CommunitySidebar
                        authIsLoggedIn={authIsLoggedIn}
                        vendor={vendor}
                        handleVendorClick={handleVendorClick}
                        leaderboard={<Leaderboard />}
                        userStats={<UserStats />}
                    />

                </div>
            </div>

            <TopicSubmissionDialog
                isOpen={isTopicDialogOpen}
                isSubmitting={isSubmittingTopic}
                topicForm={topicForm}
                onOpenChange={setIsTopicDialogOpen}
                onTopicFormChange={setTopicForm}
                onSubmit={handleSubmitTopic}
            />

            <DiscussionModal
                authUser={authUser}
                hasLiked={hasLiked}
                newComment={newComment}
                selectedDiscussion={selectedDiscussion}
                onClose={() => setSelectedDiscussion(null)}
                onCommentChange={setNewComment}
                onLike={handleLikeDiscussion}
                onPostComment={handlePostComment}
            />

            <Footer />
        </div >
    )
}

export default function CommunityPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-[#FFFBF0]">
                    <div className="w-12 h-12 border-4 border-black border-t-orange-500 rounded-full animate-spin" />
                </div>
            }
        >
            <CommunityPageContent />
        </Suspense>
    )
}
