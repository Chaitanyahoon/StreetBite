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

const DISCUSSIONS = [
    { id: 1, text: "What's your go-to midnight snack?", replies: 142, likes: 89, author: "foodie_raj", time: "2h ago", tags: ["Late Night", "Snacks"] },
    { id: 2, text: "Best street food in Pune?", replies: 89, likes: 56, author: "pune_explorer", time: "5h ago", tags: ["Pune", "Recommendations"] },
    { id: 3, text: "Spicy vs. Sweet - what's your vibe?", replies: 67, likes: 112, author: "taste_master", time: "1d ago", tags: ["Debate"] },
    { id: 4, text: "Hidden gem near you?", replies: 234, likes: 178, author: "street_hunter", time: "3h ago", tags: ["Discovery"] },
    { id: 5, text: "Favorite chaat combination?", replies: 156, likes: 134, author: "chaat_lover", time: "12h ago", tags: ["Chaat"] },
    { id: 6, text: "Rainy day food mood?", replies: 198, likes: 201, author: "monsoon_foodie", time: "6h ago", tags: ["Weather", "Comfort Food"] },
    { id: 7, text: "Best Vada Pav in Mumbai?", replies: 300, likes: 450, author: "mumbai_local", time: "1h ago", tags: ["Mumbai", "Vada Pav"] },
    { id: 8, text: "Filter Coffee vs Masala Chai", replies: 500, likes: 600, author: "chai_wala", time: "4h ago", tags: ["Debate", "Drinks"] },
    { id: 9, text: "Underrated Street Foods", replies: 120, likes: 90, author: "explorer_101", time: "8h ago", tags: ["Discovery"] },
    { id: 10, text: "Street Food Hygiene Tips", replies: 80, likes: 150, author: "health_nut", time: "1d ago", tags: ["Tips", "Health"] }
];

const SAMPLE_COMMENTS = [
    { id: 1, author: "vada_pav_fan", text: "Vada pav all the way! Nothing beats it! 🥪", likes: 12, time: "1h ago" },
    { id: 2, author: "samosa_king", text: "Has to be samosas with green chutney 😋", likes: 8, time: "45m ago" },
    { id: 3, author: "chai_addict", text: "Chai and pakoras for sure!", likes: 15, time: "30m ago" }
];

import { useGamification } from '@/context/GamificationContext'

// ... existing imports ...

import { vendorApi } from '@/lib/api';

// ... existing imports ...

