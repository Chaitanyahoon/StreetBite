'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
    const { user, refreshUser } = useAuth()
    const [adminProfile, setAdminProfile] = useState<any>(null)

    useEffect(() => {
        if (user) {
            setAdminProfile({ ...user })
        }
    }, [user])

    if (!adminProfile) {
        return <div className="p-8">Loading settings...</div>
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your account and platform preferences</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Profile Information
                            </CardTitle>
                            <CardDescription>Update your personal details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        value={adminProfile.displayName || ''}
                                        onChange={(e) => setAdminProfile({ ...adminProfile, displayName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={adminProfile.email || ''} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Input value={adminProfile.role || ''} disabled />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={async () => {
                                    try {
                                        const { userApi } = await import('@/lib/api')
                                        await userApi.update(adminProfile.id, { displayName: adminProfile.displayName })
                                        await refreshUser()
                                        toast.success('Profile updated successfully')
                                    } catch (err) {
                                        console.error(err)
                                        toast.error('Failed to update profile')
                                    }
                                }}>Save Changes</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
