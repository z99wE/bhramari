import { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { LeaderboardEntry } from '../types'

export function useLeaderboard(limit = 10) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.leaderboard(limit)
      .then(setEntries)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [limit])

  return { entries, loading }
}