export default function CommunityPage() {
    const { performAction } = useGamification()
    const [vendor, setVendor] = useState<any>(null); // Use proper type if available
    const [discussions, setDiscussions] = useState(DISCUSSIONS);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('games');
    const [selectedDiscussion, setSelectedDiscussion] = useState<typeof DISCUSSIONS[0] | null>(null);
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState(SAMPLE_COMMENTS);
    const [hasLiked, setHasLiked] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        // Check authentication
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setIsLoggedIn(true);
                setUserRole(user.role);
            } catch (error) {
                console.error('Failed to parse user data', error);
            }
        }

        fetchRandomVendor();

        // Randomize discussions order
        const shuffled = [...DISCUSSIONS].sort(() => Math.random() - 0.5);
        setDiscussions(shuffled);
    }, []);

    const fetchRandomVendor = async () => {
        try {
            const vendors = await vendorApi.getAll();
            if (vendors && vendors.length > 0) {
                const random = vendors[Math.floor(Math.random() * vendors.length)];
                setVendor(random);
            }
        } catch (error) {
            console.error("Failed to fetch vendor for spotlight", error);
            // Fallback to a default if fetch fails
            setVendor(VENDORS[0]);
        }
    };

    const handleDiscussionClick = (discussion: typeof DISCUSSIONS[0]) => {
        setSelectedDiscussion(discussion);
        setHasLiked(false);
        setNewComment('');
    };

    const handleLikeDiscussion = () => {
        if (!selectedDiscussion) return;
        setHasLiked(!hasLiked);
        toast.success(hasLiked ? "Like removed" : "Discussion liked! ❤️", {
            style: {
                background: '#3B82F6',
                color: 'white',
                border: 'none',
                fontWeight: 'bold'
            },
            icon: hasLiked ? '💔' : '❤️'
        });
    };

    const handlePostComment = () => {
        if (!newComment.trim()) return;

        if (!isLoggedIn) {
            toast('Please sign in to comment', {
                description: 'You need to be logged in to participate in discussions',
            });
            setTimeout(() => window.location.href = '/signin', 1500);
            return;
        }

        const comment = {
            id: comments.length + 1,
            author: "you",
            text: newComment,
            likes: 0,
            time: "Just now"
        };
        setComments([comment, ...comments]);
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
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />

            {/* Dynamic Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-white">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'radial-gradient(#F97316 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }}></div>

                {/* Floating Elements */}
                <div className="absolute top-20 left-10 animate-float" style={{ animationDelay: '0s' }}>
                    <span className="text-4xl">🍔</span>
                </div>
                <div className="absolute bottom-20 right-10 animate-float" style={{ animationDelay: '1.5s' }}>
                    <span className="text-4xl">🍕</span>
                </div>
                <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: '0.8s' }}>
                    <span className="text-4xl">🌮</span>
                </div>

                <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-bold mb-6 animate-scale-in">
                        <Flame className="w-4 h-4 fill-orange-500 animate-pulse" />
                        500+ Foodies Active Now
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight animate-slide-up">
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">Foodie</span> Social
                    </h1>

                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        Connect with local food lovers, compete in challenges, and discover the best street food hidden gems near you.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <Button
                            size="lg"
                            className="h-14 px-8 rounded-full text-lg font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                            onClick={() => scrollToSection('discussions')}
                        >
                            <MessageSquare className="w-5 h-5 mr-2" />
                            Join Discussion
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-14 px-8 rounded-full text-lg font-bold border-2 hover:bg-gray-50"
                            onClick={handlePlayGames}
                        >
                            <Gamepad2 className="w-5 h-5 mr-2" />
                            Play Games
                        </Button>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column - Main Feed (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Featured Challenges Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="transform hover:-translate-y-1 transition-transform duration-300">
                                <VendorBattle />
                            </div>
                            <div className="transform hover:-translate-y-1 transition-transform duration-300">
                                {isLoggedIn ? (
                                    <StreakTracker />
                                ) : (
                                    <Card className="h-full border-none shadow-soft bg-gradient-to-br from-orange-500 to-red-600 text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12"></div>
                                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/10 rounded-full blur-xl -ml-10 -mb-10"></div>

                                        <div className="relative z-10 flex flex-col items-center">
                                            <div className="p-3 bg-white/20 rounded-full mb-4 backdrop-blur-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                <Flame className="w-8 h-8 text-yellow-300 fill-yellow-300 animate-pulse" />
                                            </div>
                                            <h3 className="font-black text-xl mb-2 tracking-tight">Ignite Your Streak! 🔥</h3>
                                            <p className="text-white/90 mb-5 text-sm font-medium leading-relaxed max-w-[200px]">
                                                Log in daily to build your flame and earn exclusive spicy rewards.
                                            </p>
                                            <Button
                                                className="bg-white text-orange-600 hover:bg-orange-50 font-bold border-none shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                                                size="sm"
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
                        <CommunityMap />

                        {/* Daily Activity */}
                        <ZodiacCard />

                        {/* Hot Discussions */}
                        <Card id="discussions" className="border-none shadow-soft bg-white/80 backdrop-blur-xl overflow-hidden">
                            <CardHeader className="pb-4 border-b border-gray-100">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <MessageSquare className="w-5 h-5 text-green-600" />
                                        </div>
                                        Hot Topics
                                    </CardTitle>
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Search discussions..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-xl"
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 gap-3">
                                    {discussions
                                        .filter(d => d.text.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .map((discussion) => (
                                            <button
                                                key={discussion.id}
                                                onClick={() => handleDiscussionClick(discussion)}
                                                className="group p-4 bg-white hover:bg-orange-50/50 rounded-2xl border border-gray-100 hover:border-orange-200 transition-all text-left shadow-sm hover:shadow-md"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex gap-2">
                                                        {discussion.tags?.map(tag => (
                                                            <span key={tag} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-gray-400 font-medium">{discussion.time}</span>
                                                </div>
                                                <h3 className="font-bold text-base text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-1">
                                                    {discussion.text}
                                                </h3>
                                                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                                                    <span className="flex items-center gap-1.5">
                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                        {discussion.replies} replies
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Heart className="w-3.5 h-3.5" />
                                                        {discussion.likes} likes
                                                    </span>
                                                    <span className="flex items-center gap-1.5 ml-auto text-gray-400">
                                                        by @{discussion.author}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                </div>
                                {searchQuery && discussions.filter(d => d.text.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="font-medium">No discussions found</p>
                                        <p className="text-sm mt-1">Try searching for something else</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Content Tabs */}
                        <Card id="games" className="border-none shadow-soft bg-white/80 backdrop-blur-xl overflow-hidden">
                            <div className="border-b border-gray-100">
                                <div className="flex p-2 gap-2 overflow-x-auto">
                                    {tabs.map(tab => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${isActive
                                                    ? 'bg-orange-500 text-white shadow-md'
                                                    : 'bg-transparent text-gray-600 hover:bg-gray-50'
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
                                {activeTab === 'games' && <FoodBingo />}
                                {activeTab === 'photos' && <PhotoWall />}
                                {activeTab === 'events' && <EventsCalendar />}
                            </CardContent>
                        </Card>

                    </div>

                    {/* Right Sidebar - Sticky (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="sticky top-24 space-y-6">
                            {isLoggedIn ? (
                                <>
                                    <UserStats />
                                    <Leaderboard />
                                </>
                            ) : (
                                <Card className="border-none shadow-soft bg-white p-6 text-center relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500"></div>
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <Award className="w-8 h-8 text-orange-600" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 text-gray-900">Join the Leaderboard 🏆</h3>
                                    <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                                        Compete with top foodies, earn XP, and unlock exclusive badges!
                                    </p>
                                    <Button
                                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold shadow-lg shadow-orange-500/20"
                                        onClick={() => window.location.href = '/signin'}
                                    >
                                        Sign In to Play
                                    </Button>
                                </Card>
                            )}

                            <DailyPoll />

                            <FoodPersonalityQuiz />

                            <Card className="border-none shadow-soft bg-gradient-to-br from-orange-500 to-red-600 text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl -ml-12 -mb-12"></div>

                                <CardHeader className="pb-2 relative z-10">
                                    <CardTitle className="text-base flex items-center gap-2 text-white">
                                        <Award className="w-5 h-5 text-yellow-300" />
                                        Vendor Spotlight
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <div className="space-y-4">
                                        <div className="w-full aspect-video bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                                            <span className="text-6xl animate-bounce">🍛</span>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-lg">{vendor?.name || "Loading..."}</h4>
                                            <div className="flex items-center gap-2 text-white/90 text-sm mt-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {vendor?.location || "Unknown Location"}
                                                <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                                                <span className="font-bold text-yellow-300">{vendor?.rating || "New"}★</span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full font-bold bg-white text-orange-600 hover:bg-orange-50 border-none"
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedDiscussion(null)}>
                    <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-10 text-white hover:bg-white/20" onClick={() => setSelectedDiscussion(null)}>
                            <X className="w-5 h-5" />
                        </Button>

                        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

                            <div className="relative z-10 flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2 text-sm font-medium text-white/90">
                                        <span className="bg-white/20 px-2 py-0.5 rounded-md">@{selectedDiscussion.author}</span>
                                        <span>• {selectedDiscussion.time}</span>
                                    </div>
                                    <h3 className="text-2xl font-black leading-tight">{selectedDiscussion.text}</h3>
                                </div>
                            </div>

                            <div className="relative z-10 flex gap-3">
                                <button onClick={handleLikeDiscussion} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${hasLiked ? 'bg-white text-red-500 shadow-lg scale-105' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
                                    <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                                    <span>{selectedDiscussion.likes + (hasLiked ? 1 : 0)}</span>
                                </button>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 text-sm font-bold text-white">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>{comments.length} replies</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 max-h-[400px] overflow-y-auto space-y-4 bg-gray-50/50">
                            {comments.map((comment) => (
                                <div key={comment.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${comment.author === 'you' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                                                {comment.author.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-gray-900">@{comment.author}</div>
                                                <div className="text-[10px] text-gray-400 font-medium">{comment.time}</div>
                                            </div>
                                        </div>
                                        <button className="flex items-center gap-1.5 text-gray-400 hover:text-orange-500 transition-colors">
                                            <ThumbsUp className="w-3.5 h-3.5" />
                                            <span className="text-xs font-bold">{comment.likes}</span>
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600 pl-11 leading-relaxed">{comment.text}</p>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handlePostComment()}
                                    placeholder="Add a comment..."
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 focus:outline-none text-sm bg-gray-50 focus:bg-white transition-all"
                                />
                                <Button onClick={handlePostComment} disabled={!newComment.trim()} className="h-auto px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-md">
                                    <Send className="w-4 h-4" />
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
