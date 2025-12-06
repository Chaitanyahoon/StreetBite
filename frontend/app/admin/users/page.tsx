'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { userApi } from '@/lib/api'
import { Search, Shield, ShieldAlert, ShieldCheck, User as UserIcon } from 'lucide-react'
import Link from 'next/link'

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
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
            setUsers(response)
        } catch (error) {
            console.error('Error fetching users:', error)
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

    const filteredUsers = users.filter(user =>
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return <div className="p-8">Loading users...</div>

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-muted-foreground">Manage user accounts and permissions</p>
                </div>
                <Link href="/admin">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Users ({users.length})</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                placeholder="Search users..."
                                className="pl-8 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredUsers.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        {user.profilePicture ? (
                                            <img src={user.profilePicture} alt={user.displayName} className="h-10 w-10 rounded-full object-cover" />
                                        ) : (
                                            <UserIcon className="h-5 w-5 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">{user.displayName}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                user.role === 'VENDOR' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                            {!user.active && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                                                    <ShieldAlert className="w-3 h-3" /> Banned
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="text-right mr-4 hidden md:block">
                                        <p className="text-sm font-medium">Joined</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {user.role !== 'ADMIN' && (
                                        <Button
                                            variant={user.active ? "outline" : "destructive"}
                                            size="sm"
                                            onClick={() => handleStatusToggle(user.id, user.active)}
                                            className={user.active ? "text-red-600 hover:text-red-700 hover:bg-red-50" : ""}
                                        >
                                            {user.active ? 'Ban User' : 'Unban User'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
