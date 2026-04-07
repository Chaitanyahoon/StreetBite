'use client'

import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { vendorApi, type ApiVendor, type VendorStatus } from '@/lib/api'
import { toast } from 'sonner'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import {
    getQuickActionClasses,
    getVendorStatusPillClassName,
    SETTINGS_ACTION,
    VENDOR_QUICK_ACTIONS,
    VENDOR_TIPS,
    type VendorSummary,
} from './dashboard-helpers'

export default function VendorDashboardPage() {
    const router = useRouter()
    const { user, isLoading: authLoading } = useAuth()
    const [vendor, setVendor] = useState<VendorSummary | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (authLoading) return

        if (!user) {
            router.push('/signin')
            return
        }

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
                const vendorData: ApiVendor = await vendorApi.getById(vendorId)
                setVendor(vendorData)
            } catch (error) {
                console.error('Error fetching vendor:', error)
                toast.error('Failed to load vendor data.')
            } finally {
                setLoading(false)
            }
        }

        fetchVendor()
    }, [user, authLoading, router])

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
                            <div className={`px-4 py-2 rounded-full font-semibold ${getVendorStatusPillClassName(vendor.status)}`}>
                                {vendor.status}
                            </div>
                        )}
                        <Link href={SETTINGS_ACTION.href}>
                            <Button variant="outline" className="gap-2">
                                <SETTINGS_ACTION.icon size={18} />
                                {SETTINGS_ACTION.label}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
                {VENDOR_QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon
                    const classes = getQuickActionClasses(action.accentClassName)

                    return (
                        <Link key={action.href} href={action.href} className="block">
                            <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 transition-all cursor-pointer group ${classes.card}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${classes.iconWrap}`}>
                                        <Icon className={`w-6 h-6 transition-colors ${classes.icon}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{action.title}</h3>
                                        <p className="text-sm text-gray-600">{action.description}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* Getting Started Guide */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="h-1 w-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></span>
                    Quick Tips
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {VENDOR_TIPS.map((tip) => (
                        <div key={tip.step} className={`flex items-start gap-3 p-4 rounded-lg ${tip.cardClassName}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-0.5 ${tip.badgeClassName}`}>
                                {tip.step}
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">{tip.title}</h3>
                                <p className="text-sm text-gray-600">
                                    {tip.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
