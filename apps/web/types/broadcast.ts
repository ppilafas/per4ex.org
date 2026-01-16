export type Speaker = 'host' | 'gpt_a' | 'gpt_b' | 'user'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  speaker?: Speaker
  timestamp?: number
}

export interface TurnStartPayload {
  message: ChatMessage
  speaker: Speaker
}

export interface ChunkPayload {
  messageId: string
  content: string
  delta: string
}

export interface TurnEndPayload {
  messageId: string
  finalContent: string
}

export interface CommentaryPayload {
  analysis: string
}

export interface TopicPayload {
  topic: string
}

export type BroadcastMessageType = 'turn_start' | 'chunk' | 'turn_end' | 'full_state' | 'commentary_state' | 'topic_state'

export interface BroadcastMessage {
  type: BroadcastMessageType
  payload: TurnStartPayload | ChunkPayload | TurnEndPayload | CommentaryPayload | TopicPayload | unknown
  timestamp: number
}

export interface CachedShowData {
  messages: ChatMessage[]
  cachedAt: number
}

export const CACHE_KEY = 'liveshow_cache'
export const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours

export const SPEAKER_CONFIG: Record<Speaker, { name: string; color: string; avatar: string }> = {
  host: { name: 'Alex', color: '#a3e635', avatar: '👤' },
  gpt_a: { name: 'Nova', color: '#3b82f6', avatar: '🤖' },
  gpt_b: { name: 'Spark', color: '#f59e0b', avatar: '✨' },
  user: { name: 'Viewer', color: '#8b5cf6', avatar: '💬' }
}
