'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Image as ImageIcon, Newspaper } from 'lucide-react'
import { getKontenTerkini, type KontenTerkini } from '@/lib/dashboard'
import { TableSkeleton } from '@/components/skeleton/DashboardSkeletons'
import { formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export function TableKontenTerkini() {
  const [data, setData] = useState<KontenTerkini[] | null>(null)

  useEffect(() => {
    getKontenTerkini().then(setData)
  }, [])

  if (!data) return <TableSkeleton />

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Aktivitas Publikasi</CardTitle>
        <CardDescription>Konten terbaru yang diunggah ke portal</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="flex h-40 items-center justify-center px-5">
            <p className="text-sm text-muted-foreground">Belum ada konten diunggah</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.map((item) => {
              const timeAgo = formatDistanceToNow(new Date(item.created_at), {
                addSuffix: true,
                locale: localeId,
              })
              const isBerita = item.tipe === 'berita'
              return (
                <li
                  key={`${item.tipe}-${item.id}`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
                >
                  {/* Ikon tipe */}
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isBerita
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                    }`}
                  >
                    {isBerita ? (
                      <Newspaper className="h-4 w-4" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                  </span>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.judul}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.kategori} · {timeAgo}
                    </p>
                  </div>

                  {/* Badge tipe */}
                  <Badge
                    variant="outline"
                    className={`shrink-0 text-xs ${
                      isBerita
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                        : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400'
                    }`}
                  >
                    {isBerita ? 'Berita' : 'Galeri'}
                  </Badge>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
