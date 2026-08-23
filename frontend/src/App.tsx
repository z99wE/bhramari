import { useState, useEffect } from 'react'
import { api } from './services/api'
import { useSwarm } from './hooks/useSwarm'
import { useAuth } from './hooks/useAuth'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { SwarmStream } from './components/SwarmStream'
import { ResultsPanel } from './components/ResultsPanel'
import { VoicePanel } from './components/VoicePanel'
import { PatternsPanel } from './components/PatternsPanel'
import { LeaderboardPanel } from './components/LeaderboardPanel'
import { GlassCard, SectionHeader } from './components/GlassCard'
import { HealthIndicator } from './components/HealthIndicator'
import { motion, AnimatePresence } from 'framer-motion'
import { TerminalWindow, UsersThree, FileText, Brain, Globe, Robot, ChartBar, Star, BookOpen, Bug } from '@phosphor-icons/react'

type Language = 'python' | 'javascript' | 'go' | 'rust' | 'java'

export default function App() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState<Language>('python')
  const [targetLanguage, setTargetLanguage] = useState('en')
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'review' | 'colony'>('review')
  const [stats, setStats] = useState<{ total_reviews: number; patterns_learned: number; languages_supported: number; agents_active: number } | null>(null)
  const [voicePrompt, setVoicePrompt] = useState<string | undefined>(undefined)
  const [voiceLanguage, setVoiceLanguage] = useState<string | undefined>(undefined)

  const { status, findings, submission, error } = useSwarm(submissionId)
  const { isLoggedIn, login } = useAuth()

  // Auto-login for hackathon instant usability
  useEffect(() => {
    if (!isLoggedIn && !localStorage.getItem('bhramari_token')) {
      const anonId = Math.random().toString(36).substring(2, 8)
      login(`anon_${anonId}@example.com`, `anon_${anonId}`)
    }
    
    // Fetch initial stats
    api.colonyStats().then(setStats).catch(console.error)
  }, [isLoggedIn, login])

  const isSwarming = status === 'swarming'

  const handleSwarm = async (userCode: string, userLang: string) => {
    if (!userCode.trim()) return

    setSubmissionId(null)
    setLastResult(null)

    try {
      const { id } = await api.submit({
        title: 'Quick Review',
        content: userCode,
        source_language: userLang,
        target_language: targetLanguage,
        voice_prompt: voicePrompt,
        voice_language: voiceLanguage,
      })
      setSubmissionId(id)
      setVoicePrompt(undefined)
      setVoiceLanguage(undefined)
    } catch (e) {
      console.error('Submit failed', e)
    }
  }

  const handleFileUpload = async (file: File) => {
    setSubmissionId(null)
    setLastResult(null)
    try {
      const { id } = await api.upload(file, language)
      setSubmissionId(id)
    } catch (e) {
      console.error('File upload failed', e)
    }
  }

  // Watch for completed submissions
  useEffect(() => {
    if (!submissionId || !submission) return
    if (submission.status === 'completed') {
      setLastResult(submission)
    }
  }, [submissionId, submission])

  return (
    <div className="min-h-screen relative">
      <div className="honeycomb-bg" />

      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        {/* Tab Navigation */}
        <div className="flex gap-1 mt-6 mb-8 p-1 rounded-xl bg-bespoke-surface border border-bespoke-border w-fit">
          <button
            aria-label="Code Review Tab"
            onClick={() => setActiveTab('review')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'review'
                ? 'bg-bespoke-accent text-[#f2efe9] shadow-lg'
                : 'text-bespoke-muted hover:text-bespoke-text'
            }`}
          >
            <TerminalWindow size={18} weight="bold" /> Code Review
          </button>
          <button
            aria-label="Colony Tab"
            onClick={() => setActiveTab('colony')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'colony'
                ? 'bg-bespoke-accent text-[#f2efe9] shadow-lg'
                : 'text-bespoke-muted hover:text-bespoke-text'
            }`}
          >
            <UsersThree size={18} weight="bold" /> Colony
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'review' ? (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Hero
                onSwarm={handleSwarm}
                onFileUpload={handleFileUpload}
                code={code}
                language={language}
                targetLanguage={targetLanguage}
                setCode={setCode}
                setLanguage={(v) => setLanguage(v as Language)}
                setTargetLanguage={setTargetLanguage}
                isSwarming={isSwarming}
                status={status}
                error={error}
                findings={findings}
              />

              {/* Live swarm results with findings */}
              <AnimatePresence>
                {findings && findings.length > 0 && (
                  <GlassCard glow="cyan" className="mb-8">
                    <SectionHeader icon="⚡" title="Live Swarm Findings" subtitle={`${findings.length} agents reporting`} />
                    <SwarmStream findings={findings} isSwarming={isSwarming} />
                  </GlassCard>
                )}
              </AnimatePresence>

              {/* Final Results */}
              <AnimatePresence>
                {lastResult && (
                  <ResultsPanel data={lastResult} />
                )}
              </AnimatePresence>

              <VoicePanel onVoiceCaptured={(text, lang) => {
                setVoicePrompt(text)
                setVoiceLanguage(lang)
              }} />
              <PatternsPanel />
            </motion.div>
          ) : (
            <motion.div
              key="colony"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4"
            >
              <LeaderboardPanel />

              {/* Colony Stats Card */}
              <GlassCard glow="purple" className="space-y-5">
                <SectionHeader icon={<ChartBar size={20} />} title="Colony Analytics" />

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Total Reviews', value: stats?.total_reviews ?? '—', icon: <FileText size={28} className="mx-auto text-bespoke-accent" /> },
                    { label: 'Patterns Learned', value: stats?.patterns_learned ?? '—', icon: <Brain size={28} className="mx-auto text-bespoke-accent" /> },
                    { label: 'Languages Supported', value: stats ? `${stats.languages_supported}+` : '—', icon: <Globe size={28} className="mx-auto text-bespoke-accent" /> },
                    { label: 'Agents Active', value: stats?.agents_active ?? '—', icon: <Robot size={28} className="mx-auto text-bespoke-accent" /> },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl bg-bespoke-surface border border-bespoke-border text-center">
                      <div className="mb-2">{stat.icon}</div>
                      <div className="text-2xl font-black neon-text text-bespoke-text">{stat.value}</div>
                      <div className="text-xs text-bespoke-muted mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Architecture badges */}
                <div>
                  <p className="text-xs text-bespoke-muted font-medium uppercase tracking-wider mb-3">GCP Architecture</p>
                  <div className="flex flex-wrap gap-2">
                    {['Cloud Run', 'Vertex AI', 'Pub/Sub', 'Cloud SQL', 'Memorystore', 'Cloud Tasks', 'Cloud CDN', 'Secret Manager'].map((svc) => (
                      <span key={svc} className="px-2.5 py-1 rounded-full bg-bespoke-surface border border-bespoke-border text-xs text-bespoke-muted">
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Hackathon Alignment Footer */}
      <footer className="relative z-10 border-t border-bespoke-border bg-bespoke-bg py-12 mt-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-sm font-bold text-bespoke-accent tracking-[0.2em] uppercase mb-4">
              Automated Code Reviewer
            </h2>
            <p className="text-bespoke-text text-base md:text-lg leading-relaxed max-w-lg mb-6">
              Bhramari is an always-on, intelligent code reviewer built for the next generation of engineers. Submit your source code securely and receive comprehensive, multi-language bug reports, architectural guidance, and optimization insights instantly.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Star size={24} weight="duotone" className="text-bespoke-accent" />
              <h3 className="text-sm font-bold text-bespoke-text">Standardized Quality Rating</h3>
              <p className="text-sm text-bespoke-muted leading-relaxed">
                Every submission is evaluated by our core engine to generate a standardized code quality rating on a scale of 1 to 10.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <BookOpen size={24} weight="duotone" className="text-bespoke-accent" />
              <h3 className="text-sm font-bold text-bespoke-text">Historical Learning</h3>
              <p className="text-sm text-bespoke-muted leading-relaxed">
                Maintains a robust session history, learning from past review data to track development growth and optimization patterns over time.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Globe size={24} weight="duotone" className="text-bespoke-accent" />
              <h3 className="text-sm font-bold text-bespoke-text">Multi-Language Support</h3>
              <p className="text-sm text-bespoke-muted leading-relaxed">
                Native support for translation of findings into global and regional languages including Hindi, Tamil, Bengali, and Marathi.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Bug size={24} weight="duotone" className="text-bespoke-accent" />
              <h3 className="text-sm font-bold text-bespoke-text">Comprehensive Bug Reports</h3>
              <p className="text-sm text-bespoke-muted leading-relaxed">
                Detects security flaws, inefficient logic, styling inconsistencies, and architectural anti-patterns with actionable fixes.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <HealthIndicator />
    </div>
  )
}
