'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
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

const PAGE_SIZE = 12

function buildUrl(path: string) {
  if (path.startsWith('http')) return path
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/galeri/${path}`
}

export function useGaleri(kategoriId: string | null) {
  const [galeri, setGaleri] = useState<GaleriImage[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // track current fetch params to cancel stale fetches
  const abortRef = useRef<AbortController | null>(null)
  const offsetRef = useRef(0)

  const fetchPage = useCallback(
    async (offset: number, replace: boolean) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      if (replace) setLoading(true)
      else setLoadingMore(true)

      try {
        const supabase = createClient()
        let query = supabase
          .from('galeri')
          .select('id, image_url, galeri_kategori_id, created_at, width, height, judul, deskripsi')
          .order('created_at', { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1)

        if (kategoriId) {
          query = query.eq('galeri_kategori_id', kategoriId)
        }

        const { data, error } = await query

        if (controller.signal.aborted) return
        if (error) {
          console.error('Gagal mengambil data galeri:', error)
          return
        }

        const rows = (data ?? []) as GaleriImage[]
        const transformed: GaleriImage[] = rows
          .filter((item) => item.image_url?.trim())
          .map((item) => ({ ...item, image_url: buildUrl(item.image_url) }))

        setHasMore(transformed.length === PAGE_SIZE)
        offsetRef.current = offset + transformed.length

        setGaleri((prev) => (replace ? transformed : [...prev, ...transformed]))
      } catch (err) {
        if ((err as Error).name !== 'AbortError') console.error(err)
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    },
    [kategoriId]
  )

  useEffect(() => {
    offsetRef.current = 0
    setGaleri([])
    setHasMore(true)
    fetchPage(0, true)
  }, [fetchPage])

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return
    fetchPage(offsetRef.current, false)
  }, [fetchPage, loadingMore, hasMore])

  return { galeri, loading, loadingMore, hasMore, loadMore }
}
