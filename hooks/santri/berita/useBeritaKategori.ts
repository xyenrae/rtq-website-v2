'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface BeritaKategori {
  id: string
  nama: string
}

export function useKategori() {
  const [kategori, setKategori] = useState<BeritaKategori[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchKategori = async () => {
      const { data, error } = await supabase
        .from('berita_kategori')
        .select('*')
        .order('nama', { ascending: true })
      if (error) {
        setError('Gagal memuat kategori.')
      } else {
        setKategori(data)
      }
      setIsLoading(false)
    }

    fetchKategori()
  }, [supabase])

  return { kategori, isLoading, error }
}
