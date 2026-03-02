import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Status = 'published' | 'draft'

export interface BeritaKategori {
  id: string
  nama: string
}

export interface Berita {
  id: string
  judul: string
  slug: string
  konten: string
  ringkasan: string
  gambar: string | null
  views: number
  waktu_baca: number
  status: Status
  kategori_id: string
  created_at: string
  updated_at: string
  berita_kategori?: BeritaKategori
}

export interface BeritaInsert {
  judul: string
  slug: string
  konten: string
  ringkasan: string
  gambar?: string | null
  views?: number
  waktu_baca: number
  status: Status
  kategori_id: string
}

// ─── Client ───────────────────────────────────────────────────────────────────

function getClient() {
  return createClient()
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function fetchBerita(): Promise<Berita[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('berita')
    .select('*, berita_kategori(id, nama)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Berita[]
}

export async function fetchKategori(): Promise<BeritaKategori[]> {
  const supabase = getClient()
  const { data, error } = await supabase.from('berita_kategori').select('id, nama').order('nama')

  if (error) throw error
  return data as BeritaKategori[]
}

export async function insertBerita(payload: BeritaInsert): Promise<Berita> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('berita')
    .insert(payload)
    .select('*, berita_kategori(id, nama)')
    .single()

  if (error) throw error
  return data as Berita
}

export async function updateBerita(
  id: string,
  payload: Partial<{
    judul: string
    slug: string
    konten: string
    ringkasan: string
    gambar: string | null
    waktu_baca: number
    status: Status
    kategori_id: string
    tanggal_diterbitkan: string
  }>
): Promise<Berita> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('berita')
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(
      `
      *,
      berita_kategori (
        id,
        nama
      )
    `
    )
    .single()

  if (error) throw error
  return data as Berita
}

export async function deleteBerita(id: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('berita').delete().eq('id', id)
  if (error) throw error
}

export async function deleteBulkBerita(ids: string[]): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('berita').delete().in('id', ids)
  if (error) throw error
}

// ─── Storage ──────────────────────────────────────────────────────────────────

/**
 * Upload file gambar ke Supabase Storage bucket "berita-images".
 * Buat bucket di Supabase Dashboard → Storage → New Bucket
 * Nama: "berita-images", centang "Public bucket".
 */
export async function uploadGambar(file: File): Promise<string> {
  const supabase = getClient()

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const path = `thumbnails/${filename}`

  const { error } = await supabase.storage
    .from('berita-images')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw error

  const { data } = supabase.storage.from('berita-images').getPublicUrl(path)
  return data.publicUrl
}
