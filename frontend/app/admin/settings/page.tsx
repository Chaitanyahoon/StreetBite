'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { User, Lock, Bell, Shield } from 'lucide-react'

export default function AdminSettingsPage() {
    const [adminProfile, setAdminProfile] = useState<any>(null)
    const [maintenanceMode, setMaintenanceMode] = useState(false)
    const [emailNotifications, setEmailNotifications] = useState(true)

    useEffect(() => {
        // Load admin profile from local storage
        const userStr = localStorage.getItem('user')
        if (userStr) {
            setAdminProfile(JSON.parse(userStr))
        }
    }, [])

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
                                    <Input defaultValue={adminProfile.displayName || 'Admin User'} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input defaultValue={adminProfile.email} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Input defaultValue={adminProfile.role} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input defaultValue="+91 98765 43210" />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button>Save Changes</Button>
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
                            <div className="space-y-2">
                                <Label>Current Password</Label>
                                <Input type="password" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>New Password</Label>
                                    <Input type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Confirm Password</Label>
                                    <Input type="password" />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button variant="outline">Update Password</Button>
                            </div>
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
