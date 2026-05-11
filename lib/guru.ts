import { createClient } from '@/lib/supabase/client'

// ─── Types ───────────────────────────────────────────────────────────

export interface Guru {
  id: number
  nama: string | null
  jabatan: string | null
  image_url: string | null
  updated_at: string | null
  created_at: string
}

export interface InsertGuruInput {
  nama?: string | null
  jabatan?: string | null
  image_url?: string | null
}

export interface UpdateGuruInput {
  nama?: string | null
  jabatan?: string | null
  image_url?: string | null
}

// ─── Color Palette for Jabatan ───────────────────────────────────────

const DYNAMIC_COLORS = [
  {
    text: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-600 dark:bg-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
  },
  {
    text: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-600 dark:bg-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-950',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  {
    text: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-600 dark:bg-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-950',
    border: 'border-amber-200 dark:border-amber-800',
  },
  {
    text: 'text-violet-600 dark:text-violet-400',
    dot: 'bg-violet-600 dark:bg-violet-400',
    bg: 'bg-violet-100 dark:bg-violet-950',
    border: 'border-violet-200 dark:border-violet-800',
  },
  {
    text: 'text-rose-600 dark:text-rose-400',
    dot: 'bg-rose-600 dark:bg-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-950',
    border: 'border-rose-200 dark:border-rose-800',
  },
  {
    text: 'text-cyan-600 dark:text-cyan-400',
    dot: 'bg-cyan-600 dark:bg-cyan-400',
    bg: 'bg-cyan-100 dark:bg-cyan-950',
    border: 'border-cyan-200 dark:border-cyan-800',
  },
  {
    text: 'text-orange-600 dark:text-orange-400',
    dot: 'bg-orange-600 dark:bg-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-950',
    border: 'border-orange-200 dark:border-orange-800',
  },
  {
    text: 'text-pink-600 dark:text-pink-400',
    dot: 'bg-pink-600 dark:bg-pink-400',
    bg: 'bg-pink-100 dark:bg-pink-950',
    border: 'border-pink-200 dark:border-pink-800',
  },
]

export function getJabatanStyle(name: string) {
  if (!name) return DYNAMIC_COLORS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return DYNAMIC_COLORS[Math.abs(hash) % DYNAMIC_COLORS.length]
}

// ─── Client ──────────────────────────────────────────────────────────

function getClient() {
  return createClient()
}

// ─── CRUD ────────────────────────────────────────────────────────────

export async function fetchGuru(): Promise<Guru[]> {
  const supabase = getClient()

  const { data, error } = await supabase
    .from('guru')
    .select('id, nama, jabatan, image_url, updated_at, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!data) return []

  return data as Guru[]
}

export async function insertGuru(input: InsertGuruInput): Promise<Guru> {
  const supabase = getClient()

  const { data, error } = await supabase
    .from('guru')
    .insert({
      nama: input.nama?.trim() || null,
      jabatan: input.jabatan?.trim() || null,
      image_url: input.image_url?.trim() || null,
    })
    .select('id, nama, jabatan, image_url, updated_at, created_at')
    .single()

  if (error) throw error
  if (!data) throw new Error('Insert failed')

  return data as Guru
}

export async function updateGuru(id: number, input: UpdateGuruInput): Promise<Guru> {
  const supabase = getClient()

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (input.nama !== undefined) payload.nama = input.nama?.trim() || null
  if (input.jabatan !== undefined) payload.jabatan = input.jabatan?.trim() || null
  if (input.image_url !== undefined) payload.image_url = input.image_url?.trim() || null

  const { data, error } = await supabase
    .from('guru')
    .update(payload)
    .eq('id', id)
    .select('id, nama, jabatan, image_url, updated_at, created_at')
    .single()

  if (error) throw error
  if (!data) throw new Error('Update failed')

  return data as Guru
}

export async function deleteGuru(id: number): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('guru').delete().eq('id', id)
  if (error) throw error
}

export async function deleteBulkGuru(ids: number[]): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('guru').delete().in('id', ids)
  if (error) throw error
}
