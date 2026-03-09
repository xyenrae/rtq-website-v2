'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface GaleriKategori {
  id: string
  nama: string
}

export function useGaleriKategori() {
  const [kategori, setKategori] = useState<GaleriKategori[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchKategori() {
      const { data, error } = await supabase.from('galeri_kategori').select('*')
      if (error) {
        console.error('Gagal mengambil data kategori galeri:', error)
      } else {
        setKategori(data as GaleriKategori[])
      }
      setLoading(false)
    }
    fetchKategori()
  }, [supabase])

  return { kategori, loading }
}
