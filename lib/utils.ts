import { Confession } from './supabase'

export function formatNum(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function getTotalReactions(c: Confession | any): number {
  return (c.reactions_cry || 0) + (c.reactions_laugh || 0) + (c.reactions_dead || 0)
}

export function getShareText(confession: Confession | any, appUrl: string): string {
  return `"${confession.text}"\n\n— Anonymous Corper (${confession.batch})\n\n😭 Corper Confessions\n${appUrl}/confession/${confession.id}\n\n#NYSC #CorperLife #CorperConfessions`
}
