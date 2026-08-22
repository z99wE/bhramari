import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Finding } from '../types'

interface SwarmStreamProps {
  findings: Finding[]
  isSwarming: boolean
}

const severityConfig = {
  critical: { border: 'border-red-500/40', bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500', label: 'CRITICAL' },
  high: { border: 'border-orange-500/40', bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-500', label: 'HIGH' },
  medium: { border: 'border-yellow-500/40', bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-500', label: 'MEDIUM' },
  low: { border: 'border-green-500/40', bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-500', label: 'LOW' },
  info: { border: 'border-cyan-500/40', bg: 'bg-cyan-500/10', text: 'text-cyan-400', dot: 'bg-cyan-500', label: 'INFO' },
}

const agentEmojis: Record<string, string> = {
  security_drone: '🛡️',
  logic_wasp: '⚡',
  style_bee: '✨',
  cultural_drone: '🌍',
  growth_queen: '👑',
}

export function SwarmStream({ findings, isSwarming }: SwarmStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [findings])

  return (
    <div className="h-72 overflow-y-auto space-y-2 pr-1 rounded-xl">
      <AnimatePresence mode="popLayout">
        {findings.length === 0 && !isSwarming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12 text-gray-600"
          >
            <div className="text-3xl mb-2 swarm-pulse">🐝</div>
            <p className="text-xs font-medium">Agents are waiting to buzz</p>
            <p className="text-xs mt-1 text-gray-700">Security · Logic · Style · Culture · Growth</p>
          </motion.div>
        )}

        {isSwarming && findings.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="flex justify-center gap-2 mb-3">
              {['🛡️', '⚡', '✨', '🌍', '👑'].map((emoji, i) => (
                <motion.span
                  key={i}
                  className="text-xl"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1, ease: 'easeInOut' }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
            <p className="text-xs text-gray-500 animate-pulse">Five agents buzzing your code...</p>
          </motion.div>
        )}

        {findings.map((finding, i) => {
          const cfg = severityConfig[finding.severity] || severityConfig.info
          const agentEmoji = agentEmojis[finding.agent_type] || '🤖'

          return (
            <motion.div
              key={finding.id || i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`finding-slide-in p-3 rounded-xl border ${cfg.border} ${cfg.bg}`}
            >
              <div className="flex items-center gap-2 text-xs mb-1">
                <span>{agentEmoji}</span>
                <span className={`px-1.5 py-0.5 rounded font-bold ${cfg.text} bg-black/20`}>
                  {cfg.label}
                </span>
                <span className="text-gray-500 capitalize">
                  {finding.agent_type.replace(/_/g, '-')}
                </span>
                {finding.line && (
                  <span className="text-gray-600 font-mono">L{finding.line}</span>
                )}
              </div>
              <p className={`text-sm ${cfg.text} font-medium`}>{finding.description}</p>
              {finding.suggestion && (
                <p className="text-xs text-amber-400/80 mt-1.5 font-mono">
                  → {finding.suggestion}
                </p>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  )
}
