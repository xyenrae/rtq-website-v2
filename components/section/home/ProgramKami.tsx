'use client'
import Image from 'next/image'
import { useState } from 'react'
import { IconX } from '@tabler/icons-react'
import { motion } from 'motion/react'

export default function ProgramKami() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="container mx-auto flex flex-col lg:flex-row gap-8 px-4 py-8">
        {/* Image */}
        <div className="flex-1 flex justify-center items-center">
          <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px]">
            <Image
              src="/images/hero-2.svg"
              alt="Hero Image"
              width={500}
              height={500}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 flex flex-col gap-6">
          <h2 className="font-bold text-2xl lg:text-3xl text-gray-800">Program Kami</h2>

          <p className="text-gray-600 leading-relaxed -mt-2">
            Belajar Al-Qur&#39;an adalah investasi akhirat. Di RTQ Al-Hikmah, setiap santri
            diajarkan membaca ayat suci dan menghidupkan nilai-nilai Islam dalam kehidupan
            sehari-hari.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-white rounded-lg p-4 bg-green-500">
            {[
              { number: '17+', title: 'Tahun Lebih', subtitle: 'Pengalaman' },
              { number: '24+', title: 'Santri Baru', subtitle: 'Setiap Tahun' },
              {
                number: '15+',
                title: 'Santri Meraih',
                subtitle: 'Juara Lomba',
              },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="font-bold text-xl lg:text-2xl">{stat.number}</p>
                <p className="text-sm lg:text-base">{stat.title}</p>
                <p className="text-sm lg:text-base">{stat.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Image
                src="/images/chev.svg"
                alt="Icon"
                width={25}
                height={25}
                className="flex-shrink-0"
              />
              <p className="ml-2 text-gray-700">Kami membantu mencapai yang terbaik.</p>
            </div>

            <div className="flex items-center">
              <Image
                src="/images/chev.svg"
                alt="Icon"
                width={25}
                height={25}
                className="flex-shrink-0"
              />
              <p className="ml-2 text-gray-700">Mencetak generasi islami sejak dini.</p>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-yellow-400 py-3 text-sm sm:text-md px-6 rounded-full text-white font-medium w-fit hover:bg-yellow-500 transition-colors"
          >
            Lihat Detail
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Detail Program Kami</h3>

            <p className="text-gray-600 mb-6">
              Belajar Al-Qur&#39;an di RTQ Al-Hikmah tidak hanya tentang membaca, tapi juga tentang{' '}
              <span className="font-semibold">memahami nilai-nilai Islam</span> yang bisa diterapkan
              sehari-hari. Kami percaya bahwa{' '}
              <span className="font-semibold">setiap santri istimewa</span>, dan kami siap membantu
              mereka mencapai potensi terbaik.
            </p>

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <IconX size={24} stroke={2} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
