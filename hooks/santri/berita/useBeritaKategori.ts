'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface BeritaKategori {
  id: string
  nama: string
}

export function useKategori() {
  const [kategori, setKategori] = useState<BeritaKategori[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabaseRef = useRef(createClient())

  /**
   * Mengambil daftar kategori berita.
   */
  useEffect(() => {
    const fetchKategori = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const { data, error } = await supabaseRef.current
          .from('berita_kategori')
          .select('*')
          .order('nama', { ascending: true })

        if (error) throw error

        setKategori(data ?? [])
      } catch (err) {
        console.error('Error fetching kategori:', err)
        setError('Gagal memuat kategori.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchKategori()
  }, [])

  return {
    kategori,
    isLoading,
    error,
  }
}
