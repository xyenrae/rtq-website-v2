'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'

interface Guru {
  id: number
  nama: string
  peran: string
  image_url: string
}

export default function CardSliderGuru() {
  const [gurus, setGurus] = useState<Guru[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchGurus = async () => {
      const { data, error } = await supabase.from('guru').select('*')
      if (!error && data) setGurus(data)
    }
    fetchGurus()
  }, [supabase])

  return (
    <div className="relative px-4">
      <Carousel opts={{ align: 'start', loop: true }} className="w-full">
        <CarouselContent>
          {gurus.map((guru) => (
            <CarouselItem key={guru.id} className="basis-[220px] shrink-0">
              <div className="overflow-hidden shadow-sm rounded-xl border border-gray-100">
                <div className="relative w-full h-[260px]">
                  <Image
                    src={guru.image_url}
                    alt={guru.nama}
                    fill
                    className="object-cover"
                    sizes="220px"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-sm font-semibold mb-1 text-gray-800 line-clamp-2 md:text-base">
                    {guru.nama}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed md:text-sm">
                    {guru.peran}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
