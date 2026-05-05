'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import Autoplay from 'embla-carousel-autoplay'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { animate } from 'motion'
import { IconX } from '@tabler/icons-react'

interface Kelas {
  id: number
  title: string
  desc: string
  fullDesc: string
  image: string
}

const programs: Kelas[] = [
  {
    id: 1,
    title: 'Kelas Tahfidz',
    desc: "Program hafalan Al-Qur'an untuk anak-anak santri, dimulai dengan hafalan surat-surat pendek!",
    fullDesc: "Kelas ini dirancang untuk membantu santri menghafal Al-Qur'an secara bertahap...",
    image: '/images/program-1.png',
  },
  {
    id: 2,
    title: "Khatam Al-Qur'an",
    desc: "Program membaca bagi para santri yang ingin menyelesaikan bacaan Al-Qur'an secara tartil!",
    fullDesc: "Program ini ditujukan bagi santri yang ingin menyelesaikan bacaan Al-Qur'an...",
    image: '/images/program-2.png',
  },
  {
    id: 3,
    title: 'Kelas Tahsin',
    desc: "Pembelajaran membaca Al-Qur'an dengan tajwid yang benar menggunakan Metode Yanbu'a!",
    fullDesc: "Kelas Tahsin difokuskan pada perbaikan bacaan Al-Qur'an...",
    image: '/images/program-3.png',
  },
  {
    id: 4,
    title: 'Kelas Doa Harian',
    desc: 'Mengajarkan doa kehidupan sehari-hari untuk membentuk kebiasaan Islami sejak dini.',
    fullDesc: 'Kelas ini mengajarkan santri berbagai doa harian...',
    image: '/images/program-4.png',
  },
  {
    id: 5,
    title: 'Kelas Akhlak Islami',
    desc: 'Menanamkan nilai-nilai Islami seperti adab terhadap orang tua, guru, dan teman.',
    fullDesc: 'Kelas Akhlak Islami bertujuan untuk menanamkan nilai-nilai Islam...',
    image: '/images/program-5.png',
  },
]

export default function CardSliderProgram() {
  const [selectedProgram, setSelectedProgram] = useState<Kelas | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedProgram && overlayRef.current && modalRef.current) {
      animate(overlayRef.current, { opacity: [0, 1] }, { duration: 0.2 })
      animate(
        modalRef.current,
        { opacity: [0, 1], transform: ['scale(.9)', 'scale(1)'] },
        { duration: 0.25 }
      )
    }
  }, [selectedProgram])

  const closeModal = () => {
    if (!overlayRef.current || !modalRef.current) {
      setSelectedProgram(null)
      return
    }
    animate(overlayRef.current, { opacity: 0 }, { duration: 0.2 })
    animate(
      modalRef.current,
      { opacity: 0, transform: 'scale(.9)' },
      { duration: 0.2, onComplete: () => setSelectedProgram(null) }
    )
  }

  return (
    <div className="relative px-4 ">
      <Carousel opts={{ align: 'start', loop: true }} plugins={[Autoplay({ delay: 3000 })]}>
        <CarouselContent>
          {programs.map((program) => (
            <CarouselItem key={program.id} className="basis-full md:basis-1/2 lg:basis-1/3">
              <div className="rounded-xl border-2 border-yellow-200 border-dotted overflow-hidden bg-white py-5 hover:shadow-md transition-shadow">
                <div className="flex justify-center">
                  <div className="bg-yellow-50 p-5 w-fit rounded-full hover:scale-110 transition-transform">
                    <Image src={program.image} alt={program.title} width={64} height={64} />
                  </div>
                </div>

                <div className="px-5 mt-5 flex flex-col flex-1">
                  <h3 className="text-sm font-semibold mb-2 text-center text-gray-800 md:text-base">
                    {program.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-3 text-center flex-1 leading-relaxed md:text-sm">
                    {program.desc}
                  </p>

                  <div className="flex justify-center mt-5">
                    <button
                      onClick={() => setSelectedProgram(program)}
                      className="border border-yellow-200 py-1.5 px-4 rounded-lg text-xs text-yellow-600 font-medium hover:bg-yellow-50 transition md:text-sm"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Modal */}
      {selectedProgram && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={closeModal}
        >
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative"
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <IconX size={20} />
            </button>
            <h2 className="text-sm font-bold text-gray-800 mb-3 md:text-base">
              {selectedProgram.title}
            </h2>
            <p className="text-xs leading-relaxed text-gray-600 md:text-sm">
              {selectedProgram.fullDesc}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
