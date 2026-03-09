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

      if (error) {
        console.error('Error fetching guru data:', error)
      } else if (data) {
        setGurus(data)
      }
    }

    fetchGurus()
  }, [supabase])

  return (
    <div className="relative px-4">
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {gurus.map((guru) => (
            <CarouselItem key={guru.id} className="basis-[250px] shrink-0">
              <div className="overflow-hidden shadow-md rounded-lg">
                <div className="relative flex flex-col w-full h-full">
                  {/* Image */}
                  <div className="relative w-full h-[300px]">
                    <Image
                      src={guru.image_url}
                      alt={guru.nama}
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 100vw, 33vw"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 line-clamp-2">
                      {guru.nama}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-3">{guru.peran}</p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
