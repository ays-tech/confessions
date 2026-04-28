import { Metadata } from 'next'
import { SEED_CONFESSIONS } from '@/lib/seeds'
import { supabase } from '@/lib/supabase'
import ConfessionDetailClient from './ConfessionDetailClient'

async function getConfession(id: string) {
  // Try seeds first
  const seed = SEED_CONFESSIONS.find(s => s.id === id)
  if (seed) return seed

  // Try Supabase
  const { data } = await supabase
    .from('confessions')
    .select('*')
    .eq('id', id)
    .single()

  return data
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const confession = await getConfession(params.id)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://corperconfessions.ng'

  if (!confession) {
    return { title: 'Confession Not Found | Corper Confessions' }
  }

  const ogUrl = `${appUrl}/api/og?text=${encodeURIComponent(confession.text)}&tag=${encodeURIComponent(confession.tag)}&batch=${confession.batch}&cry=${confession.reactions_cry}&laugh=${confession.reactions_laugh}&dead=${confession.reactions_dead}`

  const description = `"${confession.text.slice(0, 120)}..." — Anonymous Corper (${confession.batch})`

  return {
    title: `${confession.tag} 😭 | Corper Confessions`,
    description,
    openGraph: {
      title: `Corper Confession: ${confession.tag}`,
      description,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Corper Confession: ${confession.tag}`,
      description,
      images: [ogUrl],
    },
  }
}

export default async function ConfessionPage({ params }: { params: { id: string } }) {
  const confession = await getConfession(params.id)
  return <ConfessionDetailClient confession={confession} />
}
