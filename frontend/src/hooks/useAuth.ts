import { useState, useCallback } from 'react'
import { api } from '../services/api'
import type { User } from '../types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const isLoggedIn = !!user && !!localStorage.getItem('bhramari_token')

  const login = useCallback(async (email: string, username: string) => {
    setLoading(true)
    try {
      // Register first (idempotent in backend)
      await api.register({ email, username }).catch(() => {})
      const data = await api.login({ email, username })
      localStorage.setItem('bhramari_token', data.access_token)
      setUser(data.user)
      return true
    } catch (e) {
      console.error('Login failed', e)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('bhramari_token')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('bhramari_token')
    if (!token) return
    try {
      const u = await api.me()
      setUser(u)
    } catch {
      localStorage.removeItem('bhramari_token')
      setUser(null)
    }
  }, [])

  // Auto-login on mount
  useState(() => {
    const token = localStorage.getItem('bhramari_token')
    if (token) refreshUser()
  })

  return { user, loading, isLoggedIn, login, logout, refreshUser }
}
