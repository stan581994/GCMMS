import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const hints = [
  { email: 'steven@gcw.org', role: 'Admin' },
  { email: 'archie@gcw.org', role: 'Clerk' },
  { email: 'lehi@gcw.org', role: 'Clerk' },
  { email: 'saple@gcw.org', role: 'Ministering' },
]

export function Login() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, isLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const ok = await login(email, password)
      if (ok) {
        navigate('/dashboard', { replace: true })
      } else {
        setError('Invalid email or account not found.')
      }
    } catch (err) {
      console.error('[handleSubmit] unexpected error', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Ward Member Records</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sign In</CardTitle>
            <CardDescription>Enter your email to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@ward.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
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
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Dev credentials hint */}
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dev — Mock Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pb-4">
            {hints.map((h) => (
              <button
                key={h.email}
                type="button"
                onClick={() => setEmail(h.email)}
                className="flex w-full items-center justify-between rounded px-2 py-1 text-left text-xs hover:bg-accent"
              >
                <span className="font-mono text-muted-foreground">{h.email}</span>
                <span className="text-muted-foreground">{h.role}</span>
              </button>
            ))}
            <p className="mt-2 text-xs text-muted-foreground">Password: <span className="font-mono">GoldenCity</span></p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
