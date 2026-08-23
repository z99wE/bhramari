import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { Hexagon, Coin } from '@phosphor-icons/react'

const TICKER_ITEMS = [
  'Catches SQL injection before it reaches prod',
  'हिंदी में कोड समीक्षा पाएं — Code review in Hindi',
  'ತಮ್ಮ ಕೋಡ್ ಸಮೀಕ್ಷೆ ಕನ್ನಡದಲ್ಲಿ ಪಡೆಯಿರಿ',
  'Ships 10x faster with AI-powered architecture review',
  'தமிழில் பிழை அறிக்கைகள் — Bug reports in Tamil',
  'Spots hardcoded secrets & env leaks instantly',
  'బగ్ రిపోర్ట్‌లు తెలుగులో — Telugu bug reports',
  'Scores your code on 7 quality domains in seconds',
  'Rewrites vulnerable code with one click',
  'No setup. Paste, Swarm, Ship.',
  'മലയാളത്തിൽ കോഡ് റിവ്യൂ — Code review in Malayalam',
  'Detects O(n²) bottlenecks before your users do',
  'बाngla তে বাগ রিপোর্ট — বাংলায় কোড রিভিউ',
  'Built for Indian engineering teams — every language, every stack',
]

export function Header() {
  const { user, isLoggedIn, logout } = useAuth()

  // Duplicate for seamless infinite scroll
  const tickerContent = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-50 glass-strong border-b border-white/10"
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      {/* Rolling Benefits Ticker */}
      <div className="overflow-hidden border-b border-white/5 bg-black/20 py-2">
        <motion.div
          className="flex gap-12 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: 40,
            ease: 'linear',
            repeat: Infinity,
          }}
        >
          {tickerContent.map((item, i) => (
            <span key={i} className="flex items-center gap-3 text-xs text-gray-400 font-medium shrink-0">
              <span className="w-1 h-1 rounded-full bg-amber-500/70 shrink-0" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>

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

          {isLoggedIn ? (
            <button
              onClick={logout}
              className="ml-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm transition-all duration-200 font-medium"
            >
              Sign Out
            </button>
          ) : null}
        </nav>
      </div>
    </motion.header>
  )
}
