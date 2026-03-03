import { createClient } from '@/lib/supabase/client'

export interface BeritaKategori {
  id: string
  nama: string
  deskripsi: string | null
}

export interface InsertKategoriInput {
  nama: string
  deskripsi?: string | null
}

export interface UpdateKategoriInput {
  nama?: string
  deskripsi?: string | null
}

// ─── Color helpers (consistent with BeritaPage) ───────────────────────────────

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
]

function getClient() {
  return createClient()
}

export async function fetchKategori(): Promise<BeritaKategori[]> {
  const supabase = getClient()
  const { data, error } = await supabase.from('berita_kategori').select('id, nama, deskripsi').order('nama')

  if (error) throw error
  return data as BeritaKategori[]
}

export async function insertKategori({
  nama,
  deskripsi,
}: InsertKategoriInput): Promise<BeritaKategori> {
  const supabase = getClient()

  const { data, error } = await supabase
    .from('berita_kategori')
    .insert({
      nama: nama.trim(),
      deskripsi: deskripsi?.trim() || null,
    })
    .select('id, nama, deskripsi, created_at, updated_at')
    .single()

  if (error) throw error
  return data as BeritaKategori
}

export async function updateKategori(
  id: string,
  { nama, deskripsi }: UpdateKategoriInput
): Promise<BeritaKategori> {
  const supabase = getClient()

  const updatePayload: Record<string, unknown> = {}

  if (nama !== undefined) {
    updatePayload.nama = nama.trim()
  }
  if (deskripsi !== undefined) {
    updatePayload.deskripsi = deskripsi?.trim() || null
  }

  // Prevent empty update
  if (Object.keys(updatePayload).length === 0) {
    throw new Error('No fields to update')
  }

  const { data, error } = await supabase
    .from('berita_kategori')
    .update(updatePayload)
    .eq('id', id)
    .select('id, nama, deskripsi, created_at, updated_at')
    .single()

  if (error) throw error
  return data as BeritaKategori
}

export async function deleteKategori(id: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('berita_kategori').delete().eq('id', id)
  if (error) throw error
}

export function getCategoryStyle(name: string) {
  if (!name) return DYNAMIC_COLORS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return DYNAMIC_COLORS[Math.abs(hash) % DYNAMIC_COLORS.length]
}

export async function deleteBulkKategori(ids: string[]): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('berita_kategori').delete().in('id', ids)
  if (error) throw error
}
