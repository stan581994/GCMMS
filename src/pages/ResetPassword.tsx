import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ShieldCheck, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const EMAIL_API = 'http://localhost:3001'
const MIN_LENGTH = 8

type Stage = 'validating' | 'ready' | 'success' | 'error'

export function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [stage, setStage] = useState<Stage>('validating')
  const [errorMsg, setErrorMsg] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const t = searchParams.get('token')
    if (!t) {
      setErrorMsg('No reset token was found in this link.')
      setStage('error')
      return
    }
    setToken(t)

    fetch(`${EMAIL_API}/api/email/check-reset-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: t }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setStage('ready')
        } else {
          setErrorMsg(data.error ?? 'Invalid or expired reset link.')
          setStage('error')
        }
      })
      .catch(() => {
        setErrorMsg('Unable to reach the server. Please try again later.')
        setStage('error')
      })
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldError('')

    if (newPassword.length < MIN_LENGTH) {
      setFieldError(`Password must be at least ${MIN_LENGTH} characters.`)
      return
    }
    if (newPassword !== confirmPassword) {
      setFieldError('Passwords do not match.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`${EMAIL_API}/api/email/apply-reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: newPassword }),
      })
      const data = await res.json()
      if (data.ok) {
        setStage('success')
      } else {
        setFieldError(data.error ?? 'Failed to update password. Please try again.')
      }
    } catch {
      setFieldError('Unable to reach the server. Please try again later.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#F5FAFB' }}
    >
      <div
        className="w-full max-w-md rounded-xl p-8 text-center"
        style={{
          backgroundColor: '#ffffff',
          border: '2px solid #E8EFF5',
          boxShadow: '0 4px 24px rgba(75,158,255,0.08)',
        }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-6"
          style={{ color: '#4B9EFF', letterSpacing: '2px' }}
        >
          Golden City Member Management System
        </p>

        {stage === 'validating' && (
          <>
            <Loader2 className="mx-auto mb-4 animate-spin" style={{ color: '#4B9EFF', width: 48, height: 48 }} />
            <h1 className="text-xl font-bold mb-2" style={{ color: '#1A1E3F' }}>Verifying your link…</h1>
            <p className="text-sm" style={{ color: '#737B8F' }}>Please wait a moment.</p>
          </>
        )}

        {stage === 'ready' && (
          <Card className="text-left border-0 shadow-none p-0">
            <CardHeader className="pb-2 px-0 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                <ShieldCheck style={{ color: '#4B9EFF', width: 24, height: 24 }} />
              </div>
              <CardTitle className="text-lg" style={{ color: '#1A1E3F' }}>Set a New Password</CardTitle>
              <CardDescription>Choose a strong password for your account.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {fieldError && <p className="text-sm text-destructive">{fieldError}</p>}
                <Button type="submit" className="w-full" disabled={saving} style={{ backgroundColor: '#4B9EFF' }}>
                  {saving ? 'Saving…' : 'Set New Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {stage === 'success' && (
          <>
            <ShieldCheck className="mx-auto mb-4" style={{ color: '#4B9EFF', width: 56, height: 56 }} />
            <h1 className="text-2xl font-bold mb-3" style={{ color: '#1A1E3F' }}>Password Updated!</h1>
            <p className="text-sm mb-8" style={{ color: '#737B8F', lineHeight: 1.7 }}>
              Your password has been changed successfully. You can now sign in with your new password.
            </p>
            <Button
              className="w-full font-semibold"
              style={{ backgroundColor: '#4B9EFF', color: '#ffffff' }}
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </>
        )}

        {stage === 'error' && (
          <>
            <XCircle className="mx-auto mb-4" style={{ color: '#E8573F', width: 56, height: 56 }} />
            <h1 className="text-2xl font-bold mb-3" style={{ color: '#1A1E3F' }}>Link Invalid or Expired</h1>
            <p className="text-sm mb-8" style={{ color: '#737B8F', lineHeight: 1.7 }}>{errorMsg}</p>
            <Button
              variant="outline"
              className="w-full font-semibold"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>
          </>
        )}

        <p
          className="text-xs mt-8"
          style={{ color: '#B0BAC9', letterSpacing: '1px', textTransform: 'uppercase' }}
        >
          Powered by Golden City Member Management System
        </p>
      </div>
    </div>
  )
}
