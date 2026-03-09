'use client'

import { useState, useRef, useEffect } from 'react'
import { useBerita } from '@/hooks/santri/berita/useBerita'
import { useKategori } from '@/hooks/santri/berita/useBeritaKategori'
import { motion, AnimatePresence } from 'motion/react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import LoadMoreSpinner from '@/components/LoadMoreSpinner'
import CardBerita from '@/components/card/CardBerita'
import { IconFilter, IconSortAscending, IconNews } from '@tabler/icons-react'

export default function BeritaPage() {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [activeTab, setActiveTab] = useState('terbaru')
  const { berita, isLoading, setPage, hasMore } = useBerita(selectedCategory)
  const { kategori } = useKategori()
  const observerTarget = useRef<HTMLDivElement>(null)

  const categories = [{ id: '', nama: 'Semua' }, ...kategori]

  useEffect(() => {
    const currentTarget = observerTarget.current

    const observer = new IntersectionObserver(
      (entries) => {
        // Tambahkan pengecekan isLoading yang sangat ketat
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage((prev) => prev + 1)
        }
      },
      {
        threshold: 0.5,
        rootMargin: '100px',
      }
    )

    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) observer.unobserve(currentTarget)
    }
  }, [hasMore, isLoading, setPage])

  const sortedBerita = [...berita].sort((a, b) => {
    if (activeTab === 'terpopuler') {
      return (b.views || 0) - (a.views || 0)
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Hero Section - Profesional & Clean */}
      <section className="relative overflow-hidden border-b bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <Badge
              variant="outline"
              className="mb-4 border-primary text-primary bg-primary/5 px-3 py-1 uppercase tracking-tighter"
            >
              Warta Al-Hikmah
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Berita & <span className="text-primary">Informasi</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
              Temukan informasi terkini seputar kegiatan akademik, prestasi santri, dan pengumuman
              penting lainnya di lembaga kami secara transparan dan akurat.
            </p>
          </motion.div>
        </div>
        {/* Dekoratif Background */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Kontrol Filter & Sortir */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          {/* Category Filter menggunakan Shadcn-like pills */}
          <div className="space-y-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <IconFilter size={18} className="text-primary" />
              Filter Kategori
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`rounded-full transition-all ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'hover:bg-primary/10 hover:border-primary/50'
                  }`}
                >
                  {category.nama}
                </Button>
              ))}
            </div>
          </div>

          {/* Sort Tabs menggunakan Shadcn UI Tabs */}
          <div className="space-y-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2 lg:justify-end">
              <IconSortAscending size={18} className="text-accent" />
              Urutkan Berdasarkan
            </div>
            <Tabs
              defaultValue="terbaru"
              className="w-full sm:w-[300px]"
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 border">
                <TabsTrigger
                  value="terbaru"
                  className="data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  Terbaru
                </TabsTrigger>
                <TabsTrigger
                  value="terpopuler"
                  className="data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  Terpopuler
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <Separator className="mb-12 opacity-50" />

        {/* News Grid dengan AnimatePresence untuk smooth transition saat filter */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {sortedBerita.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <CardBerita item={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State jika berita tidak ditemukan */}
        {!isLoading && sortedBerita.length === 0 && (
          <div className="py-20 text-center">
            <IconNews size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground">
              Tidak ada berita ditemukan
            </h3>
            <Button variant="link" onClick={() => setSelectedCategory('')} className="text-primary">
              Hapus filter
            </Button>
          </div>
        )}

        {/* Loading & Observer Target */}
        <div ref={observerTarget} className="py-12 flex justify-center w-full">
          {isLoading ? (
            <LoadMoreSpinner />
          ) : hasMore ? (
            <div className="h-4 w-full" />
          ) : sortedBerita.length > 0 ? (
            <p className="text-muted-foreground text-sm italic">Semua berita telah dimuat.</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
