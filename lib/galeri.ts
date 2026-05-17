import { createClient } from '@/lib/supabase/client'

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

type RawGaleri = Galeri & {
  galeri_kategori:
    | {
        id: string
        nama: string
      }[]
    | null
}

export interface InsertGaleriInput {
  galeri_kategori_id?: string | null
  image_url: string
  created_at?: string | null
  width?: number | null
  height?: number | null
  judul?: string | null
  deskripsi?: string | null
}

export interface UpdateGaleriInput {
  galeri_kategori_id?: string | null
  image_url?: string
  created_at?: string | null
  width?: number | null
  height?: number | null
  judul?: string | null
  deskripsi?: string | null
}

const BUCKET = 'galeri_images'

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

function getClient() {
  return createClient()
}

function getStoragePath(id: string, file: File): string {
  const ext = file.name.split('.').pop() ?? 'jpg'
  return `public/${id}.${ext}`
}

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

function transformRelasi(data: RawGaleri[]): GaleriWithKategori[] {
  return data.map((item) => ({
    id: item.id,
    galeri_kategori_id: item.galeri_kategori_id,
    image_url: item.image_url,
    created_at: item.created_at,
    width: item.width,
    height: item.height,
    judul: item.judul,
    deskripsi: item.deskripsi,
    galeri_kategori: item.galeri_kategori?.[0] ?? null,
  }))
}

const SELECT_FIELDS = `
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

export async function uploadImage(id: string, file: File): Promise<string> {
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

export async function deleteStorageImage(imageUrl: string): Promise<void> {
  const supabase = getClient()

  const path = getStoragePathFromUrl(imageUrl)

  if (!path) return

  await supabase.storage.from(BUCKET).remove([path])
}

export async function fetchGaleri(): Promise<GaleriWithKategori[]> {
  const supabase = getClient()

  const { data, error } = await supabase
    .from('galeri')
    .select(SELECT_FIELDS)
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!data) return []

  return transformRelasi(data as RawGaleri[])
}

export async function insertGaleri(
  input: InsertGaleriInput,
  file?: File
): Promise<GaleriWithKategori> {
  const supabase = getClient()

  const { data: inserted, error: insertError } = await supabase
    .from('galeri')
    .insert({
      galeri_kategori_id: input.galeri_kategori_id ?? null,
      image_url: '__pending__',
      width: input.width ?? null,
      height: input.height ?? null,
      judul: input.judul?.trim() || null,
      deskripsi: input.deskripsi?.trim() || null,
      created_at: input.created_at ?? null,
    })
    .select('id')
    .single()

  if (insertError) throw insertError
  if (!inserted) throw new Error('Insert failed')

  const id: string = inserted.id

  let imageUrl = input.image_url

  if (file) {
    imageUrl = await uploadImage(id, file)
  }

  const { data, error: updateError } = await supabase
    .from('galeri')
    .update({
      image_url: imageUrl.trim(),
    })
    .eq('id', id)
    .select(SELECT_FIELDS)
    .single()

  if (updateError) throw updateError
  if (!data) throw new Error('Update image_url failed')

  const item = data as RawGaleri

  return {
    id: item.id,
    galeri_kategori_id: item.galeri_kategori_id,
    image_url: item.image_url,
    created_at: item.created_at,
    width: item.width,
    height: item.height,
    judul: item.judul,
    deskripsi: item.deskripsi,
    galeri_kategori: item.galeri_kategori?.[0] ?? null,
  }
}

export async function updateGaleri(
  id: string,
  input: UpdateGaleriInput,
  file?: File,
  oldImageUrl?: string
): Promise<GaleriWithKategori> {
  const supabase = getClient()

  const payload: Record<string, unknown> = {}

  if (input.galeri_kategori_id !== undefined) {
    payload.galeri_kategori_id = input.galeri_kategori_id
  }

  if (input.width !== undefined) {
    payload.width = input.width
  }

  if (input.height !== undefined) {
    payload.height = input.height
  }

  if (input.judul !== undefined) {
    payload.judul = input.judul?.trim() || null
  }

  if (input.deskripsi !== undefined) {
    payload.deskripsi = input.deskripsi?.trim() || null
  }

  if (input.created_at !== undefined) {
    payload.created_at = input.created_at
  }

  if (file) {
    const newUrl = await uploadImage(id, file)

    payload.image_url = newUrl
  } else if (input.image_url !== undefined) {
    payload.image_url = input.image_url.trim()
  }

  if (Object.keys(payload).length === 0) {
    throw new Error('No fields to update')
  }

  const { data, error } = await supabase
    .from('galeri')
    .update(payload)
    .eq('id', id)
    .select(SELECT_FIELDS)
    .single()

  if (error) throw error
  if (!data) throw new Error('Update failed')

  if (file && oldImageUrl) {
    await deleteStorageImage(oldImageUrl)
  }

  const item = data as RawGaleri

  return {
    id: item.id,
    galeri_kategori_id: item.galeri_kategori_id,
    image_url: item.image_url,
    created_at: item.created_at,
    width: item.width,
    height: item.height,
    judul: item.judul,
    deskripsi: item.deskripsi,
    galeri_kategori: item.galeri_kategori?.[0] ?? null,
  }
}

export async function deleteGaleri(id: string, imageUrl: string): Promise<void> {
  const supabase = getClient()

  const { error } = await supabase.from('galeri').delete().eq('id', id)

  if (error) throw error

  await deleteStorageImage(imageUrl)
}

export async function deleteBulkGaleri(
  items: Array<{ id: string; imageUrl: string }>
): Promise<void> {
  const supabase = getClient()

  const ids = items.map((i) => i.id)

  const { error } = await supabase.from('galeri').delete().in('id', ids)

  if (error) throw error

  const paths = items
    .map((i) => getStoragePathFromUrl(i.imageUrl))
    .filter((p): p is string => p !== null)

  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths)
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatDimensions(width: number | null, height: number | null): string {
  if (!width || !height) return '-'

  return `${width} × ${height}`
}
