import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { GlassCard, SectionHeader } from './GlassCard'
import { ShieldCheck, Lightning, Sparkle, Globe, Crown, Code, FileArrowUp, Bug, TreeStructure, Microphone, Stop, ChatText } from '@phosphor-icons/react'

const API_BASE = import.meta.env.VITE_API_URL || ''

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
  voicePrompt?: string
  setVoicePrompt?: (v: string) => void
  setVoiceLanguage?: (v: string) => void
}

export function Hero({ onSwarm, onFileUpload, code, language, targetLanguage, setCode, setLanguage, setTargetLanguage, isSwarming, status, error, findings, voicePrompt, setVoicePrompt, setVoiceLanguage }: HeroProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const maxRecordingTimerRef = useRef<number | null>(null)

  // Pick best supported MIME type — webm/opus for Chrome, ogg/opus for Firefox
  const getSupportedMime = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
    ]
    return types.find(t => MediaRecorder.isTypeSupported(t)) || ''
  }

  const sendAudio = async (chunks: Blob[], mimeType: string) => {
    setIsTranscribing(true)
    try {
      const blob = new Blob(chunks, { type: mimeType || 'audio/webm' })
      if (blob.size < 1000) {
        setMicError('Recording was too short or empty. Please speak and try again.')
        return
      }
      const formData = new FormData()
      const ext = mimeType.includes('ogg') ? 'ogg' : 'webm'
      formData.append('audio_file', blob, `recording.${ext}`)

      const token = localStorage.getItem('bhramari_token')
      const res = await fetch(
        `${API_BASE}/api/v1/voice/transcribe?language=${targetLanguage}`,
        {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        }
      )
      const data = await res.json()

      if (data.transcription) {
        if (setVoicePrompt) setVoicePrompt(data.transcription)
        if (setVoiceLanguage) setVoiceLanguage(targetLanguage)
        setMicError(null)
      } else {
        setMicError(data.error || 'No speech detected. Please speak clearly and try again.')
      }
    } catch {
      setMicError('Failed to reach the transcription service. Check your connection.')
    } finally {
      setIsTranscribing(false)
    }
  }

  // ── GCP Speech-to-Text via MediaRecorder ──────────────────────────────────
  const startRecording = async () => {
    setMicError(null)
    if (isRecording) {
      // Manual stop — user clicked button again
      if (maxRecordingTimerRef.current) clearTimeout(maxRecordingTimerRef.current)
      mediaRecorderRef.current?.stop()
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError('Microphone not supported in this browser. Use Chrome or Edge.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []

      const mimeType = getSupportedMime()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      mediaRecorderRef.current = recorder

      // Collect audio in 250ms chunks — critical, without this ondataavailable
      // never fires if the track drops before stop() is called
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        setIsRecording(false)
        await sendAudio(audioChunksRef.current, recorder.mimeType)
      }

      // If the browser kills the track (e.g. tab loses focus, timeout),
      // stop gracefully instead of getting stuck
      stream.getAudioTracks()[0].onended = () => {
        if (recorder.state === 'recording') {
          recorder.stop()
        }
        setIsRecording(false)
        if (maxRecordingTimerRef.current) clearTimeout(maxRecordingTimerRef.current)
      }

      recorder.onerror = (e: any) => {
        console.error('MediaRecorder error', e)
        stream.getTracks().forEach(t => t.stop())
        setIsRecording(false)
        setMicError('Recording error. Please try again.')
      }

      // Start with 250ms timeslice so chunks arrive continuously
      recorder.start(250)
      setIsRecording(true)

      // Hard 30s safety cap — prevents runaway recording
      maxRecordingTimerRef.current = window.setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop()
      }, 30000)

    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setMicError('Microphone access denied. Allow mic access in your browser settings and refresh.')
      } else {
        setMicError(`Could not access microphone: ${err.message}`)
      }
    }
  }

  const SAMPLE_PYTHON = `import sqlite3
import hashlib

def authenticate_user(username, password):
    # CRITICAL: SQL Injection vulnerability
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
    cursor.execute(query)
    
    user = cursor.fetchone()
    
    # CRITICAL: Weak hashing algorithm (MD5)
    token = hashlib.md5(f"{username}{password}".encode()).hexdigest()
    
    if user:
        return {"status": "success", "token": token}
    return {"status": "failed"}

def process_large_dataset(items):
    # PERFORMANCE: Inefficient O(n^2) nested loop and string concatenation
    result = ""
    for item in items:
        for sub_item in items:
            if item.id == sub_item.parent_id:
                result += str(item.value) + str(sub_item.value)
    return result`

  const SAMPLE_JS = `const express = require('express');
const app = express();
const { exec } = require('child_process');

app.get('/api/ping', (req, res) => {
  const target = req.query.target;
  
  // CRITICAL: Command Injection vulnerability
  exec(\`ping -c 4 \${target}\`, (error, stdout, stderr) => {
    if (error) {
      // SECURITY: Leaking internal error details to client
      res.status(500).send(\`Error executing command: \${error.message}\\n\${stderr}\`);
      return;
    }
    
    // QUALITY: Missing content-type header and CORS setup
    res.send(\`<h1>Ping Results</h1><pre>\${stdout}</pre>\`);
  });
});

app.listen(3000, () => console.log('Server running!'));`

  const SAMPLE_GO = `package main

import (
\t"database/sql"
\t"fmt"
\t"net/http"
)

func getUserHandler(db *sql.DB) http.HandlerFunc {
\treturn func(w http.ResponseWriter, r *http.Request) {
\t\tuserID := r.URL.Query().Get("id")
\t\t
\t\t// CRITICAL: SQL Injection and unhandled error
\t\tquery := fmt.Sprintf("SELECT name, email FROM users WHERE id = %s", userID)
\t\trows, _ := db.Query(query)
\t\tdefer rows.Close()

\t\tvar name, email string
\t\tif rows.Next() {
\t\t\trows.Scan(&name, &email)
\t\t}

\t\t// SECURITY: XSS vulnerability in response
\t\tw.Header().Set("Content-Type", "text/html")
\t\tfmt.Fprintf(w, "<div>User Profile: %s (%s)</div>", name, email)
\t}
}`

  const SAMPLE_RUST = `use actix_web::{web, App, HttpResponse, HttpServer};
use std::fs;

async fn read_file(path: web::Path<String>) -> HttpResponse {
    // CRITICAL: Path Traversal vulnerability
    let file_path = format!("/var/www/uploads/{}", path);
    
    // RELIABILITY: Unsafe unwrap() causes panic on file not found
    let content = fs::read_to_string(&file_path).unwrap();
    
    // PERFORMANCE: Reading entire file into memory at once
    HttpResponse::Ok()
        .content_type("text/plain")
        .body(content)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new().route("/files/{path}", web::get().to(read_file))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}`

  const SAMPLE_JAVA = `import java.sql.*;
import javax.servlet.http.*;

public class UserProfileServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        String userId = request.getParameter("id");
        
        try {
            // SECURITY: Hardcoded credentials
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost/db", "root", "password123");
            
            // CRITICAL: SQL Injection risk
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE id = '" + userId + "'");
            
            if (rs.next()) {
                // SECURITY: Reflected XSS
                response.getWriter().println("<h1>Welcome " + request.getParameter("name") + "</h1>");
                response.getWriter().println("<p>Email: " + rs.getString("email") + "</p>");
            }
            
            // RELIABILITY: Resource leak, Connection and Statement are not closed in a finally block
        } catch (Exception e) {
            // QUALITY: Empty catch block, swallowing exception
        }
    }
}`

  const SAMPLES: Record<string, string> = {
    python: SAMPLE_PYTHON,
    javascript: SAMPLE_JS,
    typescript: SAMPLE_JS, // Reuse JS for TS
    go: SAMPLE_GO,
    rust: SAMPLE_RUST,
    java: SAMPLE_JAVA,
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
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="ml">മലയാളം (Malayalam)</option>
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
            {/* Context Input */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <ChatText size={18} weight="duotone" className="text-bespoke-accent" />
                <span className="text-sm font-semibold text-bespoke-text">Context / What to analyze?</span>
              </div>
              <div className="relative">
                <textarea
                  value={voicePrompt || ''}
                  onChange={(e) => setVoicePrompt && setVoicePrompt(e.target.value)}
                  placeholder="E.g. Check if the database queries are optimized, or find any security flaws..."
                  className="w-full bg-bespoke-surface border border-bespoke-border rounded-xl px-4 py-3 text-sm text-bespoke-text focus:outline-none focus:border-bespoke-accent transition-colors resize-none h-20"
                />
                <button
                  onClick={startRecording}
                  disabled={isTranscribing}
                  className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    isRecording
                      ? 'bg-red-500/20 text-red-400 animate-pulse'
                      : isTranscribing
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-bespoke-accent/10 text-bespoke-accent hover:bg-bespoke-accent/20'
                  }`}
                  title={isRecording ? 'Stop recording' : isTranscribing ? 'Transcribing...' : 'Record voice context (powered by Google Speech)'}
                  aria-label="Toggle voice recording"
                >
                  {isRecording ? (
                    <Stop size={18} weight="fill" />
                  ) : isTranscribing ? (
                    <svg className="animate-spin w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <Microphone size={18} weight="duotone" />
                  )}
                </button>
              </div>
              {micError && (
                <p className="text-xs text-red-400 mt-1 px-1">{micError}</p>
              )}
              {isRecording && (
                <p className="text-xs text-red-400 mt-1 px-1 animate-pulse">Recording... tap the button again to stop.</p>
              )}
              {isTranscribing && (
                <p className="text-xs text-amber-400 mt-1 px-1 animate-pulse">Transcribing with Google Speech...</p>
              )}
            </div>


            <div className="flex gap-3 mt-4">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect}
                className="hidden" 
              />
              
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
