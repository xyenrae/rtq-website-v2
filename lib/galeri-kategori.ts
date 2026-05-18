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
