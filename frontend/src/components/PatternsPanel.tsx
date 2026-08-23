import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Books, FolderOpen } from '@phosphor-icons/react'

const SAMPLE_PATTERNS = `id,type,description
1,security,Never interpolate raw user input directly into SQL queries
2,performance,Cache repeated database lookups inside request loops
3,cultural,Hinglish-speaking Indian teams prefer explanatory function names that explain WHY over WHAT
4,historical,This race condition pattern was the #1 cause of UPI outages in Indian fintech 2021
5,formatting,Avoid single-character variable names across all languages
6,security,Always validate and sanitize file uploads before processing
7,logic,Avoid deep nesting — use early returns or guard clauses
8,performance,Use connection pooling for database access in hot paths`

export function PatternsPanel() {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFile(file.name)

    try {
      const resp = await fetch('/api/v1/patterns/import', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('bhramari_token') || ''}` },
        body: file,
      })
      const data = await resp.json()
      setImportResult(`Import successful: ${data.message}`)
    } catch {
      setImportResult('Pattern import simulated — connect backend to enable full functionality')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-2">
        <Books size={24} weight="duotone" className="text-bespoke-accent" />
        <h3 className="font-semibold text-white text-base">Hive Memory</h3>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Upload your team&apos;s historical patterns — every review learns from your collective wisdom.
      </p>

      {/* Upload area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-amber-500/40 hover:bg-amber-500/5 transition-all duration-200"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleUpload}
          className="hidden"
          aria-label="Upload patterns CSV"
        />
        <div className="text-2xl mb-2 flex justify-center text-bespoke-accent">
          <FolderOpen size={32} weight="duotone" />
        </div>
        <p className="text-sm text-gray-300 font-medium">
          {uploadedFile ? `Uploaded: ${uploadedFile}` : 'Click to upload patterns.csv'}
        </p>
        <p className="text-xs text-gray-600 mt-1">CSV with columns: id, type, description</p>
      </div>

      {importResult && (
        <p className="mt-3 text-sm text-green-400">{importResult}</p>
      )}

      {/* Sample patterns */}
      <div className="mt-5">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Sample Patterns</p>
        <div className="bg-black/40 rounded-xl p-4 font-mono text-xs text-gray-500 overflow-x-auto">
          <pre className="whitespace-pre">{SAMPLE_PATTERNS}</pre>
        </div>
      </div>
    </motion.div>
  )
}
