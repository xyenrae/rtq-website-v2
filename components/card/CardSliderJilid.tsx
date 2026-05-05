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
    desc: 'Kitab panduan belajar hukum tajwid: ta\u2019awudz & basmalah, tanwin/nun sukun, mim sukun, ghunnah, mad',
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
      <Carousel opts={{ align: 'start', loop: true }} plugins={[Autoplay({ delay: 3000 })]}>
        <CarouselContent>
          {programs.map((program, index) => (
            <CarouselItem key={program.id} className="basis-full md:basis-1/2 lg:basis-1/3">
              <div className="overflow-hidden flex flex-col h-full py-5 bg-white shadow-sm rounded-xl border border-gray-100">
                <div className="flex justify-center">
                  <Image
                    src={`/images/${program.id === 9 ? 'tahaj' : `jilid-${program.id - 1}`}.png`}
                    alt={program.title}
                    width={200}
                    height={200}
                    className="object-contain"
                  />
                </div>

                <div className="px-5 mt-4 flex flex-col flex-1">
                  <h3 className="text-sm font-semibold mb-1.5 text-gray-800 md:text-base">
                    {program.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-3 mb-5 flex-1 leading-relaxed md:text-sm">
                    {program.desc}
                  </p>

                  <div
                    className={`grid grid-cols-3 gap-3 text-white rounded-xl p-3 ${colorClasses[index % colorClasses.length]}`}
                  >
                    {[
                      { value: program.yrs, label: 'Tahun', sub: 'Usia' },
                      { value: program.days, label: 'Hari', sub: 'Mingguan' },
                      { value: program.hrs, label: 'Jam', sub: 'Periode' },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className={`text-center ${i === 1 ? 'border-x border-white/30' : ''}`}
                      >
                        <p className="text-lg font-bold md:text-xl">{stat.value}</p>
                        <p className="text-[10px] mt-0.5 md:text-xs">{stat.label}</p>
                        <p className="text-[10px] md:text-xs">{stat.sub}</p>
                      </div>
                    ))}
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
