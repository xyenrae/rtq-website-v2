'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { IconEye, IconClock, IconCalendarEvent } from '@tabler/icons-react'

interface CardBeritaProps {
  item: {
    id: string
    gambar: string
    judul: string
    views: number
    kategori: {
      nama: string
    }
    waktu_baca: number
    ringkasan: string
    created_at: string
  }
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
}

const formatTanggal = (date: string) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

const CardBerita: React.FC<CardBeritaProps> = ({ item }) => {
  return (
    <motion.article
      variants={fadeInUp}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <Link href={`/berita/${item.id}`}>
        <div className="relative h-48 overflow-hidden">
          <Image
            src={item.gambar}
            alt={item.judul}
            fill
            className="object-cover transform hover:scale-105 transition-transform duration-300"
          />

          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <IconEye size={18} className="text-gray-600" />
            <span className="text-gray-700">{item.views}</span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full line-clamp-2">
              {item.kategori.nama}
            </span>

            <div className="flex items-center text-gray-500 text-sm gap-1">
              <IconClock size={16} />
              {item.waktu_baca} min
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">{item.judul}</h3>

          <p className="text-gray-600 mb-4 line-clamp-2">{item.ringkasan}</p>

          <div className="flex items-center text-sm text-gray-500 gap-2">
            <IconCalendarEvent size={16} />
            {formatTanggal(item.created_at)}
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

export default CardBerita
