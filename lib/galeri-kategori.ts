import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GaleriKategori {
  id: string
  nama: string
  deskripsi: string | null
}

export interface InsertGaleriKategoriInput {
  nama: string
  deskripsi?: string | null
}

export interface UpdateGaleriKategoriInput {
  nama?: string
  deskripsi?: string | null
}

// ─── Color Palette ────────────────────────────────────────────────────────────

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

// ─── Color Helper ─────────────────────────────────────────────────────────────

export function getGaleriKategoriStyle(name: string) {
  if (!name) return DYNAMIC_COLORS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return DYNAMIC_COLORS[Math.abs(hash) % DYNAMIC_COLORS.length]
}

// ─── Client ───────────────────────────────────────────────────────────────────

function getClient() {
  return createClient()
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function fetchGaleriKategori(): Promise<GaleriKategori[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('galeri_kategori')
    .select('id, nama, deskripsi')
    .order('nama')

  if (error) throw error
  return data as GaleriKategori[]
}

export async function insertGaleriKategori({
  nama,
  deskripsi,
}: InsertGaleriKategoriInput): Promise<GaleriKategori> {
  const supabase = getClient()

  const { data, error } = await supabase
    .from('galeri_kategori')
    .insert({
      nama: nama.trim(),
      deskripsi: deskripsi?.trim() || null,
    })
    .select('id, nama, deskripsi')
    .single()

  if (error) throw error
  return data as GaleriKategori
}

export async function updateGaleriKategori(
  id: string,
  { nama, deskripsi }: UpdateGaleriKategoriInput
): Promise<GaleriKategori> {
  const supabase = getClient()

  const updatePayload: Record<string, unknown> = {}

  if (nama !== undefined) {
    updatePayload.nama = nama.trim()
  }
  if (deskripsi !== undefined) {
    updatePayload.deskripsi = deskripsi?.trim() || null
  }

  if (Object.keys(updatePayload).length === 0) {
    throw new Error('No fields to update')
  }

  const { data, error } = await supabase
    .from('galeri_kategori')
    .update(updatePayload)
    .eq('id', id)
    .select('id, nama, deskripsi')
    .single()

  if (error) throw error
  return data as GaleriKategori
}

export async function deleteGaleriKategori(id: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('galeri_kategori').delete().eq('id', id)
  if (error) throw error
}

export async function deleteBulkGaleriKategori(ids: string[]): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('galeri_kategori').delete().in('id', ids)
  if (error) throw error
}
