import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { GlassCard, SectionHeader } from './GlassCard'
import { ShieldCheck, Lightning, Sparkle, Globe, Crown, Code, FileArrowUp, FolderOpen, Bug, TreeStructure } from '@phosphor-icons/react'

const AGENTS = [
  { name: 'security_drone', icon: <ShieldCheck weight="duotone" />, label: 'Security', color: 'from-red-500/20 to-orange-500/20', border: 'border-red-500/30' },
  { name: 'logic_wasp', icon: <Lightning weight="duotone" />, label: 'Logic', color: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30' },
  { name: 'style_bee', icon: <Sparkle weight="duotone" />, label: 'Style', color: 'from-amber-500/20 to-yellow-500/20', border: 'border-amber-500/30' },
  { name: 'cultural_drone', icon: <Globe weight="duotone" />, label: 'Culture', color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
  { name: 'growth_queen', icon: <Crown weight="duotone" />, label: 'Growth', color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30' },
  { name: 'senior_architect', icon: <TreeStructure weight="duotone" />, label: 'Architect', color: 'from-indigo-500/20 to-blue-500/20', border: 'border-indigo-500/30' },
]

interface HeroProps {
  onSwarm: (code: string, language: string, targetLanguage: string) => void
  onFileUpload: (file: File, targetLanguage: string) => void
  code: string
  language: string
  targetLanguage: string
  setCode: (v: string) => void
  setLanguage: (v: string) => void
  setTargetLanguage: (v: string) => void
  isSwarming: boolean
  status: string
  error: string | null
  findings: any[]
}

export function Hero({ onSwarm, onFileUpload, code, language, targetLanguage, setCode, setLanguage, setTargetLanguage, isSwarming, status, error, findings }: HeroProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0], targetLanguage)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0], targetLanguage)
    }
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
          <span className="text-bespoke-accent">Ship Secure Code</span><br />
          <span className="text-bespoke-text">10x Faster</span>
        </motion.h2>
        <p className="text-bespoke-muted text-lg max-w-2xl mx-auto leading-relaxed">
          Elevate your team's engineering standards instantly. Our intelligent swarm analyzes your code for critical security flaws, performance bottlenecks, and architectural best practices before you merge.
        </p>
      </motion.div>

      {/* Agent indicators */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-wrap justify-center gap-3 mb-8"
      >
        {AGENTS.map((agent, i) => {
          const agentHasFindings = findings?.some((f: any) => f.agent_type === agent.name)
          const pulseClass = agentHasFindings ? 'shadow-[0_0_15px_rgba(59,130,246,0.5)] border-bespoke-accent text-bespoke-accent' : 'text-gray-700'
          return (
          <motion.div
            key={agent.name}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${agent.color} border ${agent.border} ${pulseClass} text-xs font-medium transition-all duration-300`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: agentHasFindings ? 1.05 : 1 }}
            transition={{ delay: 0.5 + i * 0.08, duration: 0.3 }}
          >
            <span className="text-base flex items-center">{agent.icon}</span>
            <span>{agent.label}</span>
            {isSwarming && !agentHasFindings && (
              <span className="w-1.5 h-1.5 rounded-full bg-current agent-active" />
            )}
            {agentHasFindings && (
              <span className="w-1.5 h-1.5 rounded-full bg-bespoke-accent animate-ping" />
            )}
          </motion.div>
        )})}
      </motion.div>

      {/* Main submission panel */}
      <GlassCard className="mb-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
          {/* Code Input */}
          <div className="space-y-4">
            <SectionHeader icon={<Code size={20} />} title="Your Code" />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-bespoke-surface border border-bespoke-border rounded-lg px-3 py-1.5 text-sm text-bespoke-text focus:outline-none focus:border-bespoke-accent transition-colors"
                  aria-label="Select programming language"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="java">Java</option>
                </select>
                
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="bg-bespoke-surface border border-bespoke-border rounded-lg px-3 py-1.5 text-sm text-bespoke-text focus:outline-none focus:border-bespoke-accent transition-colors"
                  aria-label="Select review language"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="bn">Bengali (বাংলা)</option>
                  <option value="mr">Marathi (मराठी)</option>
                </select>
              </div>

              <button
                onClick={() => setCode(SAMPLES[language] || '')}
                className="text-xs text-bespoke-muted hover:text-bespoke-accent transition-colors"
              >
                Load Sample
              </button>
            </div>

            <div
              className={`relative ${isDragging ? 'border-bespoke-accent border-2' : 'border-transparent'} rounded-xl transition-all`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="code-editor"
                placeholder={`# Paste your code or drag and drop a file here...\n`}
                spellCheck={false}
                aria-label="Code input"
              />
              {isDragging && (
                <div className="absolute inset-0 bg-bespoke-surface/80 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-dashed border-bespoke-accent z-10 pointer-events-none">
                  <div className="text-center text-bespoke-accent flex flex-col items-center">
                    <FileArrowUp size={48} weight="duotone" className="mb-2" />
                    <span className="font-semibold text-lg">Drop file to upload</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect}
                className="hidden" 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isSwarming}
                className="px-4 py-3.5 rounded-xl bg-bespoke-surface border border-bespoke-border hover:border-bespoke-accent text-bespoke-text transition-colors flex items-center justify-center"
                title="Upload file"
              >
                <FolderOpen size={20} weight="duotone" />
              </button>
              
              <motion.button
                onClick={() => onSwarm(code, language, targetLanguage)}
                disabled={isSwarming || !code.trim()}
                whileHover={{ scale: code.trim() && !isSwarming ? 1.01 : 1 }}
                whileTap={{ scale: code.trim() && !isSwarming ? 0.99 : 1 }}
                className="flex-1 py-3.5 rounded-xl bg-bespoke-accent hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
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
                    <Bug size={20} weight="fill" />
                    <span>Summon the Swarm</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Live Stream */}
          <div className="space-y-3">
            <SectionHeader icon={<Lightning size={20} />} title="Live Swarm Feed" />
            <div className="h-[22rem] overflow-y-auto space-y-2 pr-1 rounded-xl bg-bespoke-bg p-4 border border-bespoke-border shadow-inner">
              {findings && findings.length > 0 ? (
                <div className="space-y-2">
                  {findings.map((f: any, i: number) => {
                    const agent = AGENTS.find(a => a.name === f.agent_type)
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-bespoke-surface border border-bespoke-border"
                      >
                        <div className="mt-1 text-bespoke-accent">{agent?.icon || <Bug size={16} />}</div>
                        <div>
                          <div className="text-xs font-semibold text-bespoke-text flex items-center gap-2">
                            {agent?.label || 'Agent'}
                            <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                              f.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                              f.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>{f.severity}</span>
                          </div>
                          <p className="text-sm text-bespoke-muted mt-1">{f.description}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                  {isSwarming && (
                    <div className="flex justify-center py-4">
                      <div className="flex gap-2">
                        {AGENTS.map((agent, i) => (
                          <motion.span
                            key={i}
                            className="text-lg text-bespoke-accent opacity-50"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1, ease: 'easeInOut' }}
                          >
                            {agent.icon}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : isSwarming ? (
                <div className="text-center py-8">
                  <div className="flex justify-center gap-2 mb-3">
                    {AGENTS.map((agent, i) => (
                      <motion.span
                        key={i}
                        className="text-xl text-bespoke-accent"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1, ease: 'easeInOut' }}
                      >
                        {agent.icon}
                      </motion.span>
                    ))}
                  </div>
                  <p className="text-xs text-bespoke-muted animate-pulse">Five agents reviewing your code...</p>
                </div>
              ) : status === 'failed' || error ? (
                <div className="text-center py-12 flex flex-col items-center">
                  <div className="text-3xl mb-2 text-red-500">
                    ⚠️
                  </div>
                  <p className="text-sm font-medium text-red-400">Swarm Analysis Failed</p>
                  <p className="text-xs mt-1 text-red-400/80 max-w-xs">{error || 'The swarm failed to process this code. It may have been blocked by safety filters or an internal error occurred.'}</p>
                </div>
              ) : (
                <div className="text-center py-12 text-bespoke-muted flex flex-col items-center">
                  <div className="text-3xl mb-2 text-bespoke-accent swarm-pulse">
                    <Bug size={32} weight="duotone" />
                  </div>
                  <p className="text-xs font-medium text-bespoke-text">Agents are waiting to analyze</p>
                  <p className="text-xs mt-1">Security · Logic · Style · Culture · Growth</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </section>
  )
}
