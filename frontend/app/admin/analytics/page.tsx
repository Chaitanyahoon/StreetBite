'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Calendar, Heart, MessageSquare, Star, Users, ArrowUpRight } from 'lucide-react'

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

	useEffect(() => {
		const fetchData = async () => {
			try {
				const { analyticsApi } = await import('@/lib/api')
				const data = await analyticsApi.getPlatformAnalytics()
				setStats(data)
			} catch (error) {
				console.error('Error fetching analytics:', error)
			} finally {
				setLoading(false)
			}
		}
		fetchData()
	}, [])

	if (loading) {
		return <div className="p-8 flex justify-center min-h-screen items-center bg-gray-50/50">
			<div className="flex flex-col items-center gap-2 animate-pulse">
				<p className="text-muted-foreground font-medium">Loading Analytics...</p>
			</div>
		</div>
	}

	return (
		<div className="p-8 space-y-6 min-h-screen bg-gray-50/30">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<Link href="/" className="flex items-center gap-2">
						{/* Assuming Logo component or image exists, keeping text if not */}
						<div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-200">
							S
						</div>
					</Link>
					<div>
						<h1 className="text-3xl font-black tracking-tight text-foreground">Community Analytics</h1>
						<p className="text-muted-foreground mt-1 text-lg">
							Engagement, Reviews, and <span className="text-orange-600 font-semibold">Growth</span>
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" className="gap-2 bg-white hover:bg-gray-50 shadow-sm border-gray-200">
						<Calendar className="w-4 h-4" />
						Last 30 Days
					</Button>
					<Button variant="outline" className="gap-2 bg-white hover:bg-gray-50 shadow-sm border-gray-200">
						<Download className="w-4 h-4" />
						Export Report
					</Button>
				</div>
			</div>

			{/* Platform Overview */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-blue-50/50">
					<CardContent className="pt-6">
						<div className="flex justify-between items-start">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Total Users</p>
								<p className="text-3xl font-black mt-2 text-foreground">{stats.totalUsers}</p>
								<div className="flex items-center gap-1 mt-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
									<ArrowUpRight className="w-3 h-3" />
									<span className="text-xs font-semibold">+{stats.usersGrowth || 0} this week</span>
								</div>
							</div>
							<div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-inner">
								<Users className="w-6 h-6 text-blue-700" />
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-yellow-50/50">
					<CardContent className="pt-6">
						<div className="flex justify-between items-start">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Total Vendors</p>
								<p className="text-3xl font-black mt-2 text-foreground">{stats.totalVendors}</p>
								<div className="flex items-center gap-1 mt-1 text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full w-fit">
									<ArrowUpRight className="w-3 h-3" />
									<span className="text-xs font-semibold">+{stats.vendorsGrowth || 0} New</span>
								</div>
							</div>
							<div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl shadow-inner">
								<Star className="w-6 h-6 text-yellow-700" />
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-emerald-50/50">
					<CardContent className="pt-6">
						<div className="flex justify-between items-start">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
								<p className="text-3xl font-black mt-2 text-foreground">{stats.totalReviews}</p>
								<div className="flex items-center gap-1 mt-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
									<ArrowUpRight className="w-3 h-3" />
									<span className="text-xs font-semibold">+{stats.reviewsGrowth || 0} this week</span>
								</div>
							</div>
							<div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl shadow-inner">
								<MessageSquare className="w-6 h-6 text-emerald-700" />
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-pink-50/50">
					<CardContent className="pt-6">
						<div className="flex justify-between items-start">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Total Favorites</p>
								<p className="text-3xl font-black mt-2 text-foreground">{stats.totalFavorites}</p>
								<div className="flex items-center gap-1 mt-1 text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full w-fit">
									<Heart className="w-3 h-3 fill-current" />
									<span className="text-xs font-semibold">+{stats.favoritesGrowth || 0} New</span>
								</div>
							</div>
							<div className="p-3 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl shadow-inner">
								<Heart className="w-6 h-6 text-pink-700" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Charts Row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card className="border-none shadow-lg">
					<CardHeader>
						<CardTitle className="text-xl font-bold">Engagement Trend</CardTitle>
						<CardDescription>Activity (Reviews & Signups) over last 30 days</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<LineChart data={stats.engagementTrends}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
								<XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
								<YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
								<Tooltip
									contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
									cursor={{ stroke: '#EC4899', strokeWidth: 1 }}
								/>
								<Legend iconType="circle" />
								<Line type="monotone" dataKey="interactions" stroke="#EC4899" strokeWidth={3} dot={{ r: 4, fill: '#EC4899', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="Interactions" />
							</LineChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card className="border-none shadow-lg">
					<CardHeader>
						<CardTitle className="text-xl font-bold">Most Reviewed Vendors</CardTitle>
						<CardDescription>Vendors with highest community feedback</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={stats.mostReviewedVendors} layout="vertical" barSize={20}>
								<CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
								<XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
								<YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }} />
								<Tooltip
									cursor={{ fill: '#F3F4F6' }}
									contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
								/>
								<Bar dataKey="reviews" fill="#8B5CF6" radius={[0, 4, 4, 0]} name="Total Reviews" />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
