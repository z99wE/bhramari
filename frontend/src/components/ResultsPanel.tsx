import { motion } from 'framer-motion'
import type { Submission } from '../types'

interface ResultsPanelProps {
  data: Submission
}

export function ResultsPanel({ data }: ResultsPanelProps) {
  const score = data.quality_score ?? 0
  const hiveTitle = data.hive_title || '—'
  const hiveEmoji = data.hive_emoji || '🐝'
  const percentile = data.percentile_rank ?? 50

  // Score ring color based on score
  const scoreColor =
    score >= 8 ? '#10b981' :
    score >= 6 ? '#f59e0b' :
    score >= 4 ? '#f97316' :
    '#ef4444'

  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference * (1 - score / 10)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-2xl p-6 mb-8"
    >
      {/* Score + strengths row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Score Ring */}
        <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-cyan-500/10 border border-amber-500/20">
          <div className="relative w-28 h-28">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="45"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="50" cy="50" r="45"
                stroke={scoreColor}
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black" style={{ color: scoreColor }}>{score.toFixed(1)}</span>
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Score</span>
            </div>
          </div>
          <div className="text-2xl mt-2">{hiveEmoji}</div>
          <div className="text-sm font-semibold text-gray-200 mt-0.5">{hiveTitle}</div>
          <div className="text-xs text-gray-500 mt-1">Top {100 - percentile}% of hive</div>
        </div>

        {/* Strengths */}
        <div>
          <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            ✓ Strengths
          </h4>
          <ul className="space-y-2">
            {(data.strengths || []).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Growth tip */}
        <div>
          <h4 className="font-semibold text-amber-400 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            ✦ Next Buzz
          </h4>
          <p className="text-sm text-gray-300 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 leading-relaxed">
            {data.growth_tip || 'Keep buzzing! 🐝'}
          </p>
          {data.patterns_matched && data.patterns_matched.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wider">Hive Memory Matched</p>
              {data.patterns_matched.slice(0, 2).map((p, i) => (
                <div key={i} className="text-xs text-gray-400 bg-white/5 p-2 rounded-lg border border-white/5 mb-1">
                  {p.rule_text}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Findings Grid */}
      {data.findings && data.findings.length > 0 && (
        <div className="pt-5 border-t border-white/10">
          <h4 className="font-semibold mb-3 text-sm text-gray-300">
            Swarm Findings ({data.findings.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.findings.map((f, i) => {
              const dotColor =
                f.severity === 'critical' ? 'bg-red-500' :
                f.severity === 'high' ? 'bg-orange-500' :
                f.severity === 'medium' ? 'bg-yellow-500' :
                'bg-green-500'

              return (
                <motion.div
                  key={f.id || i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`} />
                    <span className="text-gray-300 font-medium">{f.description}</span>
                  </div>
                  {f.suggestion && (
                    <p className="text-xs text-amber-400/80 mt-1.5 ml-4 font-mono">
                      Fix: {f.suggestion}
                    </p>
                  )}
                  {f.line && (
                    <p className="text-xs text-gray-600 mt-0.5 ml-4 font-mono">Line {f.line}</p>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}
