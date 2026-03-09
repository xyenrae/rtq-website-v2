'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// Define the Kategori interface dengan properti id dan nama
interface Kategori {
  id: string
  nama: string
}

// Define the Berita interface
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
  kategori: Kategori // Mengandung id dan nama
}

export function useBerita(selectedCategory: string = '') {
  const [berita, setBerita] = useState<Berita[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 6
  const supabase = createClient()

  // Reset state saat kategori berubah
  useEffect(() => {
    setBerita([])
    setPage(1)
    setHasMore(true)
    setIsLoading(true)
  }, [selectedCategory])

  useEffect(() => {
    const fetchBerita = async () => {
      try {
        setIsLoading(true)
        let query = supabase
          .from('berita')
          // Mengambil data berita beserta data kategori (id dan nama)
          .select('*, kategori:kategori_id (id, nama)')
          .order('created_at', { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1)

        // Jika ada filter kategori (selectedCategory tidak kosong), tambahkan kondisi filter
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
    }

    fetchBerita()
  }, [page, selectedCategory, supabase])

  return { berita, isLoading, setPage, hasMore }
}
