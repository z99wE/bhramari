import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { ShieldCheck, Warning, Robot } from '@phosphor-icons/react'

const ALLOWED_DOMAINS = ['gmail.com'] // You can add custom domains here, e.g., 'yourcompany.com'

interface LoginProps {
  onLoginSuccess: () => void
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [error, setError] = useState<string | null>(null)

  const handleSuccess = (credentialResponse: any) => {
    try {
      if (credentialResponse.credential) {
        const decoded = jwtDecode<{ email: string }>(credentialResponse.credential)
        const email = decoded.email
        const domain = email.split('@')[1]

        // Option A: Strict Allowlist for domains
        if (ALLOWED_DOMAINS.includes(domain)) {
          setError(null)
          onLoginSuccess()
        } else {
          setError(`Access Denied: The domain @${domain} is not authorized. Please use a verified or corporate email.`)
        }
      }
    } catch (err) {
      console.error('Error decoding JWT', err)
      setError('An error occurred during authentication.')
    }
  }

  const handleError = () => {
    setError('Google Sign-In was unsuccessful. Please try again.')
  }

  return (
    <div className="min-h-screen bg-bespoke-dark text-bespoke-text flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-bespoke-border/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent blur-sm" />
        
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <Robot size={64} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" weight="duotone" />
            <ShieldCheck size={24} className="text-emerald-400 absolute -bottom-2 -right-2 bg-bespoke-dark rounded-full p-1" weight="fill" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2 text-center">
            Soloknuckle
          </h1>
          <p className="text-bespoke-muted text-center text-sm">
            Authenticate to access the Autonomous Hive Mind.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-3">
            <Warning size={20} className="text-rose-400 shrink-0 mt-0.5" weight="fill" />
            <p className="text-rose-200 text-sm leading-relaxed">{error}</p>
          </div>
        )}

        <div className="flex justify-center mt-6">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            theme="filled_black"
            size="large"
            shape="rectangular"
            text="continue_with"
            useOneTap
          />
        </div>

        <div className="mt-8 pt-6 border-t border-bespoke-border/30 text-center">
          <p className="text-xs text-bespoke-muted flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400/70" />
            Enterprise-grade secure access
          </p>
        </div>
      </div>
    </div>
  )
}
