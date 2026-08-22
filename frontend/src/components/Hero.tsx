import { motion } from 'framer-motion'
import { GlassCard, SectionHeader } from './GlassCard'

const AGENTS = [
  { name: 'security_drone', emoji: '🛡️', label: 'Security', color: 'from-red-500/20 to-orange-500/20', border: 'border-red-500/30' },
  { name: 'logic_wasp', emoji: '⚡', label: 'Logic', color: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30' },
  { name: 'style_bee', emoji: '✨', label: 'Style', color: 'from-amber-500/20 to-yellow-500/20', border: 'border-amber-500/30' },
  { name: 'cultural_drone', emoji: '🌍', label: 'Culture', color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
  { name: 'growth_queen', emoji: '👑', label: 'Growth', color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30' },
]

interface HeroProps {
  onSwarm: (code: string, language: string) => void
  code: string
  language: string
  setCode: (v: string) => void
  setLanguage: (v: string) => void
  isSwarming: boolean
}

export function Hero({ onSwarm, code, language, setCode, setLanguage, isSwarming }: HeroProps) {
  const SAMPLE_PYTHON = `def get_user(user_id):
    """Fetch user by ID — has SQL injection vulnerability"""
    query = f"SELECT * FROM users WHERE id = {user_id}"
    result = db.execute(query)
    return result.fetchone()

def process_items(items):
    """Inefficient append loop instead of comprehension"""
    results = []
    for item in items:
        results.append(item * 2)
    return results`

  const SAMPLE_JS = `function getUser(id) {
  // XSS vulnerability: innerHTML with unsanitized input
  const el = document.getElementById("user");
  el.innerHTML = "Hello " + id;
  
  // No cleanup on event listener
  window.addEventListener("scroll", handleScroll);
}`

  const SAMPLES: Record<string, string> = {
    python: SAMPLE_PYTHON,
    javascript: SAMPLE_JS,
    go: `func GetUser(id string) (*User, error) {
    // Unhandled error — will panic under load
    result := db.Query("SELECT * FROM users WHERE id = " + id)
    return result, nil
}`,
    rust: `fn get_user(id: &str) -> Result<User, Error> {
    // Missing proper error handling pattern
    let query = format!("SELECT * FROM users WHERE id = {}", id);
    db.execute(&query)
}`,
    java: `public User getUser(String userId) {
    // SQL injection risk
    String query = "SELECT * FROM users WHERE id = " + userId;
    return db.execute(query);
}`,
  }

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-4">
      {/* Hero text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="text-center py-10"
      >
        <motion.h2
          className="text-5xl sm:text-6xl font-black mb-4 leading-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <span className="neon-text">Where Every Bee</span><br />
          <span className="text-white">Buzzes in Wisdom</span>
        </motion.h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Five specialized AI agents swarm your code simultaneously — security, logic, style, culture, growth.
          In any language. Any voice. Any time.
        </p>
      </motion.div>

      {/* Agent indicators */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-wrap justify-center gap-3 mb-8"
      >
        {AGENTS.map((agent, i) => (
          <motion.div
            key={agent.name}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${agent.color} border ${agent.border} text-xs font-medium text-gray-300`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.08, duration: 0.3 }}
          >
            <span className="text-base">{agent.emoji}</span>
            <span>{agent.label}</span>
            {isSwarming && (
              <span className="w-1.5 h-1.5 rounded-full bg-current agent-active" />
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Main submission panel */}
      <GlassCard glow="amber" className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Input */}
          <div className="space-y-4">
            <SectionHeader icon="💻" title="Your Code" />

            <div className="flex items-center justify-between">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-amber-500/50 transition-colors"
                aria-label="Select programming language"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="java">Java</option>
              </select>

              <button
                onClick={() => setCode(SAMPLES[language] || '')}
                className="text-xs text-gray-500 hover:text-amber-400 transition-colors"
              >
                Load Sample
              </button>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="code-editor"
              placeholder={`# Paste your ${language} code here...\n`}
              spellCheck={false}
              aria-label="Code input"
            />

            <motion.button
              onClick={() => onSwarm(code, language)}
              disabled={isSwarming || !code.trim()}
              whileHover={{ scale: code.trim() && !isSwarming ? 1.01 : 1 }}
              whileTap={{ scale: code.trim() && !isSwarming ? 0.99 : 1 }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-cyan-600 hover:from-amber-500 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              {isSwarming ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Swarming...</span>
                </>
              ) : (
                <>
                  <span>🐝</span>
                  <span>Summon the Swarm</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Live Stream */}
          <div className="space-y-3">
            <SectionHeader icon="⚡" title="Live Swarm Feed" />
            <div className="h-72 overflow-y-auto space-y-2 pr-1 rounded-xl">
              {isSwarming ? (
                <div className="text-center py-8">
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
                </div>
              ) : (
                <div className="text-center py-12 text-gray-600">
                  <div className="text-3xl mb-2 swarm-pulse">🐝</div>
                  <p className="text-xs font-medium">Agents are waiting to buzz</p>
                  <p className="text-xs mt-1 text-gray-700">Security · Logic · Style · Culture · Growth</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </section>
  )
}
