'use client'

import Image from 'next/image'
import Autoplay from 'embla-carousel-autoplay'

import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'

const programs = [
  {
    id: 1,
    title: 'Jilid Pemula',
    desc: 'Kitab panduan belajar membaca huruf hijaiyyah dibaca pendek dan berharokat fathah',
    yrs: '4-5',
    days: 6,
    hrs: 1.1,
  },
  {
    id: 2,
    title: 'Jilid 1',
    desc: 'Kitab panduan belajar baca huruf hijaiyyah berharakat Fathah, pengenalan nama huruf & angka Arab',
    yrs: '5-6',
    days: 6,
    hrs: 1.1,
  },
  {
    id: 3,
    title: 'Jilid 2',
    desc: 'Kitab panduan belajar baca harakat Kasrah, Dhammah, Mad, huruf Lin, serta pengenalan Sukun!',
    yrs: '6-7',
    days: 6,
    hrs: 1.1,
  },
  {
    id: 4,
    title: 'Jilid 3',
    desc: 'Kitab panduan belajar harakat ganda (Fathatain, Kasratain, Dammatain), Tasydid, Qolqolah, Ghunnah',
    yrs: '7-8',
    days: 6,
    hrs: 1.1,
  },
  {
    id: 5,
    title: 'Jilid 4',
    desc: 'Kitab panduan belajar bacaan lafaz Allah, hukum Mim/Nun Sukun & Tanwin, jenis Mad (Jaiz, Wajib, Lazim)',
    yrs: '8-9',
    days: 6,
    hrs: 1.1,
  },
  {
    id: 6,
    title: 'Jilid 5',
    desc: 'Kitab panduan belajar tanda Waqof, bacaan Sukun-Idgham, hukum Tafkhim-Tarqiq, tanda baca Rosm Utsmani',
    yrs: '9-10',
    days: 6,
    hrs: 1.1,
  },
  {
    id: 7,
    title: 'Jilid 6',
    desc: 'Kitab panduan belajar hukum Mad, Hamzah Washol, bacaan khusus (Isymam, Imalah, Saktah), bacaan Shod-Sin',
    yrs: '10-11',
    days: 6,
    hrs: 1.1,
  },
  {
    id: 8,
    title: 'Jilid 7',
    desc: 'Kitab panduan belajar hukum tajwid: ta’awudz & basmalah, tanwin/nun sukun, mim sukun, ghunnah, mad',
    yrs: '11-12',
    days: 6,
    hrs: 1.1,
  },
  {
    id: 9,
    title: "Yanbu'a Tahajji",
    desc: 'Panduan untuk mengajarkan anak agar bisa menulis huruf arab, angka arab serta arab pegon',
    yrs: '8-12',
    days: 6,
    hrs: 1.1,
  },
]

const colorClasses = [
  'bg-yellow-400',
  'bg-orange-400',
  'bg-red-400',
  'bg-purple-400',
  'bg-pink-400',
  'bg-green-400',
  'bg-green-400',
  'bg-slate-400',
  'bg-stone-400',
]

export default function CardSliderJilid() {
  return (
    <div className="px-4">
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
      >
        <CarouselContent>
          {programs.map((program, index) => (
            <CarouselItem
              key={program.id}
              className="
              basis-full
              md:basis-1/2
              lg:basis-1/3
            "
            >
              <div className="overflow-hidden flex flex-col h-full py-6 bg-white shadow-md rounded-lg">
                <div className="relative flex justify-center">
                  <Image
                    src={`/images/${program.id === 9 ? 'tahaj' : `jilid-${program.id - 1}`}.png`}
                    alt={program.title}
                    width={300}
                    height={300}
                    className="object-cover"
                  />
                </div>

                <div className="px-6 mt-6 flex flex-col flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{program.title}</h3>

                  <p className="text-gray-600 line-clamp-3 mb-6 flex-1">{program.desc}</p>

                  <div
                    className={`grid grid-cols-3 gap-4 border-t text-white rounded-xl p-4 ${
                      colorClasses[index % colorClasses.length]
                    }`}
                  >
                    <div className="text-center">
                      <p className="text-2xl font-bold">{program.yrs}</p>
                      <p className="text-sm mt-1">Tahun</p>
                      <p className="text-xs">Usia</p>
                    </div>

                    <div className="text-center border-x">
                      <p className="text-2xl font-bold">{program.days}</p>
                      <p className="text-sm mt-1">Hari</p>
                      <p className="text-xs">Mingguan</p>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold">{program.hrs}</p>
                      <p className="text-sm mt-1">Jam</p>
                      <p className="text-xs">Periode</p>
                    </div>
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
