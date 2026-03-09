'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useBerita } from '@/hooks/santri/berita/useBerita'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'motion/react'
import { IconCalendarEvent, IconArrowRight } from '@tabler/icons-react'

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
  }).format(date)
}

export default function Berita() {
  const [isMobile, setIsMobile] = useState(false)
  const { berita, isLoading } = useBerita('')

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  if (isLoading) return <SkeletonLoader />

  return (
    <div className="container mx-auto px-4 pb-16 transition-colors duration-300">
      {/* Header - Diselaraskan dengan gaya VisiMisi */}
      <div className="flex flex-col items-start mb-12 space-y-4">
        <Badge
          variant="outline"
          className="text-primary border-primary/50 bg-primary/10 px-4 py-1 uppercase tracking-widest font-semibold"
        >
          Update Informasi
        </Badge>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Berita <span className="text-primary">Terbaru</span>
        </h2>
        <div className="h-1.5 w-20 bg-accent rounded-full" />
        <p className="max-w-2xl text-muted-foreground text-lg leading-relaxed">
          Kami menyediakan berita terkini tentang program belajar, kegiatan sehari-hari, pengumuman
          penting, dan pencapaian dari Santri RTQ Al-Hikmah.
        </p>
      </div>

      {/* Berita Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {berita.slice(0, isMobile ? 3 : 6).map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/berita/${item.id}`} className="group block h-full">
              <Card className="h-full bg-card/50 border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-row sm:flex-col lg:flex-row shadow-sm">
                {/* Gambar */}
                <div className="relative w-1/3 sm:w-full lg:w-1/3 h-32 sm:h-48 lg:h-auto overflow-hidden">
                  <Image
                    src={item.gambar || '/placeholder.jpg'}
                    alt={item.judul}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 33vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Overlay gradien halus pada gambar */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Konten */}
                <CardContent className="p-4 flex flex-col justify-between flex-1 gap-3">
                  <div className="space-y-2">
                    {/* Kategori */}
                    {item.kategori && (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {item.kategori.nama}
                      </span>
                    )}
                    {/* Judul */}
                    <h3 className="text-base sm:text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                      {item.judul}
                    </h3>
                  </div>

                  {/* Footer Card: Tanggal */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <IconCalendarEvent size={14} />
                      <span className="text-xs">{formatDate(item.created_at)}</span>
                    </div>
                    <IconArrowRight
                      size={16}
                      className="text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Button Lihat Semua - Menggunakan Shadcn UI Button */}
      <div className="mt-12 flex justify-start">
        <Button
          asChild
          size="lg"
          className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all px-8 group"
        >
          <Link href="/berita">
            Lihat Semua Berita
            <IconArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

// Skeleton Loader yang disesuaikan dengan Layout Baru
const SkeletonLoader = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="animate-pulse space-y-4 mb-12">
        <div className="h-6 w-32 bg-muted rounded-full"></div>
        <div className="h-10 w-64 bg-muted rounded-md"></div>
        <div className="h-4 w-96 bg-muted rounded-md opacity-50"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-xl overflow-hidden flex flex-row sm:flex-col lg:flex-row h-32 sm:h-72 lg:h-32 shadow-sm"
          >
            <div className="w-1/3 sm:w-full lg:w-1/3 h-full sm:h-40 lg:h-full bg-muted animate-pulse"></div>
            <div className="p-4 flex-1 space-y-3">
              <div className="h-3 w-16 bg-muted rounded"></div>
              <div className="h-5 w-full bg-muted rounded"></div>
              <div className="h-5 w-2/3 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
