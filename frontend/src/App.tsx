import { useState, useEffect } from 'react'
import { api } from './services/api'
import { useSwarm } from './hooks/useSwarm'
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

type Language = 'python' | 'javascript' | 'go' | 'rust' | 'java'

export default function App() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState<Language>('python')
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'review' | 'colony'>('review')

  const { status, findings, submission } = useSwarm(submissionId)

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
      })
      setSubmissionId(id)
    } catch (e) {
      console.error('Submit failed', e)
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
        <div className="flex gap-1 mt-6 mb-8 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
          <button
            onClick={() => setActiveTab('review')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'review'
                ? 'bg-gradient-to-r from-amber-600 to-cyan-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🐝 Code Review
          </button>
          <button
            onClick={() => setActiveTab('colony')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'colony'
                ? 'bg-gradient-to-r from-amber-600 to-cyan-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🏛️ Colony
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
                code={code}
                language={language}
                setCode={setCode}
                setLanguage={(v) => setLanguage(v as Language)}
                isSwarming={isSwarming}
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

              <VoicePanel />
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
                <SectionHeader icon="📊" title="Colony Analytics" />

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Total Reviews', value: '—', icon: '📝' },
                    { label: 'Patterns Learned', value: '8', icon: '🧠' },
                    { label: 'Languages Supported', value: '13+', icon: '🌍' },
                    { label: 'Agents Active', value: '5', icon: '🤖' },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                      <div className="text-2xl mb-1">{stat.icon}</div>
                      <div className="text-2xl font-black neon-text">{stat.value}</div>
                      <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Architecture badges */}
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">GCP Architecture</p>
                  <div className="flex flex-wrap gap-2">
                    {['Cloud Run', 'Vertex AI', 'Pub/Sub', 'Cloud SQL', 'Memorystore', 'Cloud Tasks', 'Cloud CDN', 'Secret Manager'].map((svc) => (
                      <span key={svc} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
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

      <HealthIndicator />
    </div>
  )
}
