'use client'

import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { vendorApi } from '@/lib/api'
import { toast } from 'sonner'
import Link from 'next/link'
import { TrendingUp, Settings } from 'lucide-react'

// Vendor interface for type safety
interface Vendor {
    id: string | number
    name: string
    status?: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE'
}

export default function VendorDashboardPage() {
    const router = useRouter()
    const [vendor, setVendor] = useState<Vendor | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const userStr = localStorage.getItem('user')
        if (!userStr) {
            router.push('/signin')
            return
        }

        try {
            const user = JSON.parse(userStr)
            if (user.role !== 'VENDOR') {
                toast.error('Access denied. Only vendors can access this page.')
                router.push('/')
                return
            }

            const vendorId = String(user.vendorId)
            if (!vendorId || vendorId === 'undefined' || vendorId === 'null') {
                toast.error('Invalid vendor ID. Please contact support.')
                router.push('/')
                return
            }

            const fetchVendor = async () => {
                try {
                    const vendorData: Vendor = await vendorApi.getById(vendorId)
                    setVendor(vendorData)
                } catch (error) {
                    console.error('Error fetching vendor:', error)
                    toast.error('Failed to load vendor data.')
                } finally {
                    setLoading(false)
                }
            }

            fetchVendor()
        } catch (error) {
            console.error('Error parsing user data:', error)
            toast.error('Invalid user session')
            router.push('/signin')
        }
    }, [router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">
                            Welcome back, {vendor?.name || 'Vendor'}!
                        </h1>
                        <p className="text-gray-600">Manage your street food business</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {vendor?.status && (
                            <div className={`px-4 py-2 rounded-full font-semibold ${vendor.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                    vendor.status === 'BUSY' ? 'bg-orange-100 text-orange-700' :
                                        'bg-red-100 text-red-700'
                                }`}>
                                {vendor.status}
                            </div>
                        )}
                        <Link href="/vendor/settings">
                            <Button variant="outline" className="gap-2">
                                <Settings size={18} />
                                Settings
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
                <Link href="/vendor/menu" className="block">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:border-orange-500 hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                                <svg className="w-6 h-6 text-orange-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Menu</h3>
                                <p className="text-sm text-gray-600">Manage items</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link href="/vendor/analytics" className="block">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                                <TrendingUp className="w-6 h-6 text-blue-600 group-hover:text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Analytics</h3>
                                <p className="text-sm text-gray-600">View insights</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link href="/vendor/promotions" className="block">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                                <svg className="w-6 h-6 text-purple-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Promotions</h3>
                                <p className="text-sm text-gray-600">Create offers</p>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Getting Started Guide */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="h-1 w-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></span>
                    Quick Tips
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                        <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                            1
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Update Your Status</h3>
                            <p className="text-sm text-gray-600">
                                Let customers know if you're Available, Busy, or Unavailable in Settings
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                            2
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Keep Menu Fresh</h3>
                            <p className="text-sm text-gray-600">
                                Toggle item availability as your stock changes throughout the day
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                            3
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Complete Your Profile</h3>
                            <p className="text-sm text-gray-600">
                                Add banner and logo images to make your stall stand out
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                            4
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Run Promotions</h3>
                            <p className="text-sm text-gray-600">
                                Attract more customers with limited-time offers and discounts
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
