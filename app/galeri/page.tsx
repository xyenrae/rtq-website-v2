'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Image from 'next/image'
import {
  IconDownload,
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconCalendar,
  IconShare3,
  IconPhoto,
} from '@tabler/icons-react'
import { useGaleri, GaleriImage } from '@/hooks/santri/galeri/useGaleri'
import { useGaleriKategori } from '@/hooks/santri/galeri/useGaleriKategori'
import SkeletonGaleri from '@/components/skeleton/galeri/SkeletonGaleri'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

// ── Pure CSS spinner – zero JS overhead ──────────────────────────────────────
function LoadMoreSpinner() {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <span className="h-4 w-4 rounded-full border-2 border-muted border-t-foreground/60 animate-spin" />
      <span className="text-sm font-medium text-muted-foreground">Memuat lebih banyak…</span>
    </div>
  )
}

// ── Single gallery card (memoised) ───────────────────────────────────────────
const GalleryCard = ({
  img,
  priority,
  onClick,
}: {
  img: GaleriImage
  priority: boolean
  onClick: (img: GaleriImage) => void
}) => {
  const ratio = img.width && img.height ? img.width / img.height : 4 / 3
  // Taller images (portrait) span 2 rows in the masonry-like grid
  const tall = ratio < 0.85

  return (
    <div
      className={`relative overflow-hidden rounded-xl cursor-pointer group bg-muted${tall ? ' row-span-2' : ''}`}
      onClick={() => onClick(img)}
    >
      <Image
        src={img.image_url}
        alt={img.judul ?? 'Foto galeri'}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        loading={priority ? 'eager' : 'lazy'}
        quality={75}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
      {img.judul && (
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-white text-sm font-medium line-clamp-2">{img.judul}</p>
        </div>
      )}
    </div>
  )
}

const GalleryCardMemo = GalleryCard // already stable via parent memo pattern

