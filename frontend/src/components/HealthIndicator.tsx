import { useEffect, useState } from 'react'
import { api } from '../services/api'

export function HealthIndicator() {
  const [status, setStatus] = useState<'unknown' | 'healthy' | 'error'>('unknown')

  useEffect(() => {
    api.health()
      .then(() => setStatus('healthy'))
      .catch(() => setStatus('error'))
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full glass text-xs font-medium">
      <span className={`w-2 h-2 rounded-full ${status === 'healthy' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-gray-500'}`} />
      <span className="text-gray-400">
        {status === 'healthy' ? 'API Connected' : status === 'error' ? 'API Offline' : 'Checking...'}
      </span>
    </div>
  )
}
