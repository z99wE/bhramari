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
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-bespoke-accent/20 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <Lock size={32} weight="duotone" className="text-bespoke-accent" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Bhramari
          </h2>
          <p className="text-bespoke-muted text-sm max-w-xs mx-auto">
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
