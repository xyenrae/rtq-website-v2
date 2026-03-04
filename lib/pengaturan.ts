// lib/pengaturan.ts
// CRUD logic untuk pengaturan website RTQ

import { createClient } from '@/lib/supabase/client'

// ============================================================
// TYPES
// ============================================================

export interface PengaturanWebsite {
  id?: string
  // Identitas
  nama_rtq: string
  logo_url?: string | null
  favicon_url?: string | null
  alamat?: string | null
  no_whatsapp?: string | null
  email?: string | null
  google_maps_embed?: string | null
  // Tentang
  deskripsi_singkat?: string | null
  visi?: string | null
  misi?: string[] | null
  // Kontak & Sosial
  whatsapp?: string | null
  instagram?: string | null
  facebook?: string | null
  youtube?: string | null
  teks_footer?: string | null
  // SEO
  meta_title?: string | null
  meta_description?: string | null
  og_image_url?: string | null
  // Metadata
  created_at?: string
  updated_at?: string
}

export interface PengaturanAkun {
  id?: string
  user_id?: string
  nama_lengkap?: string | null
  avatar_url?: string | null
  jabatan?: string | null
  bio?: string | null
  created_at?: string
  updated_at?: string
}

export type PengaturanResult<T> = {
  data: T | null
  error: string | null
}

// ============================================================
// WEBSITE SETTINGS - CLIENT SIDE
// ============================================================

/**
 * Ambil pengaturan website (client side)
 */
export async function getPengaturanWebsite(): Promise<PengaturanResult<PengaturanWebsite>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pengaturan_website')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    return { data: null, error: error.message }
  }

  return { data: data ?? null, error: null }
}

/**
 * Simpan/update pengaturan website (upsert)
 */
export async function savePengaturanWebsite(
  payload: Partial<PengaturanWebsite>
): Promise<PengaturanResult<PengaturanWebsite>> {
  const supabase = createClient()

  // Cek apakah sudah ada data
  const { data: existing } = await supabase
    .from('pengaturan_website')
    .select('id')
    .limit(1)
    .single()

  let result

  if (existing?.id) {
    // Update existing
    result = await supabase
      .from('pengaturan_website')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single()
  } else {
    // Insert baru
    result = await supabase
      .from('pengaturan_website')
      .insert({ ...payload })
      .select()
      .single()
  }

  if (result.error) {
    return { data: null, error: result.error.message }
  }

  return { data: result.data, error: null }
}

/**
 * Update field tertentu saja
 */
export async function updatePengaturanField(
  id: string,
  field: keyof PengaturanWebsite,
  value: unknown
): Promise<PengaturanResult<PengaturanWebsite>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('pengaturan_website')
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

// ============================================================
// AKUN SETTINGS - CLIENT SIDE
// ============================================================

/**
 * Ambil profil akun user saat ini
 */
export async function getPengaturanAkun(): Promise<PengaturanResult<PengaturanAkun>> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'User tidak ditemukan' }

  const { data, error } = await supabase
    .from('pengaturan_akun')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return { data: null, error: error.message }
  }

  return { data: data ?? null, error: null }
}

/**
 * Simpan profil akun (upsert)
 */
export async function savePengaturanAkun(
  payload: Partial<PengaturanAkun>
): Promise<PengaturanResult<PengaturanAkun>> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'User tidak ditemukan' }

  const { data, error } = await supabase
    .from('pengaturan_akun')
    .upsert(
      {
        ...payload,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

/**
 * Update email user (auth)
 */
export async function updateEmail(email: string): Promise<PengaturanResult<null>> {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ email })
  if (error) return { data: null, error: error.message }
  return { data: null, error: null }
}

/**
 * Update password user
 */
export async function updatePassword(password: string): Promise<PengaturanResult<null>> {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { data: null, error: error.message }
  return { data: null, error: null }
}

// ============================================================
// UPLOAD GAMBAR
// ============================================================

type UploadFolder = 'logo' | 'favicon' | 'og-image' | 'avatar'

/**
 * Upload gambar ke Supabase Storage
 */
export async function uploadGambar(
  file: File,
  folder: UploadFolder
): Promise<PengaturanResult<string>> {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const fileName = `${folder}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from('pengaturan')
    .upload(fileName, file, { upsert: true })

  if (error) return { data: null, error: error.message }

  const {
    data: { publicUrl },
  } = supabase.storage.from('pengaturan').getPublicUrl(data.path)

  return { data: publicUrl, error: null }
}

/**
 * Hapus gambar dari storage
 */
export async function deleteGambar(url: string): Promise<PengaturanResult<null>> {
  const supabase = createClient()
  // Extract path dari URL
  const path = url.split('/pengaturan/')[1]
  if (!path) return { data: null, error: 'Path tidak valid' }

  const { error } = await supabase.storage.from('pengaturan').remove([path])

  if (error) return { data: null, error: error.message }
  return { data: null, error: null }
}

// ============================================================
// SERVER SIDE (untuk SSR/Server Components)
// ============================================================

export async function getPengaturanWebsiteServer(): Promise<PengaturanWebsite | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('pengaturan_website').select('*').limit(1).single()
  return data ?? null
}
