import { useLeaderboard } from '../hooks/useLeaderboard'
import { motion } from 'framer-motion'
import { Trophy, Bug, Coin, Medal } from '@phosphor-icons/react'

const MEDALS = [
  <Medal key="gold" size={20} weight="duotone" className="text-yellow-400" />,
  <Medal key="silver" size={20} weight="duotone" className="text-gray-300" />,
  <Medal key="bronze" size={20} weight="duotone" className="text-amber-600" />
]

export function LeaderboardPanel() {
  const { entries, loading } = useLeaderboard(10)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <Trophy size={24} weight="duotone" className="text-bespoke-accent" />
        <h3 className="font-semibold text-white text-base">Colony Leaderboard</h3>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 shimmer" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-10 text-gray-600 flex flex-col items-center">
          <div className="text-3xl mb-2 text-bespoke-accent">
            <Bug size={32} weight="duotone" />
          </div>
          <p className="text-sm">No submissions in the colony yet</p>
          <p className="text-xs mt-1 text-gray-700">Be the first to submit!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                i < 3 ? 'bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20' : 'bg-white/5 border border-white/5'
              }`}
            >
              <span className="text-lg w-6 text-center flex justify-center">
                {MEDALS[i] ?? <span className="text-gray-500 font-mono text-sm">{entry.rank}</span>}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-200 truncate">
                  {entry.display_name || entry.username}
                </p>
                <p className="text-xs text-gray-500">
                  Lvl {entry.swarm_level} · {entry.streak_count} day streak
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-amber-400 text-sm flex items-center gap-1 justify-end">
                  {entry.nectar_points} <Coin size={16} weight="duotone" />
                </p>
                <p className="text-xs text-gray-600">avg {entry.quality_avg.toFixed(1)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
