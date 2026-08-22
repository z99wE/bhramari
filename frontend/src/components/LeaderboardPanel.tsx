import { useLeaderboard } from '../hooks/useLeaderboard'
import { motion } from 'framer-motion'

const MEDAL_EMOJI = ['🥇', '🥈', '🥉']

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
        <span className="text-lg">🏆</span>
        <h3 className="font-semibold text-white text-base">Colony Leaderboard</h3>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 shimmer" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-10 text-gray-600">
          <div className="text-3xl mb-2">🐝</div>
          <p className="text-sm">No bees in the colony yet</p>
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
              <span className="text-lg w-6 text-center">
                {MEDAL_EMOJI[i] ?? <span className="text-gray-500 font-mono text-sm">{entry.rank}</span>}
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
                <p className="font-semibold text-amber-400 text-sm">{entry.nectar_points} 🍯</p>
                <p className="text-xs text-gray-600">avg {entry.quality_avg.toFixed(1)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
