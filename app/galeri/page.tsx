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
import LoadMoreSpinner from '@/components/LoadMoreSpinner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

const INITIAL_LOAD_COUNT = 12
const LOAD_MORE_COUNT = 8

export default function GaleriPage() {
  const { galeri, loading: loadingGaleri } = useGaleri()
  const { kategori, loading: loadingKategori } = useGaleriKategori()
  const loading = loadingGaleri || loadingKategori

  const [activeKategoriId, setActiveKategoriId] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<GaleriImage | null>(null)
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD_COUNT)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const loadMoreRef = useRef<HTMLDivElement>(null)

  const filteredImages = useMemo<GaleriImage[]>(() => {
    if (!galeri.length) return []
    if (!activeKategoriId) return galeri
    return galeri.filter((img) => img.galeri_kategori_id === activeKategoriId)
  }, [galeri, activeKategoriId])

  const displayedImages = useMemo<GaleriImage[]>(
    () => filteredImages.slice(0, visibleCount),
    [filteredImages, visibleCount]
  )

  const hasMoreImages = visibleCount < filteredImages.length

  const currentIndex = useMemo(
    () => filteredImages.findIndex((img) => img.id === selectedImage?.id),
    [filteredImages, selectedImage]
  )

  const goNext = useCallback(() => {
    if (currentIndex < filteredImages.length - 1) {
      setSelectedImage(filteredImages[currentIndex + 1])
    }
  }, [currentIndex, filteredImages])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setSelectedImage(filteredImages[currentIndex - 1])
    }
  }, [currentIndex, filteredImages])

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMoreImages) return
    setIsLoadingMore(true)
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, filteredImages.length))
      setIsLoadingMore(false)
    }, 300)
  }, [isLoadingMore, hasMoreImages, filteredImages.length])

  useEffect(() => {
    if (loading || !hasMoreImages) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { threshold: 0.1, rootMargin: '300px' }
    )
    const el = loadMoreRef.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [loading, hasMoreImages, loadMore])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImage, goNext, goPrev])

  useEffect(() => {
    setVisibleCount(INITIAL_LOAD_COUNT)
  }, [activeKategoriId])

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
    const shareData = {
      title: selectedImage.judul ?? 'Foto Galeri',
      text: selectedImage.deskripsi ?? 'Lihat foto ini dari galeri kami.',
      url: selectedImage.image_url,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(selectedImage.image_url)
      toast.success('Link foto disalin ke clipboard')
    }
  }, [selectedImage])

  if (loading) return <SkeletonGaleri />

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
              unoptimized
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
        {/* Filter kategori */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button
            onClick={() => setActiveKategoriId(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeKategoriId === null
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-border hover:border-primary'
            }`}
          >
            Semua
          </button>
          {kategori.map((cat) => (
            <button
              key={cat.id}
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

        {displayedImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
            <IconPhoto size={40} strokeWidth={1.2} />
            <p className="text-base">Belum ada foto di kategori ini.</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {displayedImages.map((img) => (
              <div
                key={img.id}
                className="break-inside-avoid relative overflow-hidden rounded-xl cursor-pointer group bg-muted"
                style={{
                  aspectRatio: img.width && img.height ? `${img.width}/${img.height}` : '4/3',
                }}
                onClick={() => setSelectedImage(img)}
              >
                <Image
                  src={img.image_url}
                  alt={img.judul ?? 'Foto galeri'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  loading="lazy"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                {img.judul && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm font-medium line-clamp-2">{img.judul}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div ref={loadMoreRef} className="flex justify-center mt-10 min-h-[60px]">
          {isLoadingMore && <LoadMoreSpinner />}
        </div>
      </section>

      {/* ── Lightbox Dialog ── */}
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
          showCloseButton
        >
          {selectedImage && (
            <>
              {/* Image area */}
              <div className="relative w-full bg-black overflow-hidden">
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[16/8]">
                  <Image
                    src={selectedImage.image_url}
                    alt={selectedImage.judul ?? 'Preview'}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 95vw, 80vw"
                    priority
                    unoptimized
                  />
                </div>

                {/* Close */}
                <DialogClose asChild>
                  <button className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors">
                    <IconX size={15} />
                  </button>
                </DialogClose>

                {/* Prev */}
                {currentIndex > 0 && (
                  <button
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/65 text-white transition-colors"
                    aria-label="Foto sebelumnya"
                  >
                    <IconChevronLeft size={18} />
                  </button>
                )}

                {/* Next */}
                {currentIndex < filteredImages.length - 1 && (
                  <button
                    onClick={goNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/65 text-white transition-colors"
                    aria-label="Foto berikutnya"
                  >
                    <IconChevronRight size={18} />
                  </button>
                )}

                {/* Counter */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-black/50 text-white/70 text-xs tabular-nums select-none">
                  {currentIndex + 1} / {filteredImages.length}
                </div>
              </div>

              {/* Info area */}
              <div className="flex flex-col px-5 py-4 gap-3">
                {/* Judul */}
                {selectedImage.judul ? (
                  <h3 className="font-semibold text-base text-foreground leading-snug line-clamp-2">
                    {selectedImage.judul}
                  </h3>
                ) : (
                  <p className="text-muted-foreground text-sm italic">Tanpa judul</p>
                )}

                {/* Deskripsi */}
                {selectedImage.deskripsi && (
                  <ScrollArea className="max-h-20">
                    <p className="text-muted-foreground text-sm leading-relaxed pr-2">
                      {selectedImage.deskripsi}
                    </p>
                  </ScrollArea>
                )}

                <Separator />

                {/* Footer: tanggal + aksi */}
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
