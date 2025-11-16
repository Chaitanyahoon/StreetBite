'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Users, ShoppingCart, AlertCircle } from 'lucide-react'

const platformData = [
  { date: 'Mon', vendors: 45, orders: 280, users: 1200 },
  { date: 'Tue', vendors: 48, orders: 420, users: 1350 },
  { date: 'Wed', vendors: 52, orders: 580, users: 1480 },
  { date: 'Thu', vendors: 50, orders: 520, users: 1420 },
  { date: 'Fri', vendors: 55, orders: 720, users: 1680 },
  { date: 'Sat', vendors: 58, orders: 890, users: 1920 },
  { date: 'Sun', vendors: 56, orders: 850, users: 1800 },
]

const recentVendors = [
  { id: 1, name: 'Golden Spice Cart', owner: 'Rajesh Kumar', status: 'Approved', revenue: '₹45,200', joinDate: '2025-01-10' },
  { id: 2, name: 'Tikka Masters', owner: 'Priya Singh', status: 'Pending', revenue: '₹0', joinDate: '2025-01-15' },
  { id: 3, name: 'Chai Corner', owner: 'Amit Patel', status: 'Approved', revenue: '₹23,500', joinDate: '2025-01-12' },
]

export default function AdminDashboard() {
  return (
    <div className="p-8 space-y-8">
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Vendors</p>
                <p className="text-2xl font-bold mt-2">245</p>
                <p className="text-xs text-emerald-600 mt-1">+12 this week</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold mt-2">8,540</p>
                <p className="text-xs text-emerald-600 mt-1">+2.5% this week</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold mt-2">4,340</p>
                <p className="text-xs text-emerald-600 mt-1">+18.2% this week</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Platform Revenue</p>
                <p className="text-2xl font-bold mt-2">₹52.4L</p>
                <p className="text-xs text-emerald-600 mt-1">+8.9% this week</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
            <CardDescription>Last 7 days overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#FF7A32" strokeWidth={2} name="Orders" />
                <Line type="monotone" dataKey="users" stroke="#FFA45C" strokeWidth={2} name="Users" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Growth</CardTitle>
            <CardDescription>Active vendors this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="vendors" fill="#FF7A32" name="Vendors" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Vendor Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Vendor Applications</CardTitle>
          <CardDescription>Manage vendor registrations and approvals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentVendors.map((vendor) => (
              <div key={vendor.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{vendor.name}</p>
                  <p className="text-sm text-muted-foreground">Owner: {vendor.owner}</p>
                </div>
                <div className="text-right mr-4">
                  <p className="text-sm font-medium">{vendor.revenue}</p>
                  <p className="text-xs text-muted-foreground">{vendor.joinDate}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  vendor.status === 'Approved'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {vendor.status}
                </span>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            View All Vendors
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
          <CardDescription>Recent platform notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">3 vendors awaiting approval</p>
              <p className="text-xs text-muted-foreground">Review and approve or reject pending vendors</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">New support tickets: 5</p>
              <p className="text-xs text-muted-foreground">Check support dashboard for customer inquiries</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
