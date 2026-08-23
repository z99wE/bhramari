import { useEffect, useRef, useState, useCallback } from 'react'
import { api } from '../services/api'
import type { Finding, Submission } from '../types'

export function useSwarm(submissionId: string | null) {
  const [status, setStatus] = useState<'idle' | 'swarming' | 'completed' | 'failed'>('idle')
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [findings, setFindings] = useState<Finding[]>([])
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<number | null>(null)

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setStatus('idle')
    setSubmission(null)
    setFindings([])
    setError(null)
  }, [])

  useEffect(() => {
    if (!submissionId) {
      // When submissionId is cleared, also reset state so button un-sticks
      setStatus('idle')
      setFindings([])
      setError(null)
      return
    }

    setStatus('swarming')

    intervalRef.current = window.setInterval(async () => {
      try {
        const sub = await api.getSubmission(submissionId)
        setSubmission(sub)
        setStatus(sub.status as 'idle' | 'swarming' | 'completed' | 'failed')

        const currentFindings = sub.findings ?? []
        if (currentFindings.length > 0) {
          setFindings(prev => {
            const existingIds = new Set(prev.map(f => f.id))
            const newOnes = currentFindings.filter(f => !existingIds.has(f.id))
            return newOnes.length ? [...prev, ...newOnes] : prev
          })
        }

        if (sub.status === 'completed' || sub.status === 'failed') {
          if (intervalRef.current) clearInterval(intervalRef.current)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to poll submission')
        if (intervalRef.current) clearInterval(intervalRef.current)
        setStatus('failed')
      }
    }, 1500)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [submissionId])

  return { status, submission, findings, error, reset }
}
