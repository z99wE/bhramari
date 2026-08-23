import { motion } from 'framer-motion'
import { Hexagon, Warning, SealCheck } from '@phosphor-icons/react'
import type { Submission } from '../types'

interface HiveGapPanelProps {
  lastResult: Submission | null
}

const DOMAINS = [
  { name: 'Code Quality', color: 'text-blue-500', glow: 'shadow-blue-500/20' },
  { name: 'Testing', color: 'text-purple-500', glow: 'shadow-purple-500/20' },
  { name: 'Security & Compliance', color: 'text-red-500', glow: 'shadow-red-500/20' },
  { name: 'Performance', color: 'text-amber-500', glow: 'shadow-amber-500/20' },
  { name: 'Reliability', color: 'text-cyan-500', glow: 'shadow-cyan-500/20' },
  { name: 'Dependencies', color: 'text-emerald-500', glow: 'shadow-emerald-500/20' },
  { name: 'Documentation', color: 'text-pink-500', glow: 'shadow-pink-500/20' },
]

export function HiveGapPanel({ lastResult }: HiveGapPanelProps) {
  // Extract findings if available
  const findings = lastResult?.findings || []
  
  // Calculate average or set defaults
  const score = lastResult?.quality_score ? lastResult.quality_score * 10 : 82
  
  // High priority gaps
  const criticalGaps = findings.filter(f => f.severity === 'critical' || f.severity === 'high')
  const generalGaps = findings.filter(f => f.severity === 'medium' || f.severity === 'low')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="glass rounded-2xl p-6 bg-bespoke-surface/80 border border-bespoke-border shadow-sm flex flex-col justify-between h-full"
    >
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Hexagon size={24} weight="duotone" className="text-bespoke-accent" />
          <h3 className="font-bold text-bespoke-text text-base">Hive Mind Code Gap Monitor</h3>
        </div>

        {/* Dynamic Honeycomb Swarm Animation */}
        <div className="flex justify-center items-center py-6 relative">
          <div className="grid grid-cols-4 gap-4 max-w-[280px]">
            {DOMAINS.map((domain, i) => {
              // Find matching score if lastResult exists
              let statusColor = 'bg-gray-100 border-gray-300 text-gray-400'
              let pulseClass = 'animate-pulse'

              if (lastResult) {
                // Determine severity colored glow
                const hasCritical = findings.some(f => f.severity === 'critical' && f.description.toLowerCase().includes(domain.name.toLowerCase().split(' ')[0]))
                const hasHigh = findings.some(f => f.severity === 'high' && f.description.toLowerCase().includes(domain.name.toLowerCase().split(' ')[0]))
                
                if (hasCritical) {
                  statusColor = 'bg-red-50 border-red-300 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  pulseClass = 'animate-ping'
                } else if (hasHigh) {
                  statusColor = 'bg-amber-50 border-amber-300 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  pulseClass = 'swarm-pulse'
                } else {
                  statusColor = 'bg-green-50 border-green-300 text-green-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  pulseClass = ''
                }
              } else {
                // Breathing default
                statusColor = 'bg-bespoke-surface border-bespoke-border text-bespoke-muted hover:border-bespoke-accent transition-colors'
              }

              return (
                <motion.div
                  key={domain.name}
                  whileHover={{ scale: 1.08 }}
                  className={`w-12 h-14 relative flex items-center justify-center border rounded-lg ${statusColor} ${i === 3 ? 'col-start-2' : ''}`}
                  title={`${domain.name}: click swarm to evaluate`}
                >
                  <Hexagon size={28} weight="duotone" className="absolute opacity-20" />
                  <span className="text-[10px] font-black">{domain.name.substring(0, 2).toUpperCase()}</span>
                  {pulseClass && (
                    <span className={`absolute w-2 h-2 rounded-full top-1 right-1 ${
                      statusColor.includes('red') ? 'bg-red-500' : statusColor.includes('amber') ? 'bg-amber-500' : 'bg-green-500'
                    } ${pulseClass}`} />
                  )}
                </motion.div>
              )
            })}
          </div>

          <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />
        </div>

        {/* Real-time Gap Notifications */}
        <div className="space-y-3 mt-4">
          <h4 className="text-xs font-bold text-bespoke-muted uppercase tracking-wider">Active Code Gaps</h4>
          
          {criticalGaps.length > 0 ? (
            <div className="space-y-2">
              {criticalGaps.slice(0, 2).map((gap, idx) => (
                <div key={idx} className="flex gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900">
                  <Warning size={16} weight="fill" className="text-red-500 shrink-0" />
                  <div>
                    <span className="font-bold">Security Threat:</span> {gap.description}
                  </div>
                </div>
              ))}
            </div>
          ) : lastResult ? (
            <div className="flex gap-2 p-2.5 rounded-xl bg-green-50 border border-green-200 text-xs text-green-900">
              <SealCheck size={16} weight="fill" className="text-green-500 shrink-0" />
              <div>
                <span className="font-bold">No Critical Gaps:</span> Code complies with Bhramari strict security parameters.
              </div>
            </div>
          ) : (
            <p className="text-xs text-bespoke-muted italic">Paste code and run analysis to scan for architectural and security gaps.</p>
          )}

          {generalGaps.length > 0 && (
            <div className="space-y-2">
              {generalGaps.slice(0, 2).map((gap, idx) => (
                <div key={idx} className="flex gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <Warning size={16} weight="fill" className="text-amber-500 shrink-0" />
                  <div>
                    <span className="font-bold">{gap.agent_type.replace('_', ' ')} gap:</span> {gap.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-bespoke-border flex justify-between items-center text-xs text-bespoke-muted mt-4">
        <span>Swarm Health: <span className="text-green-600 font-bold">100% Active</span></span>
        <span>Colony Score: <span className="font-bold">{score.toFixed(0)}%</span></span>
      </div>
    </motion.div>
  )
}
