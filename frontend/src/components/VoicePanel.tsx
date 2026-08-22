import { useState } from 'react'
import { motion } from 'framer-motion'

const VOICE_DEMOS: Record<string, { native: string; translated: string }> = {
  'hi-IN': {
    native: 'भामाई इस Python कोड में security issues check kar — especially SQL injection',
    translated: 'Bhramari check security issues in this Python code — especially SQL injection',
  },
  'ta-IN': {
    native: 'இந்த code review பண்ணு, security மற்றும் performance காண்க',
    translated: 'Review this code, check security and performance',
  },
  'bn-IN': {
    native: 'এই কোডে security vulnerability আছো কিনা দেখো',
    translated: 'Check if this code has security vulnerabilities',
  },
  'mr-IN': {
    native: 'हा कोड रि viu करा, सुरक्षितता तपासा',
    translated: 'Review this code, check security',
  },
  'en': {
    native: 'Review this Python code for SQL injection and performance issues',
    translated: 'Review this Python code for SQL injection and performance issues',
  },
}

const LANG_LABELS: Record<string, string> = {
  'hi-IN': 'हिन्दी',
  'ta-IN': 'தமிழ்',
  'bn-IN': 'বাংলা',
  'mr-IN': 'मराठी',
  'en': 'English',
}

export function VoicePanel() {
  const [selectedLang, setSelectedLang] = useState('hi-IN')
  const [isListening, setIsListening] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const demo = VOICE_DEMOS[selectedLang]

  const handleListen = () => {
    setIsListening(true)
    setResult(null)

    setTimeout(() => {
      setIsListening(false)
      setResult(`
        <span class="text-amber-400 font-medium">🗣️ Spoken (${LANG_LABELS[selectedLang]})</span><br/>
        <span class="text-white">${demo.native}</span><br/><br/>
        <span class="text-cyan-400 font-medium">🔄 Google Translation</span><br/>
        <span class="text-gray-300">${demo.translated}</span><br/><br/>
        <span class="text-green-400 font-medium">🐝 Swarm Triggered</span><br/>
        <span class="text-gray-400 text-xs">security_drone + logic_wasp + cultural_drone activated</span>
      `)
    }, 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="glass rounded-2xl p-6 mb-8"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🎙️</span>
        <h3 className="font-semibold text-white text-base">Voice-First Review</h3>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Speak in Hindi, Tamil, Bengali, Marathi — Bhramari transcribes, translates, and reviews in your language.
      </p>

      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-amber-500/50 transition-colors"
          aria-label="Select voice language"
        >
          {Object.entries(LANG_LABELS).map(([code, label]) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleListen}
          disabled={isListening}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
            isListening
              ? 'bg-red-600/80 text-white cursor-not-allowed'
              : 'bg-cyan-700 hover:bg-cyan-600 text-white'
          }`}
        >
          {isListening ? (
            <>
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Listening...
            </>
          ) : (
            <>
              <span>🎤</span>
              Listen & Review
            </>
          )}
        </motion.button>
      </div>

      {/* Waveform visualization */}
      {isListening && (
        <div className="mt-4 flex items-center justify-center gap-1 h-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-amber-500 rounded-full"
              animate={{
                height: [8, 24 + Math.random() * 16, 8],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.4 + Math.random() * 0.3,
                delay: i * 0.03,
              }}
            />
          ))}
        </div>
      )}

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 text-sm font-mono text-gray-400 whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: result }}
        />
      )}
    </motion.div>
  )
}
