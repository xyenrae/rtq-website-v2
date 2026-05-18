import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────
export type Status = 'published' | 'draft'
const ALLOWED_TYPES = ['image/png', 'image/jpeg'] as const
const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1 MB

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UploadValidationError'
  }
}
export interface BeritaKategori {
  id: string
  nama: string
  deskripsi: string | null
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

  tanggal_diterbitkan: string | null
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

  tanggal_diterbitkan?: string | null
  created_at?: string
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

export async function insertBerita(payload: BeritaInsert): Promise<Berita> {
  const supabase = getClient()

  const insertPayload = {
    ...payload,

    created_at: payload.created_at || new Date().toISOString(),

    tanggal_diterbitkan:
      payload.status === 'published'
        ? payload.tanggal_diterbitkan || new Date().toISOString()
        : payload.tanggal_diterbitkan || null,
  }

  const { data, error } = await supabase
    .from('berita')
    .insert(insertPayload)
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

  // ── Validasi tipe ──────────────────────────────────────────────────────────
  if (!(ALLOWED_TYPES as readonly string[]).includes(file.type)) {
    throw new UploadValidationError('Format file tidak didukung. Hanya PNG dan JPG yang diizinkan.')
  }

  // ── Validasi ukuran ────────────────────────────────────────────────────────
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2)
    throw new UploadValidationError(`Ukuran file terlalu besar (${sizeMB} MB). Maksimal 1 MB.`)
  }

  // ── Upload ke Supabase Storage ─────────────────────────────────────────────
  const ext = file.type === 'image/png' ? 'png' : 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { data, error } = await supabase.storage
    .from('berita-images') // sesuaikan dengan nama bucket Anda
    .upload(filename, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) throw new Error(error.message)

  const { data: urlData } = supabase.storage.from('berita-images').getPublicUrl(data.path)

  return urlData.publicUrl
}

// ─── Storage Helpers ────────────────────────────────────────────────────────

/**
 * Ekstrak filename dari public URL Supabase Storage
 * Contoh: https://.../berita-images/123-abc.jpg → "123-abc.jpg"
 */
export function extractFilenameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathSegments = urlObj.pathname.split('/').filter(Boolean)
    // Ambil segment terakhir (filename)
    return pathSegments[pathSegments.length - 1] || null
  } catch {
    return null
  }
}

/**
 * Hapus file dari Supabase Storage bucket "berita-images"
 */
export async function deleteImageFromStorage(url: string): Promise<boolean> {
  if (!url) return false

  const filename = extractFilenameFromUrl(url)
  if (!filename) return false

  const supabase = getClient()
  const { error } = await supabase.storage.from('berita-images').remove([filename])

  return !error
}

/**
 * Upload gambar dengan opsi hapus file lama
 */
export async function uploadGambarWithCleanup(
  file: File,
  oldImageUrl?: string | null
): Promise<string> {
  // Hapus image lama jika ada
  if (oldImageUrl) {
    await deleteImageFromStorage(oldImageUrl).catch((err) => {
      console.warn('Gagal menghapus image lama:', err)
      // Lanjutkan upload meski hapus gagal
    })
  }

  return uploadGambar(file) // pakai fungsi upload yang sudah ada
}

export async function updateBeritaWithImage(
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
  }>,
  newImageFile?: File | null, // File baru jika ada upload
  oldImageUrl?: string | null // URL image lama untuk dihapus
): Promise<Berita> {
  const supabase = getClient()

  let finalGambarUrl = payload.gambar ?? null

  // Handle upload gambar baru
  if (newImageFile) {
    try {
      finalGambarUrl = await uploadGambar(newImageFile)

      // Hapus image lama setelah upload sukses
      if (oldImageUrl) {
        await deleteImageFromStorage(oldImageUrl).catch((err) => {
          console.warn('Gagal menghapus image lama:', err)
        })
      }
    } catch (uploadError) {
      console.error('Upload gambar gagal:', uploadError)
      throw uploadError
    }
  }
  // Handle penghapusan gambar (jika payload.gambar === null dan tidak ada file baru)
  else if (payload.gambar === null && oldImageUrl) {
    await deleteImageFromStorage(oldImageUrl).catch((err) => {
      console.warn('Gagal menghapus image saat remove:', err)
    })
  }

  // Update database
  const { data, error } = await supabase
    .from('berita')
    .update({
      ...payload,
      gambar: finalGambarUrl,
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

export async function deleteBeritaWithCleanup(id: string): Promise<void> {
  const supabase = getClient()

  // 1. Ambil data berita dulu untuk mendapatkan URL gambar
  const { data: berita, error: fetchError } = await supabase
    .from('berita')
    .select('gambar')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  // 2. Hapus dari database
  const { error: deleteError } = await supabase.from('berita').delete().eq('id', id)

  if (deleteError) throw deleteError

  // 3. Hapus gambar dari storage (setelah DB sukses)
  if (berita?.gambar) {
    await deleteImageFromStorage(berita.gambar).catch((err) => {
      console.warn('Gagal menghapus gambar dari storage:', err)
      // Tidak throw error agar delete DB tetap sukses
    })
  }
}

// Untuk bulk delete
export async function deleteBulkBeritaWithCleanup(ids: string[]): Promise<void> {
  const supabase = getClient()

  // Ambil semua URL gambar yang akan dihapus
  const { data: beritaList, error: fetchError } = await supabase
    .from('berita')
    .select('gambar')
    .in('id', ids)

  if (fetchError) throw fetchError

  // Hapus dari database
  const { error: deleteError } = await supabase.from('berita').delete().in('id', ids)

  if (deleteError) throw deleteError

  // Hapus semua gambar dari storage
  if (beritaList) {
    for (const berita of beritaList) {
      if (berita?.gambar) {
        await deleteImageFromStorage(berita.gambar).catch((err) => {
          console.warn('Gagal menghapus gambar dari storage:', err)
        })
      }
    }
  }
}
