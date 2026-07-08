import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const EMAIL_API = 'http://localhost:3001'

type State = 'loading' | 'success' | 'error'

export function ConfirmAccount() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [state, setState] = useState<State>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setErrorMsg('No confirmation token was found in this link.')
      setState('error')
      return
    }

    fetch(`${EMAIL_API}/api/email/confirm-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setState('success')
        } else {
          setErrorMsg(data.error ?? 'Something went wrong. Please contact your administrator.')
          setState('error')
        }
      })
      .catch(() => {
        setErrorMsg('Unable to reach the server. Please try again later.')
        setState('error')
      })
  }, [searchParams])

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
        {/* Top brand label */}
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-6"
          style={{ color: '#4B9EFF', letterSpacing: '2px' }}
        >
          Golden City Member Management System
        </p>

        {state === 'loading' && (
          <>
            <Loader2
              className="mx-auto mb-4 animate-spin"
              style={{ color: '#4B9EFF', width: 48, height: 48 }}
            />
            <h1 className="text-xl font-bold mb-2" style={{ color: '#1A1E3F' }}>
              Confirming your account…
            </h1>
            <p className="text-sm" style={{ color: '#737B8F' }}>
              Please wait while we activate your account.
            </p>
          </>
        )}

        {state === 'success' && (
          <>
            <CheckCircle
              className="mx-auto mb-4"
              style={{ color: '#4B9EFF', width: 56, height: 56 }}
            />
            <h1 className="text-2xl font-bold mb-3" style={{ color: '#1A1E3F' }}>
              Account Confirmed!
            </h1>
            <p className="text-sm mb-8" style={{ color: '#737B8F', lineHeight: 1.7 }}>
              Your account has been successfully activated. You can now log in using your email and the temporary password provided in the welcome email.
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

        {state === 'error' && (
          <>
            <XCircle
              className="mx-auto mb-4"
              style={{ color: '#E8573F', width: 56, height: 56 }}
            />
            <h1 className="text-2xl font-bold mb-3" style={{ color: '#1A1E3F' }}>
              Link Invalid or Expired
            </h1>
            <p className="text-sm mb-8" style={{ color: '#737B8F', lineHeight: 1.7 }}>
              {errorMsg}
            </p>
            <Button
              variant="outline"
              className="w-full font-semibold"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>
          </>
        )}

        {/* Outside-card footer */}
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
