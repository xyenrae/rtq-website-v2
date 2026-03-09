'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Kategori {
  id: string
  nama: string
}

interface Berita {
  id: string
  judul: string
  konten: string
  gambar: string
  views: number
  kategori_id: string
  ringkasan: string
  waktu_baca: number
  created_at: string
  updated_at: string
  kategori: Kategori
}

export function useBerita(selectedCategory: string = '') {
  const [berita, setBerita] = useState<Berita[]>([])
  const [isLoading, setIsLoading] = useState(false) // Default ke false
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 6

  // Inisialisasi Supabase di luar useEffect atau gunakan useMemo
  const supabase = useMemo(() => createClient(), [])

  // Reset state saat kategori berubah
  useEffect(() => {
    setBerita([])
    setPage(1)
    setHasMore(true)
    // Jangan set isLoading true di sini agar tidak bentrok dengan fetchBerita
  }, [selectedCategory])

  const fetchBerita = useCallback(async () => {
    // Cegah fetching jika sudah tidak ada data atau sedang loading
    if (isLoading || (!hasMore && page !== 1)) return

    try {
      setIsLoading(true)
      let query = supabase
        .from('berita')
        .select('*, kategori:kategori_id (id, nama)')
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (selectedCategory !== '') {
        query = query.eq('kategori_id', selectedCategory)
      }

      const { data, error } = await query

      if (error) throw error

      if (data) {
        setBerita((prev) => (page === 1 ? data : [...prev, ...data]))
        setHasMore(data.length === pageSize)
      }
    } catch (error) {
      console.error('Error fetching berita:', error)
    } finally {
      setIsLoading(false)
    }
  }, [page, selectedCategory, supabase, hasMore]) // hasMore & page sebagai kontrol

  useEffect(() => {
    fetchBerita()
    // Hapus supabase dari dependensi jika tidak di-memoize,
    // tapi karena sudah di-memoize di atas, ini aman.
  }, [page, selectedCategory, fetchBerita])

  return { berita, isLoading, setPage, hasMore }
}
