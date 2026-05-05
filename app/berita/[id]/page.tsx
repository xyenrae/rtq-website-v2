'use client'

import { Suspense, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import {
  IconEye,
  IconCalendar,
  IconChevronLeft,
  IconClock,
  IconAlertTriangle,
  IconArrowRight,
} from '@tabler/icons-react'

import { useKategori } from '@/hooks/santri/berita/useBeritaKategori'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import CardRelatedBerita from '@/components/card/CardRelatedBerita'
import ShareDropdown from '@/components/ShareDropdown'

interface Berita {
  id: string
  judul: string
  created_at: string
  konten: string
  views: number
  gambar?: string
  kategori_id: string
  ringkasan?: string
  waktu_baca: number
  kategori?: { nama: string }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
  }).format(date)
}

const estimateReadTime = (content: string): number => {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

function BeritaDetailContent() {
  const params = useParams()
  const id = params?.id as string

  const [beritaDetail, setBeritaDetail] = useState<Berita | null>(null)
  const [latestBerita, setLatestBerita] = useState<Berita[]>([])
  const [relatedBerita, setRelatedBerita] = useState<Berita[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const { kategori } = useKategori()

  useEffect(() => {
    if (!id) return

    const fetchAllData = async () => {
      try {
        const [detailRes, latestRes] = await Promise.all([
          supabase.from('berita').select('*').eq('id', id).single(),
          supabase.from('berita').select('*').order('created_at', { ascending: false }).limit(5),
        ])

        if (detailRes.error) throw detailRes.error

        setBeritaDetail(detailRes.data)
        setLatestBerita(latestRes.data || [])

        if (detailRes.data?.kategori_id) {
          const relatedRes = await supabase
            .from('berita')
            .select('*, kategori:berita_kategori(nama)')
            .eq('kategori_id', detailRes.data.kategori_id)
            .neq('id', id)
            .limit(3)

          setRelatedBerita(relatedRes.data || [])
        }

        const { data: newViews } = await supabase.rpc('increment_views', {
          row_id: id,
        })

        if (newViews) {
          setBeritaDetail((prev) => (prev ? { ...prev, views: newViews } : prev))
        }
      } catch (err) {
        console.error(err)
        setError('Berita tidak ditemukan atau terjadi kesalahan.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllData()
  }, [id, supabase])

  if (isLoading) return <SkeletonLoader />
  if (error) return <ErrorMessage message={error} />
  if (!beritaDetail) return null

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" size="sm" asChild className="gap-2 group">
            <Link href="/berita">
              <IconChevronLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Kembali
            </Link>
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-12 gap-8 lg:gap-12">
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <header className="space-y-6 mb-8">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1">
                    {kategori.find((k) => k.id === beritaDetail.kategori_id)?.nama || 'Umum'}
                  </Badge>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <IconCalendar size={16} /> {formatDate(beritaDetail.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <IconClock size={16} /> {estimateReadTime(beritaDetail.konten)} min read
                    </span>
                    <span className="flex items-center gap-1">
                      <IconEye size={16} /> {beritaDetail.views} views
                    </span>
                  </div>
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                  {beritaDetail.judul}
                </h1>
              </header>

              {beritaDetail.gambar && (
                <div className="relative aspect-video rounded-3xl overflow-hidden mb-10 shadow-2xl shadow-primary/5">
                  <Image
                    src={beritaDetail.gambar}
                    alt={beritaDetail.judul}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              <div className="prose prose-emerald dark:prose-invert max-w-none">
                {beritaDetail.konten.split('\n').map(
                  (para, i) =>
                    para && (
                      <p key={i} className="text-lg leading-relaxed text-muted-foreground mb-6">
                        {para}
                      </p>
                    )
                )}
              </div>

              <Separator className="my-10" />

              <div className="flex flex-col sm:flex-row justify-between items-center gap-6 p-6 rounded-2xl bg-muted/30 border">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-full border-2 border-primary overflow-hidden">
                    <Image src="/images/logo-rtq.png" alt="Admin" fill className="object-cover" />
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Ditulis oleh</p>
                    <h4 className="font-bold text-lg">Admin RTQ Al-Hikmah</h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium mr-2 hidden sm:inline">Bagikan:</span>
                  <ShareDropdown title={beritaDetail.judul} />
                </div>
              </div>
            </motion.article>
          </div>

          <aside className="col-span-12 lg:col-span-4 space-y-10">
            <section className="sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-6 bg-accent rounded-full" />
                <h2 className="text-xl font-bold">Warta Terbaru</h2>
              </div>

              <div className="grid gap-6">
                {latestBerita.map((item) => (
                  <Link key={item.id} href={`/berita/${item.id}`} className="group block">
                    <Card className="border-none bg-transparent shadow-none hover:bg-muted/50 transition-colors rounded-xl p-2 -m-2">
                      <div className="flex gap-4">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={item.gambar || '/placeholder.jpg'}
                            alt={item.judul}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="space-y-1">
                          <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                            {item.judul}
                          </h3>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Berita Terkait</h2>

            <Button variant="link" asChild className="text-primary gap-1">
              <Link href="/berita">
                Lihat Semua <IconArrowRight size={16} />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedBerita.length > 0 ? (
              relatedBerita.map((item) => <CardRelatedBerita key={item.id} item={item} />)
            ) : (
              <p className="text-muted-foreground italic col-span-full">
                Belum ada berita terkait untuk kategori ini.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default function BeritaDetailPage() {
  return (
    <Suspense fallback={<SkeletonLoader />}>
      <BeritaDetailContent />
    </Suspense>
  )
}

const SkeletonLoader = () => (
  <div className="container mx-auto px-4 py-24 space-y-8">
    <div className="grid lg:grid-cols-12 gap-12">
      <div className="lg:col-span-8 space-y-6">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="aspect-video w-full rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <Skeleton className="h-6 w-32" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="w-20 h-20 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <Card className="max-w-md w-full p-8 text-center border-destructive/20 bg-destructive/5">
      <IconAlertTriangle size={48} className="mx-auto text-destructive mb-4" />
      <h3 className="text-xl font-bold mb-2 text-foreground">{message}</h3>
      <p className="text-muted-foreground mb-6">
        Mungkin berita telah dihapus atau link tidak valid.
      </p>

      <div className="flex gap-3 justify-center">
        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>

        <Button variant="outline" asChild>
          <Link href="/berita">Ke Berita</Link>
        </Button>
      </div>
    </Card>
  </div>
)
