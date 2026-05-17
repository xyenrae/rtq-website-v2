'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Autoplay from 'embla-carousel-autoplay'

import { createClient } from '@/lib/supabase/client'

import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'

interface Guru {
  id: number
  nama: string
  jabatan: string
  image_url: string
}

export default function CardSliderGuru() {
  const [gurus, setGurus] = useState<Guru[]>([])

  useEffect(() => {
    const supabase = createClient()

    const fetchGurus = async () => {
      const { data, error } = await supabase.from('guru').select('*').order('id')

      if (!error && data) {
        setGurus(data)
      }
    }

    fetchGurus()
  }, [])

  return (
    <div className="relative px-4">
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 3000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {gurus.map((guru) => (
            <CarouselItem key={guru.id} className="pl-4 basis-55">
              <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="relative h-65 w-full">
                  <Image
                    src={guru.image_url}
                    alt={guru.nama}
                    fill
                    className="object-cover"
                    sizes="220px"
                  />
                </div>

                <div className="p-4 text-center">
                  <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-800 md:text-base">
                    {guru.nama}
                  </h3>

                  <p className="line-clamp-2 text-xs leading-relaxed text-gray-600 md:text-sm">
                    {guru.jabatan}
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