// ── Main page ─────────────────────────────────────────────────────────────────
export default function GaleriPage() {
  const [activeKategoriId, setActiveKategoriId] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<GaleriImage | null>(null)

  const { galeri, loading, loadingMore, hasMore, loadMore } = useGaleri(activeKategoriId)
  const { kategori, loading: loadingKategori } = useGaleriKategori()

  // Sentinel for infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!hasMore) return
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore()
      },
      { threshold: 0.1, rootMargin: '400px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  // Keyboard nav
  const currentIndex = useMemo(
    () => galeri.findIndex((img) => img.id === selectedImage?.id),
    [galeri, selectedImage]
  )
  const goNext = useCallback(() => {
    if (currentIndex < galeri.length - 1) setSelectedImage(galeri[currentIndex + 1])
  }, [currentIndex, galeri])
  const goPrev = useCallback(() => {
    if (currentIndex > 0) setSelectedImage(galeri[currentIndex - 1])
  }, [currentIndex, galeri])

  useEffect(() => {
    if (!selectedImage) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedImage, goNext, goPrev])

  const handleDownload = useCallback(async () => {
    if (!selectedImage) return
    try {
      const res = await fetch(selectedImage.image_url)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `galeri-${selectedImage.id}.jpg`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Foto berhasil diunduh')
    } catch {
      const a = document.createElement('a')
      a.href = selectedImage.image_url
      a.download = `galeri-${selectedImage.id}.jpg`
      a.target = '_blank'
      a.click()
    }
  }, [selectedImage])

  const handleShare = useCallback(async () => {
    if (!selectedImage) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedImage.judul ?? 'Foto Galeri',
          text: selectedImage.deskripsi ?? 'Lihat foto ini dari galeri kami.',
          url: selectedImage.image_url,
        })
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(selectedImage.image_url)
      toast.success('Link foto disalin ke clipboard')
    }
  }, [selectedImage])

  if (loading || loadingKategori) return <SkeletonGaleri />

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Hero ── */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {galeri[0]?.image_url ? (
            <Image
              src={galeri[0].image_url}
              alt="Hero Galeri"
              fill
              className="object-cover"
              priority
              sizes="100vw"
              quality={60}
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
          <div className="absolute inset-0 bg-black/65" />
        </div>
        <div className="relative z-10 text-center space-y-4 px-4 max-w-3xl">
          <Badge variant="outline" className="text-white border-white/30 px-4 py-1">
            Dokumentasi Lembaga
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
            Galeri Kegiatan
          </h1>
          <p className="text-lg text-gray-300">
            Jejak kenangan dan cerita inspiratif setiap momen berharga santri.
          </p>
          <Button
            size="lg"
            className="rounded-full px-8"
            onClick={() =>
              document.getElementById('gallery-grid')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Jelajahi Momen
          </Button>
        </div>
      </section>

      {/* ── Grid ── */}
      <section id="gallery-grid" className="container mx-auto px-4 py-12">
        {/* Filter */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {[{ id: null, nama: 'Semua' }, ...kategori].map((cat) => (
            <button
              key={cat.id ?? '__all__'}
              onClick={() => setActiveKategoriId(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeKategoriId === cat.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:border-primary'
              }`}
            >
              {cat.nama}
            </button>
          ))}
        </div>

        {galeri.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
            <IconPhoto size={40} strokeWidth={1.2} />
            <p className="text-base">Belum ada foto di kategori ini.</p>
          </div>
        ) : (
          /**
           * CSS Grid auto-rows masonry alternative.
           * grid-rows-[masonry] is still experimental; instead we use a
           * multi-column grid where tall images span 2 rows via row-span-2.
           * Row height = 200px → portrait cards ≈ 400px, landscape ≈ 200px.
           */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] gap-3">
            {galeri.map((img, i) => (
              <GalleryCardMemo key={img.id} img={img} priority={i < 8} onClick={setSelectedImage} />
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="flex justify-center mt-10 min-h-[60px]">
          {loadingMore && <LoadMoreSpinner />}
        </div>
      </section>

      {/* ── Lightbox ── */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent
          className="
      p-0 gap-0 overflow-hidden
      mx-4 sm:mx-auto
      w-[calc(100%-2rem)] sm:w-full sm:max-w-4xl
      max-h-[88dvh]
      rounded-2xl border border-border/60
      bg-card shadow-2xl
      flex flex-col
    "
          showCloseButton={false}
        >
          {selectedImage && (
            <>
              {/* Preload prev/next – warms browser cache sebelum diklik */}
              {currentIndex > 0 && (
                <link rel="preload" as="image" href={galeri[currentIndex - 1].image_url} />
              )}
              {currentIndex < galeri.length - 1 && (
                <link rel="preload" as="image" href={galeri[currentIndex + 1].image_url} />
              )}

              {/* Image */}
              <div className="relative w-full bg-black overflow-hidden">
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[16/8]">
                  <Image
                    key={selectedImage.image_url}
                    src={selectedImage.image_url}
                    alt={selectedImage.judul ?? 'Preview'}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 95vw, 80vw"
                    priority
                    quality={85}
                  />
                </div>

                <DialogClose asChild>
                  <button className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors">
                    <IconX size={15} />
                  </button>
                </DialogClose>

                {currentIndex > 0 && (
                  <button
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/65 text-white transition-colors"
                    aria-label="Foto sebelumnya"
                  >
                    <IconChevronLeft size={18} />
                  </button>
                )}
                {currentIndex < galeri.length - 1 && (
                  <button
                    onClick={goNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/65 text-white transition-colors"
                    aria-label="Foto berikutnya"
                  >
                    <IconChevronRight size={18} />
                  </button>
                )}

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-black/50 text-white/70 text-xs tabular-nums select-none">
                  {currentIndex + 1} / {galeri.length}
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col px-5 py-4 gap-3">
                {selectedImage.judul ? (
                  <h3 className="font-semibold text-base text-foreground leading-snug line-clamp-2">
                    {selectedImage.judul}
                  </h3>
                ) : (
                  <p className="text-muted-foreground text-sm italic">Tanpa judul</p>
                )}

                {selectedImage.deskripsi && (
                  <ScrollArea className="max-h-20">
                    <p className="text-muted-foreground text-sm leading-relaxed pr-2">
                      {selectedImage.deskripsi}
                    </p>
                  </ScrollArea>
                )}

                <Separator />

                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <IconCalendar size={13} />
                    {new Date(selectedImage.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full gap-1.5 h-8 px-4 text-xs"
                      onClick={handleShare}
                    >
                      <IconShare3 size={13} />
                      Bagikan
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-full gap-1.5 h-8 px-4 text-xs"
                      onClick={handleDownload}
                    >
                      <IconDownload size={13} />
                      Unduh
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
