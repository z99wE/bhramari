import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Hexagon, Sparkle, SpeakerHigh, StopCircle, DownloadSimple, Code, X, ShieldCheck } from '@phosphor-icons/react'
import ReactMarkdown from 'react-markdown'
import type { Submission } from '../types'

const DOMAINS = [
  'Code Quality',
  'Testing',
  'Security & Compliance',
  'Performance',
  'Reliability',
  'Dependencies',
  'Documentation'
]

// Simple deterministic hash
const hashString = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const generateDomainScores = (submission: Submission) => {
  const seed = hashString(submission.id || submission.title || 'default')
  const baseScore = (submission.quality_score || 0) * 10 // scale to 0-100
  
  return DOMAINS.map((domain, index) => {
    let penalty = 0
    if (submission.findings) {
      submission.findings.forEach(f => {
        const desc = f.description.toLowerCase()
        if (domain === 'Security & Compliance' && (desc.includes('security') || desc.includes('injection') || desc.includes('xss') || f.severity === 'critical')) penalty += 20
        if (domain === 'Performance' && (desc.includes('performance') || desc.includes('loop') || desc.includes('inefficient'))) penalty += 15
        if (domain === 'Reliability' && (desc.includes('error') || desc.includes('unhandled') || desc.includes('leak') || desc.includes('panic'))) penalty += 15
        if (domain === 'Code Quality' && (desc.includes('quality') || desc.includes('format'))) penalty += 10
      })
    }
    
    // pseudo-random variance based on seed and index
    const variance = ((seed + index * 17) % 30) - 15 
    
    let domainScore = Math.max(0, Math.min(100, Math.round(baseScore + variance - penalty)))
    
    if (penalty > 0) {
       domainScore = Math.min(domainScore, 100 - penalty)
    }
    
    return {
      name: domain,
      score: Math.max(10, domainScore) // minimum 10%
    }
  })
}

interface ResultsPanelProps {
  data: Submission
}

