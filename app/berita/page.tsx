'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { IconNews, IconRefresh, IconAlertCircle } from '@tabler/icons-react'

import { useBerita } from '@/hooks/santri/berita/useBerita'
import { useKategori } from '@/hooks/santri/berita/useBeritaKategori'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import CardBerita, { CardBeritaSkeleton } from '@/components/card/CardBerita'

const SKELETON_COUNT = 6

export default function BeritaPage() {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [activeTab, setActiveTab] = useState('terbaru')

  const { berita, isLoading, hasMore, error, loadMore, retry } = useBerita(selectedCategory)
  const { kategori, isLoading: kategoriLoading } = useKategori()

  const observerTarget = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const categories = [{ id: '', nama: 'Semua' }, ...kategori]

  useEffect(() => {
    observerRef.current?.disconnect()
    observerRef.current = null

    if (!hasMore || isLoading || error) return

    const target = observerTarget.current
    if (!target) return

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore()
      },
      { threshold: 0.1, rootMargin: '200px' }
    )

    observerRef.current.observe(target)

    return () => {
      observerRef.current?.disconnect()
      observerRef.current = null
    }
  }, [hasMore, isLoading, error, loadMore])

  const sortedBerita = [...berita].sort((a, b) => {
    if (activeTab === 'terpopuler') return (b.views || 0) - (a.views || 0)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const isInitialLoad = isLoading && berita.length === 0

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-14 md:py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <Badge
              variant="outline"
              className="mb-4 border-primary bg-primary/5 px-3 py-1 uppercase tracking-tighter text-primary text-[10px] md:text-xs"
            >
              Warta Al-Hikmah
            </Badge>
            <h1 className="mb-4 text-3xl font-extrabold tracking-tight md:text-6xl md:mb-6">
              Berita & <span className="text-primary">Informasi</span>
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-xl">
              Temukan informasi terkini seputar kegiatan akademik, prestasi santri, dan pengumuman
              penting lainnya di lembaga kami secara transparan dan akurat.
            </p>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 h-72 w-72 md:h-96 md:w-96 translate-x-1/4 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Filter */}
        <div className="mb-8 md:mb-10">
          {/* Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex-1 overflow-x-auto scrollbar-none">
              <div className="flex gap-1.5 w-max">
                {kategoriLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-6 w-16 rounded-full shrink-0" />
                    ))
                  : categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                          selectedCategory === category.id
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                        }`}
                      >
                        {category.nama}
                      </button>
                    ))}
              </div>
            </div>

            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="shrink-0 text-xs border border-border rounded-lg px-2 py-1.5 bg-card text-foreground outline-none focus:border-primary cursor-pointer"
            >
              <option value="terbaru">Terbaru</option>
              <option value="terpopuler">Terpopuler</option>
            </select>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex flex-row justify-between items-center gap-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Filter Kategori</p>
              <div className="flex flex-wrap gap-2">
                {kategoriLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-20 rounded-full" />
                    ))
                  : categories.map((category) => (
                      <Button
                        key={category.id}
                        size="sm"
                        variant={selectedCategory === category.id ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`rounded-full transition-all ${
                          selectedCategory === category.id
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'hover:border-primary/50 hover:bg-primary/10'
                        }`}
                      >
                        {category.nama}
                      </Button>
                    ))}
              </div>
            </div>

            <div className="space-y-3 shrink-0">
              <p className="text-sm font-medium text-muted-foreground text-right">Urutkan</p>
              <Tabs defaultValue="terbaru" className="w-65" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 border bg-muted/50">
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
        </div>

        <Separator className="mb-8 md:mb-12 opacity-50" />

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {isInitialLoad
            ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <CardBeritaSkeleton key={i} />)
            : sortedBerita.map((item) => <CardBerita key={item.id} item={item} />)}
        </div>

        {/* Empty state */}
        {!isLoading && !error && sortedBerita.length === 0 && (
          <div className="py-16 text-center">
            <IconNews size={40} className="mx-auto mb-3 text-muted-foreground/30" />
            <h3 className="text-base font-medium text-muted-foreground md:text-xl">
              Tidak ada berita ditemukan
            </h3>
            {selectedCategory && (
              <Button
                variant="link"
                className="text-primary text-sm"
                onClick={() => setSelectedCategory('')}
              >
                Hapus filter
              </Button>
            )}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex items-center gap-2 text-destructive">
              <IconAlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={retry}
              className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/5"
            >
              <IconRefresh size={14} />
              Coba Lagi
            </Button>
          </div>
        )}

        {/* Load more skeleton — saat fetch halaman berikutnya */}
        {isLoading && berita.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mt-3 md:mt-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardBeritaSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Observer target */}
        <div ref={observerTarget} className="flex w-full justify-center py-10">
          {!isLoading && !error && !hasMore && sortedBerita.length > 0 && (
            <p className="text-xs italic text-muted-foreground">Semua berita telah dimuat.</p>
          )}
        </div>
      </div>
    </div>
  )
}
