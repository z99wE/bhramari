export interface User {
  id: string
  email: string
  username: string
  display_name?: string
  swarm_level: number
  nectar_points: number
  xp: number
  reputation_score: number
  streak_count: number
  spiral_level: number
  preference_language: string
  created_at: string
}

export interface Finding {
  id: string
  agent_type: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  line?: number
  description: string
  suggestion?: string
  translated_to?: string
}

export interface Submission {
  id: string
  title: string
  source_language: string
  quality_score?: number
  percentile_rank?: number
  hive_title?: string
  hive_emoji?: string
  status: 'pending' | 'swarming' | 'completed' | 'failed'
  summary?: string
  strengths?: string[]
  improvements?: string[]
  growth_tip?: string
  findings?: Finding[]
  patterns_matched?: PatternMatch[]
  created_at: string
  completed_at?: string
}

export interface PatternMatch {
  id: string
  category: string
  rule_text: string
  example_after?: string
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  display_name?: string
  nectar_points: number
  quality_avg: number
  streak_count: number
  swarm_level: number
}

export interface SwarmFindingEvent {
  type: 'status' | 'finding' | 'complete' | 'error'
  data: {
    status?: string
    agents?: string[]
    severity?: string
    agent_type?: string
    line?: number
    description?: string
    suggestion?: string
    quality_score?: number
    percentile?: number
    hive_title?: string
    hive_emoji?: string
    findings?: Finding[]
    strengths?: string[]
    growth_tip?: string
    agent_breakdown?: Record<string, number>
    message?: string
  }
}

export type HiveTitle = {
  score: number
  title: string
  emoji: string
}
