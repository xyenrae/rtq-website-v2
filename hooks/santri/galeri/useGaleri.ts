'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface GaleriImage {
  id: string
  image: string
  galeri_kategori_id: string
  created_at: string
  galeri_nama: string
  width: number
  height: number
}

interface SupabaseGaleriData {
  id: string
  image: string
  galeri_kategori_id: string
  created_at: string
  galeri_kategori: { nama: string } | null
  width: number
  height: number
}

export function useGaleri() {
  const [galeri, setGaleri] = useState<GaleriImage[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchGaleri = async () => {
      try {
        const { data, error } = await supabase
          .from('galeri')
          .select(`*, galeri_kategori (nama)`)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Gagal mengambil data galeri:', error)
        } else if (data) {
          const transformedData = (data as SupabaseGaleriData[]).map((item) => ({
            ...item,
            galeri_nama: item.galeri_kategori ? item.galeri_kategori.nama : 'Tidak ada kategori',
          }))
          setGaleri(transformedData as GaleriImage[])
        }
      } catch (err) {
        console.error('Error fetching galeri:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchGaleri()
  }, [supabase])

  return { galeri, loading }
}
