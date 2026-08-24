import { useState, useEffect } from 'react'
import { api } from './services/api'
import { useSwarm } from './hooks/useSwarm'
import { useAuth } from './hooks/useAuth'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { SwarmStream } from './components/SwarmStream'
import { HiveGapPanel } from './components/HiveGapPanel'
import { ResultsPanel } from './components/ResultsPanel'
import { GlassCard, SectionHeader } from './components/GlassCard'
import { HealthIndicator } from './components/HealthIndicator'
import { motion, AnimatePresence } from 'framer-motion'


type Language = 'python' | 'javascript' | 'go' | 'rust' | 'java'



export default function App() {

  const [code, setCode] = useState('')
  const [language, setLanguage] = useState<Language>('python')
  const [targetLanguage, setTargetLanguage] = useState('en')
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'review' | 'colony'>('review')
  const [voicePrompt, setVoicePrompt] = useState<string | undefined>(undefined)
  const [voiceLanguage, setVoiceLanguage] = useState<string | undefined>(undefined)

  const { status, findings, submission, error, reset } = useSwarm(submissionId)
  const { login } = useAuth()

  // Auto-login for hackathon instant usability — run once on mount
  useEffect(() => {
    const ensureAuth = async () => {
      if (!localStorage.getItem('bhramari_token')) {
        const anonId = Math.random().toString(36).substring(2, 8)
        await login(`anon_${anonId}@example.com`, `anon_${anonId}`)
      }
    }
    ensureAuth()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isSwarming = status === 'swarming'

  const handleSwarm = async (userCode: string, userLang: string, userTargetLang: string) => {
    if (!userCode.trim()) return

    // Ensure we have a token before submitting
    if (!localStorage.getItem('bhramari_token')) {
      const anonId = Math.random().toString(36).substring(2, 8)
      const ok = await login(`anon_${anonId}@example.com`, `anon_${anonId}`)
      if (!ok) {
        console.error('Auto-login failed, cannot submit')
        return
      }
    }

    // Reset first so the button immediately un-sticks and state is fresh
    reset()
    setSubmissionId(null)
    setLastResult(null)

    // Brief tick to let state flush before we set a new submissionId
    await new Promise(r => setTimeout(r, 50))

    try {
      const { id } = await api.submit({
        title: 'Quick Review',
        content: userCode,
        source_language: userLang,
        target_language: userTargetLang,
        voice_prompt: voicePrompt,
        voice_language: voiceLanguage,
      })
      setSubmissionId(id)
      setVoicePrompt(undefined)
      setVoiceLanguage(undefined)
    } catch (e) {
      console.error('Submit failed', e)
      reset()
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
        <div className="flex gap-1 mt-6 mb-8 p-1 rounded-xl bg-bespoke-surface border border-bespoke-border w-fit mx-auto">
          <button
            aria-label="Code Review Tab"
            onClick={() => setActiveTab('review')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'review'
                ? 'bg-bespoke-accent text-[#f2efe9] shadow-lg'
                : 'text-bespoke-muted hover:text-bespoke-text'
            }`}
          >
            Code Review
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
            Colony
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
                voicePrompt={voicePrompt}
                setVoicePrompt={setVoicePrompt}
                setVoiceLanguage={setVoiceLanguage}
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
              <HiveGapPanel lastResult={lastResult} />

              {/* Colony Gap Dashboard */}
              <GlassCard glow="purple" className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <SectionHeader icon="" title="Gap Analysis Dashboard" />
                  {lastResult && (
                    <button
                      onClick={() => {
                        let md = `# Bhramari Swarm Report\n\n`
                        md += `**Score:** ${lastResult.quality_score?.toFixed(1) ?? 'N/A'} / 10\n`
                        md += `**Verdict:** ${lastResult.hive_title ?? ''}\n\n`
                        md += `## Bug Nature & Findings\n`
                        if (lastResult.findings?.length) {
                          lastResult.findings.forEach((f: any, i: number) => {
                            md += `${i+1}. [${f.severity?.toUpperCase()}] ${f.description}\n`
                            if (f.line) md += `   - Line: ${f.line}\n`
                            if (f.suggestion) md += `   - Proposed Fix: ${f.suggestion}\n`
                          })
                        } else { md += `No issues found.\n` }
                        md += `\n## Proposed Architecture / Strengths\n`
                        if (lastResult.strengths?.length) {
                          lastResult.strengths.forEach((s: string) => md += `- ${s}\n`)
                        }
                        md += `\n**Next Step:** ${lastResult.growth_tip || ''}\n`
                        md += `\n## Prompt to Fix Code (use in Cursor / VSCode / Copilot)\n`
                        md += `Please act as a senior software engineer. Review the following issues:\n\n`
                        if (lastResult.findings) {
                          lastResult.findings.forEach((f: any) => {
                            md += `- ${f.description} (Fix: ${f.suggestion || ''})\n`
                          })
                        }
                        md += `\nBased on these findings, rewrite the provided code to be secure, performant, and follow best practices.`
                        const blob = new Blob([md], { type: 'text/markdown' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `bhramari_report_${lastResult.id || 'export'}.md`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bespoke-accent/10 border border-bespoke-accent/30 text-bespoke-accent text-xs font-semibold hover:bg-bespoke-accent/20 transition-colors"
                    >
                      Download Report
                    </button>
                  )}
                </div>

                {!lastResult ? (
                  <div className="flex flex-col items-center justify-center flex-grow py-12 text-bespoke-muted">
                    <p className="text-3xl mb-3 opacity-40">🐝</p>
                    <p className="text-sm font-medium">No analysis yet</p>
                    <p className="text-xs mt-1">Paste code and run Summon the Swarm to see your gap dashboard here.</p>
                  </div>
                ) : (
                  <>
                    {/* Summary bar */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-bespoke-surface border border-bespoke-border">
                      <div className="text-center min-w-[64px]">
                        <div className="text-2xl font-black" style={{ color: (lastResult.quality_score ?? 0) >= 8 ? '#10b981' : (lastResult.quality_score ?? 0) >= 5 ? '#f59e0b' : '#ef4444' }}>
                          {((lastResult.quality_score ?? 0) * 10).toFixed(0)}%
                        </div>
                        <div className="text-[10px] text-bespoke-muted uppercase tracking-wide">Overall</div>
                      </div>
                      <div className="flex-1 text-sm text-bespoke-text leading-relaxed">
                        {lastResult.summary || lastResult.hive_title || 'Analysis complete'}
                      </div>
                    </div>

                    {/* Severity breakdown */}
                    {(lastResult.findings?.length ?? 0) > 0 && (() => {
                      const critical = lastResult.findings!.filter((f: any) => f.severity === 'critical')
                      const high = lastResult.findings!.filter((f: any) => f.severity === 'high')
                      const medium = lastResult.findings!.filter((f: any) => f.severity === 'medium')
                      const low = lastResult.findings!.filter((f: any) => f.severity === 'low')
                      return (
                        <div className="grid grid-cols-4 gap-2">
                          {[{label:'Critical',count:critical.length,color:'bg-red-500/20 border-red-300 text-red-500'},
                            {label:'High',count:high.length,color:'bg-orange-500/20 border-orange-300 text-orange-500'},
                            {label:'Medium',count:medium.length,color:'bg-yellow-500/20 border-yellow-300 text-yellow-600'},
                            {label:'Low',count:low.length,color:'bg-green-500/20 border-green-300 text-green-600'}].map(s => (
                            <div key={s.label} className={`p-2 rounded-xl border text-center ${s.color}`}>
                              <div className="text-xl font-black">{s.count}</div>
                              <div className="text-[10px] font-semibold uppercase tracking-wide">{s.label}</div>
                            </div>
                          ))}
                        </div>
                      )
                    })()}

                    {/* Findings list */}
                    <div className="space-y-2 overflow-y-auto max-h-60 pr-1">
                      {(lastResult.findings?.length ?? 0) === 0 ? (
                        <div className="flex gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-green-800">
                          <span className="text-green-500 shrink-0 mt-0.5">✅</span>
                          <span><strong>No Issues Found</strong> — Code passes all Bhramari security and quality parameters.</span>
                        </div>
                      ) : (
                        lastResult.findings!.map((f: any, i: number) => {
                          const isRed = f.severity === 'critical' || f.severity === 'high'
                          return (
                            <div key={i} className={`flex gap-2 p-2.5 rounded-xl border text-xs ${
                              f.severity === 'critical' ? 'bg-red-50 border-red-200 text-red-900' :
                              f.severity === 'high' ? 'bg-orange-50 border-orange-200 text-orange-900' :
                              f.severity === 'medium' ? 'bg-yellow-50 border-yellow-200 text-yellow-900' :
                              'bg-gray-50 border-gray-200 text-gray-700'
                            }`}>
                              <span className={`shrink-0 mt-0.5 ${
                                isRed ? 'text-red-500' : 'text-yellow-500'
                              }`}>⚠️</span>
                              <div>
                                <span className="font-bold">[{f.severity?.toUpperCase()}] {f.agent_type?.replace('_', ' ')}:</span>{' '}
                                {f.description}
                                {f.suggestion && <div className="mt-1 text-indigo-700 font-medium">💡 {f.suggestion}</div>}
                                {f.line && <div className="mt-0.5 font-mono text-bespoke-muted">Line {f.line}</div>}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </>
                )}
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
              <span className="text-2xl text-bespoke-accent">⭐</span>
              <h3 className="text-sm font-bold text-bespoke-text">Standardized Quality Rating</h3>
              <p className="text-sm text-bespoke-muted leading-relaxed">
                Every submission is evaluated by our core engine to generate a standardized code quality rating on a scale of 1 to 10.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-2xl text-bespoke-accent">📖</span>
              <h3 className="text-sm font-bold text-bespoke-text">Historical Learning</h3>
              <p className="text-sm text-bespoke-muted leading-relaxed">
                Maintains a robust session history, learning from past review data to track development growth and optimization patterns over time.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-2xl text-bespoke-accent">🌍</span>
              <h3 className="text-sm font-bold text-bespoke-text">Multi-Language Support</h3>
              <p className="text-sm text-bespoke-muted leading-relaxed">
                Native support for translation of findings into global and regional languages including Hindi, Tamil, Bengali, and Marathi.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-2xl text-bespoke-accent">🐝</span>
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
