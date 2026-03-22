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

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    async function fetchKategori() {
      const { data, error } = await supabase
        .from('galeri_kategori')
        .select('id, nama')
        .order('nama', { ascending: true })

      if (error) {
        console.error('Gagal mengambil data kategori galeri:', error)
      } else if (data && isMounted) {
        setKategori(data as GaleriKategori[])
      }
      if (isMounted) setLoading(false)
    }

    fetchKategori()
    return () => {
      isMounted = false
    }
  }, [])

  return { kategori, loading }
}
