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
        <div className="min-h-screen bg-white flex flex-col relative overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            {/* Back button */}
            <div className="p-4 sm:p-6 relative z-10 hidden md:block">
                <Link href="/signin" className="inline-flex items-center gap-2 text-black font-bold uppercase tracking-wider hover:text-orange-500 transition-colors group">
                    <ArrowLeft size={24} className="stroke-[3] group-hover:-translate-x-1 transition-transform" />
                    Back to Sign In
                </Link>
            </div>

            {/* Reset Form */}
            <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
                <div className="w-full max-w-md">
                    {/* Logo and Heading */}
                    <div className="text-center mb-10">
                        <div className="flex justify-center mb-6 hover:scale-105 transition-transform duration-300">
                            <Logo />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black mb-3 uppercase tracking-tighter transform -rotate-2">
                            Set New <span className="text-orange-500 bg-black px-2 py-0.5 transform rotate-2 inline-block border-2 border-transparent">Password</span>
                        </h1>
                        <p className="text-black font-bold text-lg max-w-xs mx-auto leading-tight">
                            Create a strong password to secure your street bites.
                        </p>
                    </div>

                    <form onSubmit={handleResetPassword} className="space-y-6 bg-white rounded-3xl p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
                        {status === 'success' ? (
                            <div className="text-center space-y-6 animate-scale-in">
                                <div className="w-20 h-20 bg-green-400 text-black border-4 border-black rounded-full flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <CheckCircle size={40} className="stroke-[3]" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black uppercase tracking-tight">Pasword Reset!</h3>
                                    <p className="text-black font-medium">
                                        Your password has been updated successfully.
                                    </p>
                                </div>
                                <Link href="/signin" className="block">
                                    <Button className="w-full h-14 rounded-xl text-xl font-black uppercase tracking-wider bg-black text-white border-4 border-black shadow-[4px_4px_0px_0px_#fbbf24] hover:shadow-[6px_6px_0px_0px_#fbbf24] hover:-translate-y-1 transition-all hover:bg-orange-500 active:translate-y-0">
                                        Sign In Now
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                {status === 'error' && (
                                    <div className="bg-red-100 border-4 border-black text-black px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-shake">
                                        <span className="w-3 h-3 rounded-full bg-red-500 border-2 border-black" />
                                        {errorMessage}
                                    </div>
                                )}

                                {/* Token Input */}
                                {!tokenFromUrl && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-black uppercase tracking-wide ml-1">Reset Token</label>
                                        <input
                                            type="text"
                                            value={token}
                                            onChange={(e) => setToken(e.target.value)}
                                            placeholder="PASTE TOKEN"
                                            className="w-full px-4 py-4 border-4 border-black rounded-xl focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white transition-all font-bold placeholder:text-gray-400"
                                            required
                                        />
                                    </div>
                                )}

                                {/* New Password */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-black uppercase tracking-wide ml-1">New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black transition-colors size-6 stroke-[2.5]" />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="ENTER NEW PASSWORD"
                                            className="w-full pl-12 pr-4 py-4 border-4 border-black rounded-xl focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white transition-all font-bold placeholder:text-gray-400"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-black uppercase tracking-wide ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black transition-colors size-6 stroke-[2.5]" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="CONFIRM PASSWORD"
                                            className="w-full pl-12 pr-4 py-4 border-4 border-black rounded-xl focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white transition-all font-bold placeholder:text-gray-400"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 rounded-xl text-xl font-black uppercase tracking-wider bg-black text-white border-4 border-black shadow-[4px_4px_0px_0px_#fbbf24] hover:shadow-[6px_6px_0px_0px_#fbbf24] hover:-translate-y-1 transition-all hover:bg-orange-500 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'RESETTING...' : 'RESET PASSWORD'}
                                </Button>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}
