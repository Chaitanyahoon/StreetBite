'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react'
import { authApi } from '@/lib/api'

export default function ResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const tokenFromUrl = searchParams.get('token')

    const [token, setToken] = useState(tokenFromUrl || '')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        if (tokenFromUrl) {
            setToken(tokenFromUrl)
        }
    }, [tokenFromUrl])

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            setErrorMessage("Passwords don't match")
            setStatus('error')
            return
        }

        if (newPassword.length < 6) {
            setErrorMessage("Password must be at least 6 characters")
            setStatus('error')
            return
        }

        setIsLoading(true)
        setStatus('idle')
        setErrorMessage('')

        try {
            await authApi.resetPassword({
                token,
                newPassword
            })
            setStatus('success')
        } catch (err: any) {
            console.error('Reset password error:', err)
            setStatus('error')
            setErrorMessage(err.response?.data?.error || 'Failed to reset password. The token may be invalid or expired.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-float -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl animate-float -z-10" style={{ animationDelay: '2s' }} />

            {/* Back button */}
            <div className="p-4 sm:p-6 relative z-10">
                <Link href="/signin" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors hover-lift">
                    <ArrowLeft size={20} />
                    Back to Sign In
                </Link>
            </div>

            {/* Reset Form */}
            <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
                <div className="w-full max-w-md animate-slide-up">
                    {/* Logo and Heading */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4 hover-lift">
                            <Logo />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">
                            <span className="text-shine-amber">Set New Password</span>
                        </h1>
                        <p className="text-muted-foreground">
                            Create a strong password for your account
                        </p>
                    </div>

                    <form onSubmit={handleResetPassword} className="space-y-6 glass rounded-3xl shadow-elevated p-8 border border-white/20">
                        {status === 'success' ? (
                            <div className="text-center space-y-6 animate-fade-in">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold text-foreground">Password Reset Successful!</h3>
                                    <p className="text-muted-foreground">
                                        Your password has been updated. You can now sign in with your new password.
                                    </p>
                                </div>
                                <Link href="/signin">
                                    <Button className="w-full btn-gradient h-12 rounded-xl text-lg font-semibold shadow-lg hover-lift hover-glow">
                                        Sign In Now
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                {status === 'error' && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
                                        <span className="w-2 h-2 rounded-full bg-red-500" />
                                        {errorMessage}
                                    </div>
                                )}

                                {/* Token Input (Hidden if present in URL, but useful if manual entry needed) */}
                                {!tokenFromUrl && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-foreground ml-1">Reset Token</label>
                                        <input
                                            type="text"
                                            value={token}
                                            onChange={(e) => setToken(e.target.value)}
                                            placeholder="Paste your reset token here"
                                            className="w-full px-4 py-3.5 border-2 border-primary/10 rounded-xl focus:outline-none focus:border-primary bg-white/50 transition-all hover:bg-white/80"
                                            required
                                        />
                                    </div>
                                )}

                                {/* New Password */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground ml-1">New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 group-hover:text-primary transition-colors size-5" />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-primary/10 rounded-xl focus:outline-none focus:border-primary bg-white/50 transition-all hover:bg-white/80"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 group-hover:text-primary transition-colors size-5" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            className="w-full pl-12 pr-4 py-3.5 border-2 border-primary/10 rounded-xl focus:outline-none focus:border-primary bg-white/50 transition-all hover:bg-white/80"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full btn-gradient h-12 rounded-xl text-lg font-semibold shadow-lg hover-lift hover-glow disabled:opacity-50"
                                >
                                    {isLoading ? 'Resetting Password...' : 'Reset Password'}
                                </Button>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}
