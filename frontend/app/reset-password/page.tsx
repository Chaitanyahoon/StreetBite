'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Lock, ArrowLeft, CheckCircle, Clock, AlertTriangle, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { authApi } from '@/lib/api'

function CountdownTimer({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
    const [remaining, setRemaining] = useState(seconds)

    useEffect(() => {
        setRemaining(seconds)
    }, [seconds])

    useEffect(() => {
        if (remaining <= 0) {
            onExpire()
            return
        }
        const interval = setInterval(() => {
            setRemaining(prev => {
                if (prev <= 1) {
                    onExpire()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [remaining, onExpire])

    const minutes = Math.floor(remaining / 60)
    const secs = remaining % 60
    const percentage = seconds > 0 ? (remaining / seconds) * 100 : 0
    const isUrgent = remaining < 120 // Less than 2 min

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-4 border-black font-bold text-sm transition-colors ${isUrgent ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-yellow-100 text-black'}`}>
            <Clock className={`w-5 h-5 ${isUrgent ? 'text-red-600' : 'text-black'}`} />
            <div className="flex-1">
                <div className="flex justify-between mb-1">
                    <span className="font-black uppercase tracking-wide text-xs">Token expires in</span>
                    <span className="font-black tabular-nums text-base">
                        {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                    </span>
                </div>
                <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden border border-black/20">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${isUrgent ? 'bg-red-500' : 'bg-black'}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </div>
    )
}

function PasswordStrength({ password }: { password: string }) {
    const checks = [
        { label: '6+ characters', pass: password.length >= 6 },
        { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
        { label: 'Lowercase letter', pass: /[a-z]/.test(password) },
        { label: 'Number', pass: /\d/.test(password) },
        { label: 'Special char', pass: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ]
    const score = checks.filter(c => c.pass).length

    if (!password) return null

    const getStrengthLabel = () => {
        if (score <= 2) return { text: 'WEAK', color: 'text-red-600', bg: 'bg-red-500' }
        if (score <= 3) return { text: 'FAIR', color: 'text-yellow-600', bg: 'bg-yellow-500' }
        if (score <= 4) return { text: 'STRONG', color: 'text-green-600', bg: 'bg-green-500' }
        return { text: 'VERY STRONG', color: 'text-green-700', bg: 'bg-green-600' }
    }

    const strength = getStrengthLabel()

    return (
        <div className="space-y-2 mt-2">
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                    <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 border border-black/10 ${i <= score ? strength.bg : 'bg-gray-200'}`}
                    />
                ))}
            </div>
            <div className="flex justify-between items-center">
                <span className={`text-[10px] font-black uppercase tracking-widest ${strength.color}`}>
                    {strength.text}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-1">
                {checks.map((check, i) => (
                    <span key={i} className={`text-[10px] font-bold ${check.pass ? 'text-green-600' : 'text-gray-400'}`}>
                        {check.pass ? '✓' : '○'} {check.label}
                    </span>
                ))}
            </div>
        </div>
    )
}

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const tokenFromUrl = searchParams.get('token')

    const [token, setToken] = useState(tokenFromUrl || '')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'validating' | 'valid' | 'expired' | 'invalid' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')
    const [remainingSeconds, setRemainingSeconds] = useState(0)

    // Validate token on mount
    useEffect(() => {
        if (tokenFromUrl) {
            setToken(tokenFromUrl)
            validateToken(tokenFromUrl)
        }
    }, [tokenFromUrl])

    const validateToken = async (tokenVal: string) => {
        setStatus('validating')
        try {
            const result = await authApi.validateResetToken(tokenVal)
            if (result.valid) {
                setStatus('valid')
                setRemainingSeconds(result.remainingSeconds || 0)
            } else {
                setStatus(result.error?.includes('expired') ? 'expired' : 'invalid')
                setErrorMessage(result.error || 'Invalid token')
            }
        } catch (err: any) {
            setStatus('invalid')
            setErrorMessage('Unable to validate token. Please try again.')
        }
    }

    const handleTokenExpire = useCallback(() => {
        setStatus('expired')
        setErrorMessage('Your reset token has expired. Please request a new one.')
    }, [])

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
        setErrorMessage('')

        try {
            await authApi.resetPassword({ token, newPassword })
            setStatus('success')
        } catch (err: any) {
            setStatus('error')
            setErrorMessage(err.response?.data?.error || 'Failed to reset password. The token may be invalid or expired.')
        } finally {
            setIsLoading(false)
        }
    }

    // Expired / Invalid token screen
    if (status === 'expired' || status === 'invalid') {
        return (
            <div className="min-h-screen bg-white flex flex-col relative overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                <div className="p-4 sm:p-6 relative z-10 hidden md:block">
                    <Link href="/signin" className="inline-flex items-center gap-2 text-black font-bold uppercase tracking-wider hover:text-orange-500 transition-colors group">
                        <ArrowLeft size={24} className="stroke-[3] group-hover:-translate-x-1 transition-transform" />
                        Back to Sign In
                    </Link>
                </div>
                <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
                    <div className="w-full max-w-md text-center space-y-6 bg-white rounded-3xl p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="w-20 h-20 bg-red-100 border-4 border-black rounded-full flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <AlertTriangle size={40} className="text-red-600 stroke-[2.5]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
                                {status === 'expired' ? 'Token Expired' : 'Invalid Token'}
                            </h2>
                            <p className="text-gray-600 font-medium">
                                {status === 'expired'
                                    ? 'This reset link has expired. Reset tokens are valid for 15 minutes.'
                                    : 'This reset link is invalid or has already been used. Each token can only be used once.'}
                            </p>
                        </div>
                        <Link href="/signin" className="block">
                            <Button className="w-full h-14 rounded-xl text-xl font-black uppercase tracking-wider bg-black text-white border-4 border-black shadow-[4px_4px_0px_0px_#fbbf24] hover:shadow-[6px_6px_0px_0px_#fbbf24] hover:-translate-y-1 transition-all hover:bg-orange-500">
                                Request New Link
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Validating state
    if (status === 'validating') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-black border-t-orange-500 rounded-full animate-spin mx-auto" />
                    <p className="text-black font-black uppercase tracking-widest text-sm">Validating token...</p>
                </div>
            </div>
        )
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

                    <form onSubmit={handleResetPassword} className="space-y-5 bg-white rounded-3xl p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
                        {status === 'success' ? (
                            <div className="text-center space-y-6 animate-scale-in">
                                <div className="w-20 h-20 bg-green-400 text-black border-4 border-black rounded-full flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <CheckCircle size={40} className="stroke-[3]" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black uppercase tracking-tight">Password Reset!</h3>
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
                                {/* Countdown Timer */}
                                {remainingSeconds > 0 && status === 'valid' && (
                                    <CountdownTimer seconds={remainingSeconds} onExpire={handleTokenExpire} />
                                )}

                                {/* Security badge */}
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border-2 border-green-200">
                                    <ShieldCheck className="w-4 h-4 text-green-600" />
                                    <span className="text-[10px] font-black text-green-700 uppercase tracking-wider">One-time use token • Encrypted connection</span>
                                </div>

                                {status === 'error' && (
                                    <div className="bg-red-100 border-4 border-black text-black px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-shake">
                                        <span className="w-3 h-3 rounded-full bg-red-500 border-2 border-black" />
                                        {errorMessage}
                                    </div>
                                )}

                                {/* Token Input (only if not in URL) */}
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
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="ENTER NEW PASSWORD"
                                            className="w-full pl-12 pr-12 py-4 border-4 border-black rounded-xl focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white transition-all font-bold placeholder:text-gray-400"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <PasswordStrength password={newPassword} />
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-black uppercase tracking-wide ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black transition-colors size-6 stroke-[2.5]" />
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="CONFIRM PASSWORD"
                                            className={`w-full pl-12 pr-12 py-4 border-4 rounded-xl focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white transition-all font-bold placeholder:text-gray-400 ${confirmPassword && confirmPassword !== newPassword ? 'border-red-500' : 'border-black'}`}
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                        >
                                            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {confirmPassword && confirmPassword !== newPassword && (
                                        <p className="text-[10px] font-black text-red-500 uppercase tracking-wider ml-1">
                                            ✗ Passwords don&apos;t match
                                        </p>
                                    )}
                                    {confirmPassword && confirmPassword === newPassword && (
                                        <p className="text-[10px] font-black text-green-600 uppercase tracking-wider ml-1">
                                            ✓ Passwords match
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
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

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex flex-col items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-black font-black uppercase tracking-widest text-sm">Verifying Session...</p>
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}
