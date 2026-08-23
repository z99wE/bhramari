import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { Hexagon, Coin } from '@phosphor-icons/react'

export function Header() {
  const { user, isLoggedIn, logout } = useAuth()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-50 glass-strong border-b border-white/10"
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-cyan-500 flex items-center justify-center text-xl text-white"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Hexagon size={24} weight="fill" />
          </motion.div>
          <div>
            <h1 className="text-xl font-black neon-text tracking-tight">Bhramari</h1>
            <p className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">
              The Hive Mind
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-2 text-sm">
          {isLoggedIn && user && (
            <div className="hidden sm:flex items-center gap-2 mr-4 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-500 swarm-pulse" />
              <span className="text-gray-300 font-medium">{user.username}</span>
              <span className="text-amber-400 text-xs font-mono">Lvl {user.swarm_level}</span>
              <span className="text-cyan-400 text-xs font-mono flex items-center gap-1">{user.nectar_points}<Coin size={14} weight="duotone" /></span>
            </div>
          )}

          <button className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium">
            Colony
          </button>
          <button className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium">
            Patterns
          </button>
          <button className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium">
            Voice
          </button>

          {isLoggedIn ? (
            <button
              onClick={logout}
              className="ml-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm transition-all duration-200 font-medium"
            >
              Sign Out
            </button>
          ) : (
            <button className="ml-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-sm transition-all duration-200 font-semibold shadow-lg shadow-amber-500/20">
              Sign In
            </button>
          )}
        </nav>
      </div>
    </motion.header>
  )
}
