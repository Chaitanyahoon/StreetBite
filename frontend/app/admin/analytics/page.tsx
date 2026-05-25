'use client'

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, MessageSquare, Star, Users, ArrowUpRight } from 'lucide-react'

export default function AdminAnalytics() {
	const [stats, setStats] = useState<any>({
		totalUsers: 0,
		totalVendors: 0,
		totalReviews: 0,
		totalFavorites: 0,
		avgPlatformRating: 0,
		mostReviewedVendors: [],
		engagementTrends: []
	})
	const [loading, setLoading] = useState(true)
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 640)
		}
		handleResize()
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	useEffect(() => {
		const fetchData = async () => {
			try {
				const { analyticsApi } = await import('@/lib/api')
				const data = await analyticsApi.getPlatformAnalytics()
				setStats(data)
			} catch (error) {
				console.error('Error fetching analytics:', error)
			} finally {
				void setLoading(false)
			}
		}
		void fetchData()
	}, [])

	if (loading) {
		return (
			<div className="p-8 flex justify-center min-h-screen items-center bg-[#f7f0e4]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-orange-500 mx-auto mb-4"></div>
					<p className="text-black font-black uppercase tracking-wider text-xs">Loading Analytics...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl mx-auto pb-10 pt-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-4xl font-black text-black uppercase tracking-tight">Platform Analytics</h1>
					<p className="text-xs sm:text-sm font-bold text-black/60 mt-1">
						Engagement, Reviews, and <span className="text-orange-600 font-extrabold">Growth Metrics</span>
					</p>
				</div>
			</div>

			{/* Platform Overview Bento Grid (2x2 on mobile, 4 columns on desktop) */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
				{/* Total Users */}
				<div className="bg-[#fffaf4] rounded-2xl border-3 border-black p-3.5 sm:p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between hover:-translate-y-0.5 transition-all">
					<div className="flex items-start justify-between">
						<div className="space-y-1">
							<p className="text-[10px] sm:text-xs font-black uppercase text-black/50 tracking-wider">Total Users</p>
							<p className="text-2xl sm:text-4xl font-black text-black leading-none">{stats.totalUsers}</p>
						</div>
						<div className="p-2 bg-sky-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
							<Users className="w-5 h-5 text-sky-700" />
						</div>
					</div>
					<div className="mt-3">
						<span className="inline-flex items-center gap-1 px-2 py-0.5 border-2 border-black rounded-lg text-[9px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] bg-sky-200 text-black">
							<ArrowUpRight className="w-2.5 h-2.5 stroke-[2.5]" />
							+{stats.usersGrowth || 0} Growth
						</span>
					</div>
				</div>

				{/* Total Vendors */}
				<div className="bg-[#fffaf4] rounded-2xl border-3 border-black p-3.5 sm:p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between hover:-translate-y-0.5 transition-all">
					<div className="flex items-start justify-between">
						<div className="space-y-1">
							<p className="text-[10px] sm:text-xs font-black uppercase text-black/50 tracking-wider">Total Vendors</p>
							<p className="text-2xl sm:text-4xl font-black text-black leading-none">{stats.totalVendors}</p>
						</div>
						<div className="p-2 bg-yellow-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
							<Star className="w-5 h-5 text-yellow-700" />
						</div>
					</div>
					<div className="mt-3">
						<span className="inline-flex items-center gap-1 px-2 py-0.5 border-2 border-black rounded-lg text-[9px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] bg-yellow-300 text-black">
							<ArrowUpRight className="w-2.5 h-2.5 stroke-[2.5]" />
							+{stats.vendorsGrowth || 0} New
						</span>
					</div>
				</div>

				{/* Total Reviews */}
				<div className="bg-[#fffaf4] rounded-2xl border-3 border-black p-3.5 sm:p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between hover:-translate-y-0.5 transition-all">
					<div className="flex items-start justify-between">
						<div className="space-y-1">
							<p className="text-[10px] sm:text-xs font-black uppercase text-black/50 tracking-wider">Total Reviews</p>
							<p className="text-2xl sm:text-4xl font-black text-black leading-none">{stats.totalReviews}</p>
						</div>
						<div className="p-2 bg-emerald-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
							<MessageSquare className="w-5 h-5 text-emerald-700" />
						</div>
					</div>
					<div className="mt-3">
						<span className="inline-flex items-center gap-1 px-2 py-0.5 border-2 border-black rounded-lg text-[9px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] bg-emerald-300 text-black">
							<ArrowUpRight className="w-2.5 h-2.5 stroke-[2.5]" />
							+{stats.reviewsGrowth || 0} Growth
						</span>
					</div>
				</div>

				{/* Total Favorites */}
				<div className="bg-[#fffaf4] rounded-2xl border-3 border-black p-3.5 sm:p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between hover:-translate-y-0.5 transition-all">
					<div className="flex items-start justify-between">
						<div className="space-y-1">
							<p className="text-[10px] sm:text-xs font-black uppercase text-black/50 tracking-wider">Total Favorites</p>
							<p className="text-2xl sm:text-4xl font-black text-black leading-none">{stats.totalFavorites}</p>
						</div>
						<div className="p-2 bg-red-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
							<Heart className="w-5 h-5 text-red-600 fill-red-600" />
						</div>
					</div>
					<div className="mt-3">
						<span className="inline-flex items-center gap-1 px-2 py-0.5 border-2 border-black rounded-lg text-[9px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] bg-red-300 text-black">
							<Heart className="w-2.5 h-2.5 fill-current" />
							+{stats.favoritesGrowth || 0} New
						</span>
					</div>
				</div>
			</div>

			{/* Charts Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Engagement Line Card */}
				<div className="bg-[#fffaf4] rounded-2xl border-3 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
					<div className="border-b-2 border-black/10 pb-3 mb-4">
						<h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-black">Engagement Trend</h3>
						<p className="text-[10px] sm:text-xs text-black/50 font-bold">Activity (Reviews & Signups) over the last 30 days</p>
					</div>
					<div className="w-full">
						<ResponsiveContainer width="100%" height={isMobile ? 240 : 300}>
							<LineChart data={stats.engagementTrends} margin={{ left: isMobile ? -20 : 0, right: 10 }}>
								{!isMobile && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />}
								<XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#000', fontSize: isMobile ? 8 : 10, fontWeight: 'bold' }} interval={isMobile ? 3 : 1} dy={10} />
								<YAxis axisLine={false} tickLine={false} tick={{ fill: '#000', fontSize: isMobile ? 8 : 10, fontWeight: 'bold' }} />
								<Tooltip
									contentStyle={{ border: '2px solid black', borderRadius: '8px', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)', fontWeight: 'bold' }}
									cursor={{ stroke: '#EC4899', strokeWidth: 1 }}
								/>
								<Legend iconType="rect" formatter={(value) => <span className="font-bold text-black text-[9px] sm:text-xs uppercase">{value}</span>} />
								<Line type="monotone" dataKey="interactions" stroke="#EC4899" strokeWidth={3} dot={{ r: 4, fill: '#EC4899', strokeWidth: 2, stroke: '#000' }} activeDot={{ r: 6 }} name="Interactions" />
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Most Reviewed Bar Card */}
				<div className="bg-[#fffaf4] rounded-2xl border-3 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
					<div className="border-b-2 border-black/10 pb-3 mb-4">
						<h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-black">Most Reviewed Stalls</h3>
						<p className="text-[10px] sm:text-xs text-black/50 font-bold">Stalls with highest community feedback</p>
					</div>
					<div className="w-full">
						<ResponsiveContainer width="100%" height={isMobile ? 240 : 300}>
							<BarChart data={stats.mostReviewedVendors} layout="vertical" barSize={isMobile ? 12 : 20} margin={{ left: isMobile ? -30 : 0 }}>
								{!isMobile && <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />}
								<XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#000', fontSize: isMobile ? 8 : 10, fontWeight: 'bold' }} />
								<YAxis dataKey="name" type="category" width={isMobile ? 65 : 100} axisLine={false} tickLine={false} tick={{ fill: '#000', fontSize: isMobile ? 8 : 10, fontWeight: 'bold' }} />
								<Tooltip
									cursor={{ fill: 'rgba(0,0,0,0.05)' }}
									contentStyle={{ border: '2px solid black', borderRadius: '8px', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)', fontWeight: 'bold' }}
								/>
								<Legend iconType="rect" formatter={(value) => <span className="font-bold text-black text-[9px] sm:text-xs uppercase">{value}</span>} />
								<Bar dataKey="reviews" fill="#0F9F8E" stroke="#000" strokeWidth={2} radius={[0, 4, 4, 0]} name="Total Reviews" />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>
		</div>
	)
}
