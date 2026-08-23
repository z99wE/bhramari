import type { Submission, LeaderboardEntry, User, PatternMatch } from '../types'

const API_BASE = import.meta.env.VITE_API_URL || ''

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('bhramari_token')
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

export const api = {
  // Auth
  register: (data: { email: string; username: string; display_name?: string }) =>
    request<User>('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; username: string }) =>
    request<{ access_token: string; token_type: string; user: User }>(
      '/api/v1/auth/login',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  me: () => request<User>('/api/v1/auth/me'),

  // Submissions
  submit: (data: {
    title: string
    content: string
    source_language: string
    description?: string
    target_language?: string
  }) => request<{ id: string }>('/api/v1/submissions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  upload: (file: File, target_language: string = 'en') => {
    const form = new FormData()
    form.append('file', file)
    form.append('target_language', target_language)
    return fetch(`${API_BASE}/api/v1/submissions/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('bhramari_token') || ''}` },
      body: form,
    }).then(r => r.json())
  },

  getSubmission: (id: string) =>
    request<Submission>(`/api/v1/submissions/${id}`),

  // Patterns
  importPatterns: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return fetch(`${API_BASE}/api/v1/patterns/import`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('bhramari_token') || ''}` },
      body: form,
    }).then(r => r.json())
  },

  listPatterns: () =>
    request<PatternMatch[]>('/api/v1/patterns'),

  // Leaderboard
  leaderboard: (limit = 50) =>
    request<LeaderboardEntry[]>(`/api/v1/leaderboard?limit=${limit}`),

  // Health
  health: () => request<{ status: string; service: string; timestamp: string }>('/health'),
}
