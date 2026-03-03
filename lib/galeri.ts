import { createClient } from '@/lib/supabase/client'

// ─── Types ───────────────────────────────────────────────────────────

export interface Galeri {
  id: string
  galeri_kategori_id: string | null
  image_url: string
  created_at: string | null
  width: number | null
  height: number | null
  judul: string | null
  deskripsi: string | null
}

export interface GaleriWithKategori extends Galeri {
  galeri_kategori: {
    id: string
    nama: string
  } | null
}

export interface InsertGaleriInput {
  galeri_kategori_id?: string | null
  image_url: string
  width?: number | null
  height?: number | null
  judul?: string | null
  deskripsi?: string | null
}

export interface UpdateGaleriInput {
  galeri_kategori_id?: string | null
  image_url?: string
  width?: number | null
  height?: number | null
  judul?: string | null
  deskripsi?: string | null
}

// ─── Color Palette ───────────────────────────────────────────────────

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

export function getKategoriStyle(name: string) {
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

// ─── Helper: Transform Relasi Array → Object ────────────────────────

function transformRelasi(data: any[]): GaleriWithKategori[] {
  return data.map((item) => ({
    ...item,
    galeri_kategori: item.galeri_kategori?.[0] ?? null,
  }))
}

// ─── CRUD ────────────────────────────────────────────────────────────

export async function fetchGaleri(): Promise<GaleriWithKategori[]> {
  const supabase = getClient()

  const { data, error } = await supabase
    .from('galeri')
    .select(
      `
      id,
      galeri_kategori_id,
      image_url,
      created_at,
      width,
      height,
      judul,
      deskripsi,
      galeri_kategori:galeri_kategori_id (
        id,
        nama
      )
    `
    )
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!data) return []

  return transformRelasi(data)
}

export async function insertGaleri(input: InsertGaleriInput): Promise<GaleriWithKategori> {
  const supabase = getClient()

  const { data, error } = await supabase
    .from('galeri')
    .insert({
      galeri_kategori_id: input.galeri_kategori_id ?? null,
      image_url: input.image_url.trim(),
      width: input.width ?? null,
      height: input.height ?? null,
      judul: input.judul?.trim() || null,
      deskripsi: input.deskripsi?.trim() || null,
    })
    .select(
      `
      id,
      galeri_kategori_id,
      image_url,
      created_at,
      width,
      height,
      judul,
      deskripsi,
      galeri_kategori:galeri_kategori_id (
        id,
        nama
      )
    `
    )
    .single()

  if (error) throw error
  if (!data) throw new Error('Insert failed')

  return {
    ...data,
    galeri_kategori: data.galeri_kategori?.[0] ?? null,
  }
}

export async function updateGaleri(
  id: string,
  input: UpdateGaleriInput
): Promise<GaleriWithKategori> {
  const supabase = getClient()

  const payload: Record<string, unknown> = {}

  if (input.galeri_kategori_id !== undefined) payload.galeri_kategori_id = input.galeri_kategori_id

  if (input.image_url !== undefined) payload.image_url = input.image_url.trim()

  if (input.width !== undefined) payload.width = input.width

  if (input.height !== undefined) payload.height = input.height

  if (input.judul !== undefined) payload.judul = input.judul?.trim() || null

  if (input.deskripsi !== undefined) payload.deskripsi = input.deskripsi?.trim() || null

  if (Object.keys(payload).length === 0) throw new Error('No fields to update')

  const { data, error } = await supabase
    .from('galeri')
    .update(payload)
    .eq('id', id)
    .select(
      `
      id,
      galeri_kategori_id,
      image_url,
      created_at,
      width,
      height,
      judul,
      deskripsi,
      galeri_kategori:galeri_kategori_id (
        id,
        nama
      )
    `
    )
    .single()

  if (error) throw error
  if (!data) throw new Error('Update failed')

  return {
    ...data,
    galeri_kategori: data.galeri_kategori?.[0] ?? null,
  }
}

export async function deleteGaleri(id: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('galeri').delete().eq('id', id)
  if (error) throw error
}

export async function deleteBulkGaleri(ids: string[]): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('galeri').delete().in('id', ids)
  if (error) throw error
}

// ─── Utils ───────────────────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatDimensions(width: number | null, height: number | null): string {
  if (!width || !height) return '-'
  return `${width} × ${height}`
}
