'use client'

import Link from 'next/link'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Calendar } from 'lucide-react'

const platformStats = [
	{ date: 'Mon', gmv: 8900, vendors: 45, users: 1200, transactions: 280 },
	{ date: 'Tue', vendors: 48, users: 1350, gmv: 12400, transactions: 420 },
	{ date: 'Wed', vendors: 52, users: 1480, gmv: 17300, transactions: 580 },
	{ date: 'Thu', vendors: 50, users: 1420, gmv: 15600, transactions: 520 },
	{ date: 'Fri', vendors: 55, users: 1680, gmv: 21600, transactions: 720 },
	{ date: 'Sat', vendors: 58, users: 1920, gmv: 26700, transactions: 890 },
	{ date: 'Sun', vendors: 56, users: 1800, gmv: 25500, transactions: 850 },
]

const topCities = [
	{ city: 'Delhi', vendors: 45, gmv: 85000, share: 28 },
	{ city: 'Mumbai', vendors: 38, gmv: 72000, share: 23 },
	{ city: 'Bangalore', vendors: 32, gmv: 61000, share: 19 },
	{ city: 'Hyderabad', vendors: 28, gmv: 52000, share: 17 },
	{ city: 'Others', vendors: 102, gmv: 60000, share: 13 },
]

export default function AdminAnalytics() {
	return (
		<div className="p-8 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Link href="/" className="flex items-center gap-2">
						<img
							src="/streetbite-logo.png"
							alt="StreetBite"
							className="h-8 w-auto"
						/>
					</Link>
					<div>
						<h1 className="text-3xl font-bold">StreetBite Analytics</h1>
						<p className="text-muted-foreground mt-1">
							Comprehensive StreetBite platform insights and metrics
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" className="gap-2">
						<Calendar className="w-4 h-4" />
						Last 7 Days
					</Button>
					<Button variant="outline" className="gap-2">
						<Download className="w-4 h-4" />
						Export Report
					</Button>
				</div>
			</div>

			{/* Platform Overview */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="pt-6">
						<p className="text-sm text-muted-foreground">Total GMV</p>
						<p className="text-2xl font-bold mt-2">₹1.27Cr</p>
						<p className="text-xs text-emerald-600 mt-1">+21.5% this week</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<p className="text-sm text-muted-foreground">Avg Transaction</p>
						<p className="text-2xl font-bold mt-2">₹295</p>
						<p className="text-xs text-emerald-600 mt-1">+8.3% this week</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<p className="text-sm text-muted-foreground">Platform Commission</p>
						<p className="text-2xl font-bold mt-2">₹15.2L</p>
						<p className="text-xs text-emerald-600 mt-1">+12.7% this week</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<p className="text-sm text-muted-foreground">Customer Retention</p>
						<p className="text-2xl font-bold mt-2">62%</p>
						<p className="text-xs text-emerald-600 mt-1">+3.2% this week</p>
					</CardContent>
				</Card>
			</div>

			{/* Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>GMV & Transactions</CardTitle>
						<CardDescription>Gross Merchandise Value trend</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={350}>
							<LineChart data={platformStats}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="date" />
								<YAxis />
								<Tooltip />
								<Legend />
								<Line
									type="monotone"
									dataKey="gmv"
									stroke="#FF7A32"
									strokeWidth={2}
									name="GMV (₹)"
								/>
								<Line
									type="monotone"
									dataKey="transactions"
									stroke="#FFA45C"
									strokeWidth={2}
									name="Transactions"
								/>
							</LineChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Top Cities by GMV</CardTitle>
						<CardDescription>Revenue distribution by city</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={350}>
							<BarChart data={topCities}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="city" />
								<YAxis />
								<Tooltip />
								<Bar dataKey="gmv" fill="#FF7A32" name="GMV (₹000s)" />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			{/* Distribution */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>City-wise Distribution</CardTitle>
						<CardDescription>Market share by city</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{topCities.map((item, idx) => (
								<div
									key={idx}
									className="flex items-center justify-between"
								>
									<div className="flex-1">
										<div className="flex items-center justify-between mb-1">
											<span className="font-medium text-sm">{item.city}</span>
											<span className="text-sm font-semibold text-orange-600">
												{item.share}%
											</span>
										</div>
										<div className="w-full bg-accent rounded-full h-2">
											<div
												className="bg-orange-600 h-2 rounded-full"
												style={{ width: `${item.share}%` }}
											/>
										</div>
										<p className="text-xs text-muted-foreground mt-1">
											{item.vendors} vendors • ₹{item.gmv}K
										</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>User Engagement</CardTitle>
						<CardDescription>Weekly user activity</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={300}>
							<LineChart data={platformStats}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="date" />
								<YAxis />
								<Tooltip />
								<Line
									type="monotone"
									dataKey="users"
									stroke="#FF7A32"
									strokeWidth={2}
								/>
							</LineChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
