'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { MessageSquare, Gamepad2, Search, Flame, Loader2, Heart, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import {
    COMMUNITY_TABS,
    EMPTY_TOPIC_FORM,
    TOPIC_SORT_OPTIONS,
    countActiveTopics,
    filterAndSortDiscussions,
    getLastActivity,
    getParticipantCount,
    type CommunityTabId,
    type Discussion,
    type TopicFormState,
    type TopicSort,
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

export default function CommunityPage() {
    const router = useRouter()
    const { performAction } = useGamification()
    const { user: authUser, isLoggedIn: authIsLoggedIn, logout } = useAuth()
    const [vendor, setVendor] = useState<any>(null);
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [topicSort, setTopicSort] = useState<TopicSort>('newest');
    const [activeTab, setActiveTab] = useState<CommunityTabId>('games');
    const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
    const [newComment, setNewComment] = useState('');
    const [hasLiked, setHasLiked] = useState(false);
    const [hotAnnouncements, setHotAnnouncements] = useState<any[]>([]);
    const [activeNowCount, setActiveNowCount] = useState(0);
    const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false);
    const [isSubmittingTopic, setIsSubmittingTopic] = useState(false);
    const [topicForm, setTopicForm] = useState<TopicFormState>(EMPTY_TOPIC_FORM);

    useEffect(() => {
        fetchRandomVendor();
        fetchHotTopics();
        fetchAnnouncements();
    }, []);

    const fetchHotTopics = async () => {
        try {
            const data = await hotTopicApi.getAllActive();
            setDiscussions(data);
            setActiveNowCount(countActiveTopics(data));
        } catch (error) {
            console.error('Failed to fetch hot topics:', error);
            // toast.error('Failed to load hot topics');
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

    const handleLikeDiscussion = async () => {
        if (!selectedDiscussion) return;

        if (!authIsLoggedIn) {
            toast('Please sign in to like', {
                description: 'You need to be logged in to interact',
            });
            setTimeout(() => window.location.href = '/signin', 1500);
            return;
        }

        try {
            await hotTopicApi.toggleLike(selectedDiscussion.id);
            // Refresh data
            const updatedTopics = await hotTopicApi.getAllActive();
            setDiscussions(updatedTopics);

            // Update selected discussion view
            const updatedSelected = updatedTopics.find((d: any) => d.id === selectedDiscussion.id);
            if (updatedSelected) {
                setSelectedDiscussion(updatedSelected);
                const liked = updatedSelected.likes.some((l: any) => l.user?.id === authUser?.id);
                setHasLiked(liked);

                toast.success(liked ? "Discussion liked! ❤️" : "Like removed", {
                    style: {
                        background: '#3B82F6',
                        color: 'white',
                        border: 'none',
                        fontWeight: 'bold'
                    },
                    icon: liked ? '❤️' : '💔'
                });
            }
        } catch (error) {
            console.error('Failed to toggle like', error);
            toast.error('Failed to update like');
        }
    };

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        if (!selectedDiscussion) return;

        if (!authIsLoggedIn) {
            toast('Please sign in to comment', {
                description: 'You need to be logged in to participate in discussions',
            });
            setTimeout(() => window.location.href = '/signin', 1500);
            return;
        }

        try {
            await hotTopicApi.addComment(selectedDiscussion.id, newComment);

            // Refresh data
            const updatedTopics = await hotTopicApi.getAllActive();
            setDiscussions(updatedTopics);

            // Update selected discussion view
            const updatedSelected = updatedTopics.find((d: any) => d.id === selectedDiscussion.id);
            if (updatedSelected) {
                setSelectedDiscussion(updatedSelected);
            }

            setNewComment('');

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

        try {
            setIsSubmittingTopic(true);
            await hotTopicApi.createCommunity({
                title: topicForm.title.trim(),
                content: topicForm.content.trim(),
                imageUrl: topicForm.imageUrl.trim() || undefined
            });
            setIsTopicDialogOpen(false);
            setTopicForm(EMPTY_TOPIC_FORM);
            toast.success('Topic submitted for review', {
                description: 'Our team will approve it shortly.',
            });
        } catch (error: any) {
            const status = error?.response?.status;
            const errorMsg = error?.response?.data?.error || 'Failed to submit topic';
            if (status === 401) {
                toast.error('Session expired. Please log in again.');
                await logout();
                setTimeout(() => window.location.href = '/signin', 1500);
                return;
            }
            if (status === 429) {
                toast.error('You have reached the daily topic limit', {
                    description: 'Please try again after some time.',
                });
                return;
            }
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

    const sortedDiscussions = filterAndSortDiscussions(discussions, searchQuery, topicSort);

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
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 bg-white">
                                <div className="grid grid-cols-1 gap-4">
                                    {sortedDiscussions.map((discussion, index) => (
                                        <button
                                                key={discussion.id}
                                                onClick={() => handleDiscussionClick(discussion)}
                                                className="group p-5 bg-white hover:bg-orange-50 rounded-2xl border-4 border-black transition-all text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none animate-slide-up"
                                                style={{ animationDelay: `${index * 0.1}s` }}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex gap-2 flex-wrap">
                                                        {/* Static tags for now or map if added to backend */}
                                                        <span className="px-2 py-1 rounded-md bg-black text-white text-[10px] font-black uppercase tracking-wider border border-black transform group-hover:rotate-2 transition-transform">
                                                            HOT
                                                        </span>
                                                        <span className="px-2 py-1 rounded-md bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider border border-black transform group-hover:-rotate-2 transition-transform">
                                                            FEATURED
                                                        </span>
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
                                                <div className="flex items-center gap-6 text-sm text-gray-600 font-bold">
                                                    <span className="flex items-center gap-2">
                                                        <MessageSquare className="w-4 h-4" />
                                                        {discussion.comments?.length || 0}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <Heart className="w-4 h-4" />
                                                        {discussion.likes?.length || 0}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <Star className="w-4 h-4" />
                                                        {getParticipantCount(discussion)} participants
                                                    </span>
                                                    <span className="flex items-center gap-2 ml-auto text-black">
                                                        by @StreetBiteTeam
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                </div>
                                {searchQuery && sortedDiscussions.length === 0 && (
                                    <div className="text-center py-16">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-black border-dashed">
                                            <Search className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="font-black text-xl text-black">NO YAPS FOUND</p>
                                        <p className="text-gray-500 font-medium mt-2">Try searching for something else</p>
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

                                <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                    <CommunityMap />
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
