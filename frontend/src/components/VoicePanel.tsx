import { useState } from 'react'
import { motion } from 'framer-motion'


// Add global TypeScript definitions for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const LANG_LABELS: Record<string, string> = {
  'hi-IN': 'हिन्दी',
  'ta-IN': 'தமிழ்',
  'bn-IN': 'বাংলা',
  'mr-IN': 'मराठी',
  'en-IN': 'English',
}

interface VoicePanelProps {
  onVoiceCaptured?: (text: string, language: string) => void;
}

export function VoicePanel({ onVoiceCaptured }: VoicePanelProps) {
  const [selectedLang, setSelectedLang] = useState('hi-IN')
  const [isListening, setIsListening] = useState(false)
  const [result, setResult] = useState<string | null>(null)


  const handleListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setResult('<span class="text-red-400 font-medium">Error: Speech Recognition API is not supported in this browser. Please use Chrome or Edge.</span>')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = selectedLang
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setResult(null)
    }

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript
      const confidence = Math.round(event.results[0][0].confidence * 100)
      
      setResult(`
        <span class="text-amber-400 font-medium">🗣️ Dictation Captured (${LANG_LABELS[selectedLang]})</span><br/>
        <span class="text-white">${speechResult}</span><br/><br/>
        <span class="text-gray-400 text-xs">Confidence: ${confidence}%</span>
      `)
      
      if (onVoiceCaptured) {
        onVoiceCaptured(speechResult, selectedLang)
      }
    }

    recognition.onerror = (event: any) => {
      setIsListening(false)
      setResult(`<span class="text-red-400 font-medium">Error: ${event.error}</span><br/><span class="text-gray-400 text-xs">Please ensure you have granted microphone permissions.</span>`)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
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
