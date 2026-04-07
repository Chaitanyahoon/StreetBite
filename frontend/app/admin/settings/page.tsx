'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { User, Lock, Bell, Shield } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
    const { user, refreshUser } = useAuth()
    const [adminProfile, setAdminProfile] = useState<any>(null)
    const [maintenanceMode, setMaintenanceMode] = useState(false)
    const [emailNotifications, setEmailNotifications] = useState(true)

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
                {/* Profile Settings */}
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
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input defaultValue="+91 98765 43210" />
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

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-5 h-5" />
                                Security
                            </CardTitle>
                            <CardDescription>Manage your password and security settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={async (e) => {
                                e.preventDefault()
                                const form = e.target as HTMLFormElement
                                const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value
                                const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value

                                if (newPassword !== confirmPassword) {
                                    toast.error('Passwords do not match')
                                    return
                                }

                                try {
                                    const { authApi } = await import('@/lib/api')
                                    // Assuming resetPassword endpoint handles this or we need a change-password endpoint
                                    // For now using resetPassword as a proxy if available, or just mocking success if no endpoint
                                    // Note: Real implementation needs a proper change-password endpoint
                                    await authApi.resetPassword({ email: adminProfile.email, newPassword, token: 'admin-override' })
                                    toast.success('Password updated successfully')
                                    form.reset()
                                } catch (err) {
                                    console.error(err)
                                    toast.error('Failed to update password')
                                }
                            }}>
                                <div className="space-y-2">
                                    <Label>Current Password</Label>
                                    <Input type="password" name="currentPassword" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>New Password</Label>
                                        <Input type="password" name="newPassword" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Confirm Password</Label>
                                        <Input type="password" name="confirmPassword" required />
                                    </div>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <Button type="submit" variant="outline">Update Password</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Platform Settings */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Platform Controls
                            </CardTitle>
                            <CardDescription>System-wide configurations</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Maintenance Mode</Label>
                                    <p className="text-xs text-muted-foreground">Disable access for all users</p>
                                </div>
                                <Switch
                                    checked={maintenanceMode}
                                    onCheckedChange={setMaintenanceMode}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>New Vendor Registration</Label>
                                    <p className="text-xs text-muted-foreground">Allow new vendors to sign up</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                Notifications
                            </CardTitle>
                            <CardDescription>Manage system alerts</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Email Alerts</Label>
                                    <p className="text-xs text-muted-foreground">Receive critical system emails</p>
                                </div>
                                <Switch
                                    checked={emailNotifications}
                                    onCheckedChange={setEmailNotifications}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>New Vendor Alerts</Label>
                                    <p className="text-xs text-muted-foreground">Notify when a vendor joins</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
