'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ZodiacCard } from '@/components/ZodiacCard'
import { DailyPoll } from '@/components/DailyPoll'
import { VendorBattle } from '@/components/VendorBattle'
import { StreakTracker } from '@/components/StreakTracker'
import { FoodBingo } from '@/components/FoodBingo'
import { PhotoWall } from '@/components/PhotoWall'
import { EventsCalendar } from '@/components/EventsCalendar'
import { Leaderboard } from '@/components/Leaderboard'
import { FoodPersonalityQuiz } from '@/components/FoodPersonalityQuiz'
import { UserStats } from '@/components/UserStats'
import { CommunityMap } from '@/components/CommunityMap'
import { MessageSquare, Award, Gamepad2, Camera, CalendarDays, TrendingUp, Heart, Send, X, ThumbsUp, Search, Sparkles, Flame, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const VENDORS = [
    { name: "Raghu's Vada Pav", location: "Mumbai", rating: "4.8★" },
    { name: "Sharma Ji's Chaat", location: "Delhi", rating: "4.9★" },
    { name: "Mohan's Misal", location: "Pune", rating: "4.7★" },
    { name: "Lakshmi's Dosa", location: "Bangalore", rating: "4.6★" },
    { name: "Arjun's Momos", location: "Kolkata", rating: "4.8★" }
];

import { useGamification } from '@/context/GamificationContext'
import { hotTopicApi, vendorApi } from '@/lib/api';

// ... existing imports ...

export default function CommunityPage() {
    const { performAction } = useGamification()
    const [vendor, setVendor] = useState<any>(null);
    const [discussions, setDiscussions] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('games');
    const [selectedDiscussion, setSelectedDiscussion] = useState<any | null>(null);
    const [newComment, setNewComment] = useState('');
    const [hasLiked, setHasLiked] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        // Check authentication
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setIsLoggedIn(true);
                setUserRole(user.role);
                setCurrentUser(user);
            } catch (error) {
                console.error('Failed to parse user data', error);
            }
        }

        fetchRandomVendor();
        fetchHotTopics();
    }, []);

    const fetchHotTopics = async () => {
        try {
            const data = await hotTopicApi.getAllActive();
            setDiscussions(data);
        } catch (error) {
            console.error('Failed to fetch hot topics:', error);
            // toast.error('Failed to load hot topics');
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

    const handleDiscussionClick = (discussion: any) => {
        setSelectedDiscussion(discussion);
        // Check if current user has liked
        if (currentUser && discussion.likes) {
            const liked = discussion.likes.some((l: any) => l.user?.id === currentUser.id);
            setHasLiked(liked);
        } else {
            setHasLiked(false);
        }
        setNewComment('');
    };

    const handleLikeDiscussion = async () => {
        if (!selectedDiscussion) return;

        if (!isLoggedIn) {
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
                const liked = updatedSelected.likes.some((l: any) => l.user?.id === currentUser.id);
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

        if (!isLoggedIn) {
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
            if (userRole !== 'VENDOR') {
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
        } catch (error) {
            console.error('Failed to post comment', error);
            toast.error('Failed to post comment');
        }
    };

    const handleVendorClick = () => {
        toast.info(`Viewing ${vendor.name}`, {
            description: "Vendor profiles coming soon! 🏪"
        });
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

    const tabs = [
        { id: 'games', label: 'Games', icon: Gamepad2 },
        { id: 'photos', label: 'Photos', icon: Camera },
        { id: 'events', label: 'Events', icon: CalendarDays }
    ];

    return (
        <div className="min-h-screen bg-[#FFFBF0] bg-[radial-gradient(#E5E7EB_1px,transparent_1px)] [background-size:24px_24px]">
            <Navbar />

            {/* Dynamic Hero Section */}
            <section className="relative pt-32 pb-16 overflow-hidden">
                {/* Floating Elements - keeping animations but making them bolder */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-200/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-[400px] h-[400px] bg-pink-200/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-4000"></div>

                <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-black text-white border-2 border-black text-sm font-black uppercase tracking-wider mb-8 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transform -rotate-1">
                        <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                        500+ Foodies Active Now
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9] text-black">
                        THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">FOODIE</span> SOCIAL
                    </h1>

                    <p className="text-2xl text-black font-bold max-w-2xl mx-auto mb-10 border-b-4 border-black pb-8 inline-block transform rotate-1">
                        Connect, compete, and discover hidden gems.
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column - Main Feed (8 cols) */}
                    <div className="lg:col-span-8 space-y-10">

                        {/* Featured Challenges Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="transform hover:-translate-y-2 transition-transform duration-300">
                                <VendorBattle />
                            </div>
                            <div className="transform hover:-translate-y-2 transition-transform duration-300">
                                {isLoggedIn ? (
                                    <StreakTracker />
                                ) : (
                                    <Card className="h-full border-4 border-black rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-orange-500 text-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                                        <div className="relative z-10 flex flex-col items-center">
                                            <div className="p-4 bg-black rounded-full mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300 border-4 border-white">
                                                <Flame className="w-10 h-10 text-orange-500 fill-orange-500 animate-pulse" />
                                            </div>
                                            <h3 className="font-black text-3xl mb-2 tracking-tight uppercase">Ignite Your Streak! 🔥</h3>
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

                        {/* Interactive Map */}
                        <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <CommunityMap />
                        </div>

                        {/* Daily Activity */}
                        <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                            <ZodiacCard />
                        </div>

                        {/* Hot Discussions */}
                        <Card id="discussions" className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white rounded-[2rem] overflow-hidden">
                            <CardHeader className="pb-6 border-b-4 border-black bg-yellow-300 p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-black rounded-xl -rotate-3 shadow-md">
                                            <MessageSquare className="w-6 h-6 text-white" />
                                        </div>
                                        <CardTitle className="text-3xl font-black uppercase tracking-tight text-black">
                                            Hot Topics
                                        </CardTitle>
                                    </div>
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
                            </CardHeader>
                            <CardContent className="p-6 bg-white">
                                <div className="grid grid-cols-1 gap-4">
                                    {discussions
                                        .filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .map((discussion, index) => (
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
                                                    <span className="text-xs text-gray-500 font-black uppercase tracking-wide">{new Date(discussion.createdAt).toLocaleDateString()}</span>
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
                                                    <span className="flex items-center gap-2 ml-auto text-black">
                                                        by @StreetBiteTeam
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                </div>
                                {searchQuery && discussions.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
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

                        {/* Content Tabs */}
                        <Card id="games" className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white rounded-[2rem] overflow-hidden">
                            <div className="border-b-4 border-black bg-black p-4">
                                <div className="flex gap-4 overflow-x-auto no-scrollbar justify-center">
                                    {tabs.map(tab => {
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
                                    {activeTab === 'games' && <FoodBingo />}
                                    {activeTab === 'photos' && <PhotoWall />}
                                    {activeTab === 'events' && <EventsCalendar />}
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    {/* Right Sidebar - Sticky (4 cols) */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="sticky top-24 space-y-8">
                            {isLoggedIn ? (
                                <>
                                    <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                                        <UserStats />
                                    </div>
                                    <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                                        <Leaderboard />
                                    </div>
                                </>
                            ) : (
                                <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 text-center relative overflow-hidden group rounded-[2rem]">
                                    <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-orange-400 to-red-500 border-b-4 border-black"></div>
                                    <div className="w-20 h-20 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform duration-300 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <Award className="w-10 h-10 text-black" />
                                    </div>
                                    <h3 className="font-black text-2xl mb-2 text-black leading-none">JOIN THE <br /> HALL OF FAME</h3>
                                    <p className="text-gray-600 mb-6 text-sm font-bold leading-relaxed px-4">
                                        Compete with top foodies, earn XP, and unlock exclusive badges!
                                    </p>
                                    <Button
                                        className="w-full bg-black text-white hover:bg-orange-500 font-black border-4 border-black shadow-[4px_4px_0px_0px_#9ca3af] hover:shadow-[4px_4px_0px_0px_#000000] rounded-xl h-12 uppercase"
                                        onClick={() => window.location.href = '/signin'}
                                    >
                                        Sign In to Play
                                    </Button>
                                </Card>
                            )}

                            <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                                <DailyPoll />
                            </div>

                            <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                                <FoodPersonalityQuiz />
                            </div>

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
                                            <div className="absolute inset-0 bg-yellow-400 opacity-20 group-hover:opacity-0 transition-opacity"></div>
                                            <span className="text-7xl animate-bounce drop-shadow-lg">🍛</span>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-2xl mb-2">{vendor?.name || "Loading..."}</h4>
                                            <div className="flex items-center gap-3 text-gray-300 text-sm font-bold">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4 text-orange-500" />
                                                    {vendor?.location || "Unknown Location"}
                                                </div>
                                                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                                                <span className="text-yellow-400">{vendor?.rating || "New"}★</span>
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full font-black bg-white text-black hover:bg-yellow-400 border-none h-12 rounded-xl text-lg uppercase tracking-wide"
                                            onClick={handleVendorClick}
                                        >
                                            View Profile
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                </div>
            </div>

            {/* Discussion Modal */}
            {selectedDiscussion && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedDiscussion(null)}>
                    <div className="relative bg-white rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border-4 border-black" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-10 text-white hover:bg-black/20 rounded-full" onClick={() => setSelectedDiscussion(null)}>
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
                                        <span className="bg-white px-3 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">@StreetBiteTeam</span>
                                        <span className="text-white">• {new Date(selectedDiscussion.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-3xl font-black leading-tight drop-shadow-md mb-2">{selectedDiscussion.title}</h3>
                                    <p className="text-white/90 font-medium text-lg">{selectedDiscussion.content}</p>
                                </div>
                            </div>

                            <div className="relative z-10 flex gap-4">
                                <button onClick={handleLikeDiscussion} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-black uppercase tracking-wider transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none ${hasLiked ? 'bg-pink-500 text-white' : 'bg-white text-black'}`}>
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
                            {selectedDiscussion.comments?.slice().reverse().map((comment: any) => (
                                <div key={comment.id} className="p-4 bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#e5e7eb]">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center text-sm font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${comment.user?.id === currentUser?.id ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                {(comment.user?.displayName || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-black text-sm text-black uppercase">@{comment.user?.displayName || 'Unknown'}</div>
                                                <div className="text-[10px] text-gray-500 font-bold">{new Date(comment.createdAt).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-base font-medium text-gray-800 pl-13 leading-relaxed">{comment.text}</p>
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
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handlePostComment()}
                                    placeholder="Add a comment..."
                                    className="flex-1 px-4 py-3 rounded-xl border-4 border-black font-bold placeholder:text-gray-400 focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm bg-white transition-all"
                                />
                                <Button onClick={handlePostComment} disabled={!newComment.trim()} className="h-auto px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
                                    <Send className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div >
    )
}
