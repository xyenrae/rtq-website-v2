'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { IconArrowRight, IconEdit, IconNews } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { getKontenTerkini, type KontenTerkini } from '@/lib/dashboard'
import { TableSkeleton } from '@/components/skeleton/DashboardSkeletons'

// ─────────────────────────────────────────
// component
// ─────────────────────────────────────────

export function TableKontenTerkini() {
  const router = useRouter()
  const [data, setData] = useState<KontenTerkini[] | null>(null)

  useEffect(() => {
    // Data sudah berita semua dari server — tidak perlu filter di sini
    getKontenTerkini().then(setData)
  }, [])

  function handleEditClick(item: KontenTerkini) {
    router.push(`/protected/berita?edit=${item.id}`)
  }

  function handleViewAll() {
    router.push('/protected/berita')
  }

  if (!data) return <TableSkeleton />

  return (
    <Card className="border-border/60 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <IconNews size={16} className="text-primary shrink-0" />
              Aktivitas Publikasi
            </CardTitle>
            <CardDescription>Berita terbaru yang diunggah ke portal</CardDescription>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewAll}
            className="shrink-0 text-xs text-muted-foreground hover:text-primary hover:bg-muted gap-1.5"
          >
            Lihat semua
            <IconArrowRight size={13} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1">
        {!data.length ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 px-5">
            <IconNews size={28} className="text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Belum ada berita diunggah</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.map((item) => {
              const timeAgo = formatDistanceToNow(new Date(item.created_at), {
                addSuffix: true,
                locale: localeId,
              })

              return (
                <li
                  key={item.id}
                  className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
                >
                  {/* ikon */}
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <IconNews size={16} />
                  </span>

                  {/* info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.judul}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.kategori} &bull; {timeAgo}
                    </p>
                  </div>

                  {/* badge */}
                  <Badge
                    variant="outline"
                    className="shrink-0 rounded-full border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary"
                  >
                    Berita
                  </Badge>

                  {/* CTA edit */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(item)}
                    title={`Edit berita "${item.judul}"`}
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                  >
                    <IconEdit size={14} />
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>

      {!!data.length && (
        <CardFooter className="border-t border-border/60 px-5 py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewAll}
            className="w-full gap-2 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
          >
            Kelola semua berita di portal
            <IconArrowRight size={13} />
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
