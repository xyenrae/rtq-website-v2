import { createClient } from '@/lib/supabase/client'

// ─── Types ───────────────────────────────────────────────────────────

const BUCKET = 'guru_images'

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

// ─── Client ──────────────────────────────────────────────────────────

function getClient() {
  return createClient()
}

// ─── Storage Helpers ─────────────────────────────────────────────────

function getStoragePathFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url)

    const marker = `/storage/v1/object/public/${BUCKET}/`

    const index = parsed.pathname.indexOf(marker)

    if (index === -1) return null

    return parsed.pathname.slice(index + marker.length)
  } catch {
    return null
  }
}

// ─── Storage ─────────────────────────────────────────────────────────

export async function uploadGuruImage(id: number, file: File): Promise<string> {
  const supabase = getClient()

  const ext = file.name.split('.').pop() ?? 'jpg'
  const fileName = `${Date.now()}-${id}.${ext}`
  const path = `public/${fileName}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
  })

  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)

  return data.publicUrl
}

export async function deleteGuruImage(imageUrl: string): Promise<void> {
  const supabase = getClient()

  const path = getStoragePathFromUrl(imageUrl)

  if (!path) return

  await supabase.storage.from(BUCKET).remove([path])
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

// ─── Insert ──────────────────────────────────────────────────────────

export async function insertGuru(input: InsertGuruInput, file?: File): Promise<Guru> {
  const supabase = getClient()

  const { data: inserted, error: insertError } = await supabase
    .from('guru')
    .insert({
      nama: input.nama?.trim() || null,
      jabatan: input.jabatan?.trim() || null,
      image_url: '__pending__',
    })
    .select('id')
    .single()

  if (insertError) throw insertError
  if (!inserted) throw new Error('Insert failed')

  const id = inserted.id as number

  let imageUrl = input.image_url?.trim() || null

  if (file) {
    imageUrl = await uploadGuruImage(id, file)
  }

  const { data, error: updateError } = await supabase
    .from('guru')
    .update({
      image_url: imageUrl,
    })
    .eq('id', id)
    .select('id, nama, jabatan, image_url, updated_at, created_at')
    .single()

  if (updateError) throw updateError
  if (!data) throw new Error('Update image_url failed')

  return data as Guru
}

// ─── Update ──────────────────────────────────────────────────────────

export async function updateGuru(
  id: number,
  input: UpdateGuruInput,
  file?: File,
  oldImageUrl?: string
): Promise<Guru> {
  const supabase = getClient()

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (input.nama !== undefined) {
    payload.nama = input.nama?.trim() || null
  }

  if (input.jabatan !== undefined) {
    payload.jabatan = input.jabatan?.trim() || null
  }

  if (file) {
    const newUrl = await uploadGuruImage(id, file)

    payload.image_url = newUrl
  } else if (input.image_url !== undefined) {
    payload.image_url = input.image_url?.trim() || null
  }

  const { data, error } = await supabase
    .from('guru')
    .update(payload)
    .eq('id', id)
    .select('id, nama, jabatan, image_url, updated_at, created_at')
    .single()

  if (error) throw error
  if (!data) throw new Error('Update failed')

  // hapus image lama jika upload file baru
  if (file && oldImageUrl) {
    await deleteGuruImage(oldImageUrl)
  }

  return data as Guru
}

// ─── Delete ──────────────────────────────────────────────────────────

export async function deleteGuru(id: number, imageUrl?: string | null): Promise<void> {
  const supabase = getClient()

  const { error } = await supabase.from('guru').delete().eq('id', id)

  if (error) throw error

  if (imageUrl) {
    await deleteGuruImage(imageUrl)
  }
}

export async function deleteBulkGuru(
  items: Array<{
    id: number
    imageUrl?: string | null
  }>
): Promise<void> {
  const supabase = getClient()

  const ids = items.map((i) => i.id)

  const { error } = await supabase.from('guru').delete().in('id', ids)

  if (error) throw error

  const paths = items
    .map((i) => (i.imageUrl ? getStoragePathFromUrl(i.imageUrl) : null))
    .filter((p): p is string => p !== null)

  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths)
  }
}
