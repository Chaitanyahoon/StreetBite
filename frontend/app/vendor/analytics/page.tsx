'use client'

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Calendar } from 'lucide-react'

const dailyData = [
  { date: 'Mon', views: 420, orders: 12, revenue: 450 },
  { date: 'Tue', views: 580, orders: 18, revenue: 620 },
  { date: 'Wed', views: 890, orders: 25, revenue: 890 },
  { date: 'Thu', views: 720, orders: 20, revenue: 750 },
  { date: 'Fri', views: 1200, orders: 35, revenue: 1200 },
  { date: 'Sat', views: 1800, orders: 48, revenue: 1800 },
  { date: 'Sun', views: 1600, orders: 45, revenue: 1600 },
]

const categoryBreakdown = [
  { name: 'Main Course', value: 45, color: '#FF7A32' },
  { name: 'Appetizers', value: 30, color: '#FFA45C' },
  { name: 'Desserts', value: 15, color: '#FFD6B3' },
  { name: 'Beverages', value: 10, color: '#FFE5D0' },
]

const customerMetrics = [
  { metric: 'New Customers', value: 156, change: '+12.5%' },
  { metric: 'Repeat Customers', value: 324, change: '+8.3%' },
  { metric: 'Customer Satisfaction', value: '4.7/5', change: '+0.2' },
  { metric: 'Avg Order Value', value: '₹285', change: '+15.2%' },
]

export default function Analytics() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your performance and insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            Last 7 Days
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {customerMetrics.map((item, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{item.metric}</p>
              <p className="text-2xl font-bold mt-2">{item.value}</p>
              <p className="text-xs text-emerald-600 mt-1">{item.change} this period</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Daily Performance</CardTitle>
              <CardDescription>Views, orders, and revenue trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="#FF7A32" strokeWidth={2} name="Views" />
                  <Line type="monotone" dataKey="orders" stroke="#FFA45C" strokeWidth={2} name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Distribution of orders</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value">
                  {categoryBreakdown.map((item, idx) => (
                    <Cell key={`cell-${idx}`} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {categoryBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>Daily revenue for the week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#FF7A32" name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