export function ResultsPanel({ data }: ResultsPanelProps) {
  const score = data.quality_score ?? 0
  const hiveTitle = data.hive_title || '—'
  const hiveEmoji = data.hive_emoji || <Hexagon weight="duotone" className="text-bespoke-accent" />
  const percentile = data.percentile_rank ?? 50

  // Score ring color based on score
  const scoreColor =
    score >= 8 ? '#10b981' :
    score >= 6 ? '#f59e0b' :
    score >= 4 ? '#f97316' :
    '#ef4444'

  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference * (1 - score / 10)

  const domainScores = generateDomainScores(data)

  const [isPlaying, setIsPlaying] = useState(false)
  const [rewrittenCode, setRewrittenCode] = useState<string | null>(null)

  const handleDownloadReport = () => {
    let md = `# Bhramari Swarm Report\n\n`
    md += `**Score:** ${score.toFixed(1)} / 10\n`
    md += `**Verdict:** ${hiveTitle}\n\n`
    md += `## Bug Nature & Findings\n`
    if (data.findings && data.findings.length > 0) {
      data.findings.forEach((f, i) => {
        md += `${i+1}. [${f.severity.toUpperCase()}] ${f.description}\n`
        if (f.line) md += `   - Line: ${f.line}\n`
        if (f.suggestion) md += `   - Proposed Fix: ${f.suggestion}\n`
      })
    } else {
      md += `No issues found.\n`
    }
    
    md += `\n## Proposed Architecture / Strengths\n`
    if (data.strengths && data.strengths.length > 0) {
      data.strengths.forEach(s => md += `- ${s}\n`)
    }
    md += `\n**Next Step:** ${data.growth_tip || ''}\n`

    md += `\n## Prompt to generate correct code\n`
    md += `Please act as a senior software engineer. Review the following issues found in the code:\n\n`
    if (data.findings) {
      data.findings.forEach(f => {
        md += `- ${f.description} (Suggested fix: ${f.suggestion || ''})\n`
      })
    }
    md += `\nBased on these findings, rewrite the provided code to be secure, performant, and follow architectural best practices.`

    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bhramari_report_${data.id || 'export'}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleRewriteCode = () => {
    if (!data.findings || data.findings.length === 0) {
      setRewrittenCode("// No findings to fix!")
      return
    }
    
    // Attempt to extract suggested code block from findings
    let rewritten = ""
    data.findings.forEach((f) => {
      if (f.suggestion) {
        rewritten += `// Fix for: ${f.description}\n`
        rewritten += `${f.suggestion}\n\n`
      }
    })
    
    if (!rewritten) rewritten = "// Swarm provided suggestions but no specific code blocks."
    setRewrittenCode(rewritten)
  }

  const handleTTS = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      return
    }
    
    // Construct text to read based on what's available
    const summaryText = data.summary ? data.summary : ''
    const strengthsText = data.strengths?.length ? `Strengths include: ${data.strengths.join('. ')}.` : ''
    const tipText = data.growth_tip ? `Next step: ${data.growth_tip}` : ''
    const findingsText = data.findings?.length ? `The swarm found ${data.findings.length} issues.` : ''
    
    const textToRead = `Your code scored ${score.toFixed(1)} out of 10. ${summaryText} ${findingsText} ${strengthsText} ${tipText}`
    
    const utterance = new SpeechSynthesisUtterance(textToRead)
    // Optional: map targetLanguage to voice lang if we had it in Submission model
    // utterance.lang = 'en-US'
    
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)
    
    window.speechSynthesis.speak(utterance)
    setIsPlaying(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-2xl p-6 mb-8 bg-bespoke-surface/80 border border-bespoke-border shadow-sm"
    >
      {/* Score + strengths row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Score Ring */}
        <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-cyan-500/10 border border-amber-500/20">
          <div className="relative w-28 h-28">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="45"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="50" cy="50" r="45"
                stroke={scoreColor}
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black" style={{ color: scoreColor }}>{score.toFixed(1)}</span>
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Score</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 h-8">
            <div className="text-2xl flex justify-center items-center">{hiveEmoji}</div>
            <button 
              onClick={handleTTS}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                isPlaying 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : 'bg-bespoke-accent/20 text-bespoke-accent border border-bespoke-accent/30 hover:bg-bespoke-accent/30'
              }`}
              title="Listen to Review"
            >
              {isPlaying ? <><StopCircle weight="fill" /> Stop</> : <><SpeakerHigh weight="fill" /> Listen</>}
            </button>
          </div>
          <div className="text-sm font-semibold text-bespoke-text mt-2">{hiveTitle}</div>
          <div className="text-xs text-bespoke-muted mt-1">Top {100 - percentile}% of hive</div>
        </div>

        {/* Strengths */}
        <div className="flex flex-col h-full">
          <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <CheckCircle size={18} weight="duotone" /> Strengths
          </h4>
          <ul className="space-y-2 flex-grow">
            {(data.strengths || []).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-bespoke-text">
                <CheckCircle size={16} weight="fill" className="text-green-500 mt-0.5 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Growth tip */}
        <div className="flex flex-col h-full">
          <h4 className="font-semibold text-amber-600 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <Sparkle size={18} weight="duotone" /> Next Step
          </h4>
          <p className="text-sm text-bespoke-text bg-amber-50 p-3 rounded-xl border border-amber-200 leading-relaxed">
            {data.growth_tip || 'Keep improving your code!'}
          </p>
          {data.patterns_matched && data.patterns_matched.length > 0 && (
            <div className="mt-3 flex-grow">
              <p className="text-xs text-bespoke-muted font-medium mb-1.5 uppercase tracking-wider">Hive Memory Matched</p>
              {data.patterns_matched.slice(0, 2).map((p, i) => (
                <div key={i} className="text-xs text-bespoke-muted bg-gray-50 p-2 rounded-lg border border-gray-200 mb-1">
                  {p.rule_text}
                </div>
              ))}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="mt-auto pt-4 flex gap-2 justify-end">
            <button 
              onClick={handleRewriteCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors"
            >
              <Code size={16} weight="bold" /> Rewrite Code
            </button>
            <button 
              onClick={handleDownloadReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bespoke-accent/10 border border-bespoke-accent/30 text-bespoke-accent text-xs font-semibold hover:bg-bespoke-accent/20 transition-colors"
            >
              <DownloadSimple size={16} weight="bold" /> Download Report
            </button>
          </div>
        </div>
      </div>

      {/* 7-Domain Scorecard (Honeypot Meter) */}
      <div className="mb-6 pt-5 border-t border-bespoke-border">
        <h4 className="font-semibold mb-4 text-sm text-bespoke-text flex items-center gap-2">
          <ShieldCheck size={20} className="text-bespoke-accent" weight="duotone" /> Soloknuckle 7-Domain Scorecard
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {domainScores.map((ds, i) => {
            const barColor = ds.score >= 80 ? 'bg-green-500' : ds.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
            const textColor = ds.score >= 80 ? 'text-green-700' : ds.score >= 50 ? 'text-amber-700' : 'text-red-700'
            const bgColor = ds.score >= 80 ? 'bg-green-50 border-green-100' : ds.score >= 50 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'

            return (
              <div key={i} className={`p-3 rounded-xl border ${bgColor}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-bespoke-text">{ds.name}</span>
                  <span className={`text-xs font-bold ${textColor}`}>{ds.score}%</span>
                </div>
                <div className="w-full bg-black/5 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${ds.score}%` }}
                    transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                    className={`h-full ${barColor}`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Findings Grid */}
      {data.findings && data.findings.length > 0 && (
        <div className="pt-5 border-t border-bespoke-border">
          <h4 className="font-semibold mb-3 text-sm text-bespoke-text">
            Swarm Findings ({data.findings.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.findings.map((f, i) => {
              const dotColor =
                f.severity === 'critical' ? 'bg-red-500' :
                f.severity === 'high' ? 'bg-orange-500' :
                f.severity === 'medium' ? 'bg-yellow-500' :
                'bg-green-500'

              return (
                <motion.div
                  key={f.id || i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`} />
                    <span className="text-bespoke-text font-medium">{f.description}</span>
                  </div>
                  {f.suggestion && (
                    <div className="text-xs text-indigo-700 mt-1.5 ml-4 font-mono prose prose-indigo max-w-none">
                      Fix: <ReactMarkdown>{f.suggestion}</ReactMarkdown>
                    </div>
                  )}
                  {f.line && (
                    <p className="text-xs text-bespoke-muted mt-0.5 ml-4 font-mono">Line {f.line}</p>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
      {/* Suggested IDE Prompt & Report Preview */}
      <div className="mt-6 pt-5 border-t border-bespoke-border">
        <h4 className="font-semibold mb-3 text-sm text-bespoke-text flex items-center gap-2">
          <Sparkle size={18} className="text-indigo-600" weight="duotone" /> Suggested IDE Prompt (Copy to Cursor/VSCode)
        </h4>
        <div className="relative p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 font-mono text-xs text-indigo-900 leading-relaxed mb-4">
          <button 
            onClick={() => {
              const text = `Please act as a senior software engineer. Review the following issues found in the code:\n` + 
                (data.findings || []).map(f => `- ${f.description} (Suggested fix: ${f.suggestion || ''})`).join('\n') + 
                `\n\nBased on these findings, rewrite the provided code to be secure, performant, and follow architectural best practices.`;
              navigator.clipboard.writeText(text);
              alert("Prompt copied to clipboard!");
            }}
            className="absolute top-3 right-3 px-2 py-1 rounded bg-indigo-100 border border-indigo-200 hover:bg-indigo-200 transition-colors text-[10px] font-bold"
          >
            Copy Prompt
          </button>
          <p className="font-bold mb-2">// Prompt 1: Secure Code Regeneration</p>
          <p className="text-bespoke-muted select-all">
            Please act as a senior software engineer. Review the following issues found in the code:<br />
            {(data.findings || []).slice(0, 3).map((f, i) => (
              <span key={i}>- {f.description} (Suggested fix: {f.suggestion || ''})<br /></span>
            ))}
            ...<br />
            Based on these findings, rewrite the provided code to be secure, performant, and follow architectural best practices.
          </p>
        </div>
      </div>


      {/* Rewritten Code Modal */}
      {rewrittenCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-bespoke-surface rounded-2xl border border-bespoke-border shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-bespoke-border">
              <h3 className="font-bold text-bespoke-text flex items-center gap-2">
                <Code size={20} className="text-indigo-600" /> Suggested Rewrite
              </h3>
              <button 
                onClick={() => setRewrittenCode(null)}
                className="text-bespoke-muted hover:text-bespoke-text transition-colors"
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-grow bg-gray-50 font-mono text-sm text-gray-800">
              <pre className="whitespace-pre-wrap">{rewrittenCode}</pre>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
