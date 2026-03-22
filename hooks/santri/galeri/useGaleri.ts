'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface GaleriImage {
  id: string
  image_url: string
  galeri_kategori_id: string | null
  created_at: string
  width: number | null
  height: number | null
  judul: string | null
  deskripsi: string | null
}

interface SupabaseGaleriRow {
  id: string
  image_url: string
  galeri_kategori_id: string | null
  created_at: string
  width: number | null
  height: number | null
  judul: string | null
  deskripsi: string | null
}

export function useGaleri() {
  const [galeri, setGaleri] = useState<GaleriImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    async function fetchGaleri() {
      try {
        const { data, error } = await supabase
          .from('galeri')
          .select('id, image_url, galeri_kategori_id, created_at, width, height, judul, deskripsi')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Gagal mengambil data galeri:', error)
          return
        }

        if (data && isMounted) {
          const rows = data as unknown as SupabaseGaleriRow[]
          const transformed: GaleriImage[] = rows
            .filter((item) => item.image_url && item.image_url.trim() !== '')
            .map((item) => ({
              id: item.id,
              image_url: item.image_url.startsWith('http')
                ? item.image_url
                : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/galeri/${item.image_url}`,
              galeri_kategori_id: item.galeri_kategori_id,
              created_at: item.created_at,
              width: item.width,
              height: item.height,
              judul: item.judul,
              deskripsi: item.deskripsi,
            }))
          setGaleri(transformed)
        }
      } catch (err) {
        console.error('Error fetching galeri:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchGaleri()
    return () => {
      isMounted = false
    }
  }, [])

  return { galeri, loading }
}
