import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  glow?: 'amber' | 'cyan' | 'purple' | 'none'
  onClick?: () => void
}

const glowClasses = {
  amber: 'hover:border-amber-500/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]',
  cyan: 'hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]',
  purple: 'hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]',
  none: '',
}

export function GlassCard({ children, className = '', glow = 'none', onClick }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`glass rounded-2xl p-6 ${glowClasses[glow]} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </motion.div>
  )
}

interface SectionHeaderProps {
  icon: ReactNode
  title: string
  subtitle?: string
}

export function SectionHeader({ icon, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-lg text-bespoke-accent">{icon}</span>
      <h3 className="font-bold text-bespoke-text text-base">{title}</h3>
      {subtitle && <p className="text-xs text-bespoke-muted ml-1">{subtitle}</p>}
    </div>
  )
}
