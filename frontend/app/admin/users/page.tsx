'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { userApi, type ApiUser } from '@/lib/api'
import { Search, Shield, ShieldAlert, ShieldCheck, User as UserIcon } from 'lucide-react'
import Link from 'next/link'

export default function UserManagementPage() {
    const [users, setUsers] = useState<ApiUser[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const fetchUsers = async () => {
        try {
            // Need to add getAll to userApi first, but assuming it exists or using direct axios for now if needed
            // Since we just added GET /api/users to backend, we need to call it.
            // Let's use a direct call if userApi doesn't have it, or update userApi.
            // For now, I'll assume I'll update userApi in the next step or use a custom fetch here.
            // Actually, I should update api.ts first. But I can use a workaround here or update api.ts.
            // I'll update api.ts in the next step.
            const response = await userApi.getAll()
            setUsers(Array.isArray(response) ? response : [])
            setError(null)
        } catch (error) {
            console.error('Error fetching users:', error)
            setError('Failed to load users. Please refresh and try again.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
        try {
            await userApi.updateStatus(userId, !currentStatus)
            // Refresh list
            fetchUsers()
        } catch (error) {
            console.error('Error updating user status:', error)
        }
    }

    const filteredUsers = users.filter(user => {
        // Strict filter: User Management logic (Customers only)
        // Explicitly exclude Vendors and Admins to address user feedback
        if (user.role === 'VENDOR' || user.role === 'ADMIN') return false;

        return (
            (user.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
    })

    if (loading) return <div className="p-8">Loading users...</div>

    if (error) {
        return (
            <div className="p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Management Unavailable</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={fetchUsers}>Retry</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto pb-10 pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-black text-black uppercase tracking-tight">Customer Management</h1>
                    <p className="text-xs sm:text-sm font-bold text-black/60 mt-1">Manage customer accounts and permissions</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button 
                        onClick={() => window.open('/api/newsletter/export', '_blank', 'noopener,noreferrer')}
                        className="flex-1 sm:flex-initial bg-emerald-300 hover:bg-emerald-400 text-black border-2 border-black font-black uppercase text-xs h-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer text-center"
                    >
                        Export Newsletter (CSV)
                    </Button>
                    <Link href="/admin" className="flex-1 sm:flex-initial">
                        <Button variant="outline" className="w-full border-2 border-black bg-white hover:bg-gray-100 text-black font-black uppercase text-xs h-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer">
                            Back
                        </Button>
                    </Link>
                </div>
            </div>

            <Card className="bg-[#fffaf4] border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="border-b-2 border-black/10 pb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                            <CardTitle className="text-sm sm:text-base font-black uppercase tracking-wider text-black">Customers ({filteredUsers.length})</CardTitle>
                            <CardDescription className="text-xs font-bold text-black/40">Active shoppers and review yappers</CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black/50" />
                            <input
                                placeholder="Search users..."
                                className="pl-9 h-10 w-full border-2 border-black rounded-xl bg-white focus-visible:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-bold placeholder:text-gray-400 text-xs outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {filteredUsers.map((user) => {
                            const isActive = user.active ?? true

                            return (
                            <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-2 border-black rounded-xl bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-orange-100 border-2 border-black flex items-center justify-center flex-shrink-0">
                                        {user.profilePicture ? (
                                            <Image src={user.profilePicture} alt={user.displayName || user.email} width={40} height={40} className="h-full w-full rounded-lg object-cover" unoptimized />
                                        ) : (
                                            <UserIcon className="h-5 w-5 text-black" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-black text-sm text-black uppercase tracking-tight leading-none">{user.displayName}</p>
                                        <p className="text-xs font-bold text-black/50 mt-1">{user.email}</p>
                                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                            <span className={`px-2 py-0.5 border-2 border-black rounded-lg text-[9px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] ${
                                                user.role === 'ADMIN' ? 'bg-emerald-300 text-black' :
                                                user.role === 'VENDOR' ? 'bg-orange-300 text-black' :
                                                'bg-sky-200 text-black'
                                            }`}>
                                                {user.role}
                                            </span>
                                            {!isActive && (
                                                <span className="px-2 py-0.5 border-2 border-black rounded-lg text-[9px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] bg-red-300 text-black flex items-center gap-1">
                                                    <ShieldAlert className="w-3 h-3" /> Banned
                                                </span>
                                            )}
                                            <span className="sm:hidden text-black/40 text-[10px] font-bold mt-0.5">
                                                Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-black/5 pt-3 sm:pt-0">
                                    <div className="text-left sm:text-right sm:mr-4 hidden sm:block">
                                        <p className="text-[10px] text-black/40 font-black uppercase">Joined</p>
                                        <p className="text-xs font-bold text-black/70">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                                        </p>
                                    </div>

                                    {user.role !== 'ADMIN' && (
                                        <Button
                                            variant={isActive ? "outline" : "destructive"}
                                            size="sm"
                                            onClick={() => handleStatusToggle(user.id, isActive)}
                                            className={`w-full sm:w-auto h-9 border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer ${
                                                isActive 
                                                  ? "bg-red-100 hover:bg-red-200 text-red-800" 
                                                  : "bg-emerald-300 hover:bg-emerald-400 text-black"
                                            }`}
                                        >
                                            {isActive ? 'Ban User' : 'Unban User'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
