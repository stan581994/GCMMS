import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePageTitle } from '@/hooks/usePageTitle'

const EMAIL_API = 'http://localhost:3001'
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 5 * 60 * 1000 // 5 minutes
const STORAGE_KEY = 'gcmms_login_attempts'

interface AttemptState {
  count: number
  lockedUntil: number | null // epoch ms, null = not locked
}

function getAttemptState(): AttemptState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { count: 0, lockedUntil: null }
}

function saveAttemptState(s: AttemptState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

function clearAttemptState() {
  localStorage.removeItem(STORAGE_KEY)
}

export function Login() {
  usePageTitle('Sign In')
  const { login, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Lockout state
  const [, setAttempts] = useState<AttemptState>(() => getAttemptState())
  const [secondsLeft, setSecondsLeft] = useState(0)

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotError, setForgotError] = useState('')

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, isLoading, navigate])

  // Sync lockout countdown
  const syncLockout = useCallback(() => {
    const state = getAttemptState()
    setAttempts(state)
    if (state.lockedUntil) {
      const remaining = Math.ceil((state.lockedUntil - Date.now()) / 1000)
      if (remaining > 0) {
        setSecondsLeft(remaining)
      } else {
        clearAttemptState()
        setAttempts({ count: 0, lockedUntil: null })
        setSecondsLeft(0)
      }
    }
  }, [])

  useEffect(() => {
    syncLockout()
  }, [syncLockout])

  // Countdown tick
  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearAttemptState()
          setAttempts({ count: 0, lockedUntil: null })
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [secondsLeft])

  const isLocked = secondsLeft > 0

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const recordFailure = () => {
    const state = getAttemptState()
    const newCount = state.count + 1
    const locked = newCount >= MAX_ATTEMPTS
    const next: AttemptState = {
      count: newCount,
      lockedUntil: locked ? Date.now() + LOCKOUT_MS : null,
    }
    saveAttemptState(next)
    setAttempts(next)
    if (locked) {
      setSecondsLeft(Math.ceil(LOCKOUT_MS / 1000))
    }
    return { newCount, locked }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked) return
    setError('')
    setLoading(true)
    try {
      const ok = await login(email, password)
      if (ok) {
        clearAttemptState()
        navigate('/dashboard', { replace: true })
      } else {
        const { newCount, locked } = recordFailure()
        if (locked) {
          setError(`Too many failed attempts. Please wait ${formatCountdown(Math.ceil(LOCKOUT_MS / 1000))} before trying again.`)
        } else {
          const remaining = MAX_ATTEMPTS - newCount
          setError(
            remaining === 1
              ? 'Invalid email or password. 1 attempt remaining before lockout.'
              : `Invalid email or password. ${remaining} attempts remaining.`
          )
        }
      }
    } catch (err) {
      console.error('[handleSubmit] unexpected error', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError('')
    setForgotLoading(true)
    try {
      const res = await fetch(`${EMAIL_API}/api/email/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      })
      const data = await res.json()
      if (data.ok) {
        setForgotSent(true)
      } else {
        setForgotError(data.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setForgotError('Unable to reach the server. Please try again later.')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
      </div>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Golden City Ward Member Records</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sign In</CardTitle>
            <CardDescription>Enter your email to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            {!showForgot ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@gcw.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    disabled={isLocked}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLocked}
                  />
                </div>

                {isLocked && (
                  <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                    Too many failed attempts. Try again in{' '}
                    <span className="font-semibold tabular-nums">{formatCountdown(secondsLeft)}</span>.
                  </div>
                )}

                {!isLocked && error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" className="w-full" disabled={loading || isLocked}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => {
                      setShowForgot(true)
                      setForgotEmail(email)
                      setError('')
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {!forgotSent ? (
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Enter the email address linked to your account and we'll send you a password reset link.
                    </p>
                    <div className="space-y-1.5">
                      <Label htmlFor="forgot-email">Email</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="you@gcw.org"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    {forgotError && <p className="text-sm text-destructive">{forgotError}</p>}
                    <Button type="submit" className="w-full" disabled={forgotLoading}>
                      {forgotLoading ? 'Sending…' : 'Send Reset Link'}
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        className="text-sm text-muted-foreground hover:underline"
                        onClick={() => {
                          setShowForgot(false)
                          setForgotSent(false)
                          setForgotError('')
                        }}
                      >
                        Back to Sign In
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">Reset link sent</p>
                    <p className="text-sm text-muted-foreground">
                      If <strong>{forgotEmail}</strong> is registered, you'll receive an email with a reset link shortly. Check your inbox.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setShowForgot(false)
                        setForgotSent(false)
                        setForgotEmail('')
                      }}
                    >
                      Back to Sign In
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
