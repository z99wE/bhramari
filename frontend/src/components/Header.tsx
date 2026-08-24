import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

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
      className="relative z-50 glass-strong border-b border-white/10 flex flex-col items-center pt-8 pb-4"
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      {/* Auth / Logout corner - absolute positioned to keep the rest centered */}
      {isLoggedIn && (
        <div className="absolute top-4 right-6 flex items-center gap-4 text-sm">
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-500 swarm-pulse" />
              <span className="text-gray-300 font-medium">{user.username}</span>
              <span className="text-amber-400 text-xs font-mono">Lvl {user.swarm_level}</span>
              <span className="text-cyan-400 text-xs font-mono">Pts {user.nectar_points}</span>
            </div>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm transition-all duration-200 font-medium"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Center Aligned Branding */}
      <div className="flex flex-col items-center justify-center gap-2 w-full max-w-4xl px-4 text-center">
        
        {/* Beehive Icon with Bee */}
        <motion.div
          className="relative w-16 h-16 flex items-center justify-center mb-2"
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          <div className="text-5xl">🍯</div>
          <motion.div 
            className="absolute -top-2 -right-2 text-2xl"
            animate={{ 
              x: [0, 5, -5, 0],
              y: [0, -5, 5, 0],
            }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          >
            🐝
          </motion.div>
        </motion.div>

        {/* Wordmark */}
        <h1 className="text-4xl font-black neon-text tracking-tight mb-4">Bhramari</h1>

        {/* Rolling Tagline / Features */}
        <div className="w-full overflow-hidden border-t border-b border-amber-500/20 bg-amber-500/5 py-2 mt-2 rounded-lg">
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
              <span key={i} className="flex items-center gap-3 text-sm text-amber-800 font-black tracking-wide shrink-0">
                <span className="text-lg">🐝</span>
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

    </motion.header>
  )
}
