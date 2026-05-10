'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Users, Newspaper, Eye } from 'lucide-react'
import { getDashboardStats, type DashboardStats } from '@/lib/dashboard'
import { StatsCardsSkeleton } from '@/components/skeleton/DashboardSkeletons'

interface StatCard {
  label: string
  value: number
  description: string
  icon: React.ElementType
  colorClass: string
  bgClass: string
}

function buildCards(stats: DashboardStats): StatCard[] {
  return [
    {
      label: 'Total Santri',
      value: stats.totalSantri,
      description: 'Santri terdaftar',
      icon: BookOpen,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      label: 'Total Guru',
      value: stats.totalGuru,
      description: 'Tenaga pengajar',
      icon: Users,
      colorClass: 'text-sky-600 dark:text-sky-400',
      bgClass: 'bg-sky-50 dark:bg-sky-950/40',
    },
    {
      label: 'Berita Terbit',
      value: stats.totalBeritaPublished,
      description: 'Artikel dipublikasi',
      icon: Newspaper,
      colorClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    },
    {
      label: 'Visitor Hari Ini',
      value: stats.visitorHariIni,
      description: 'Pengunjung unik',
      icon: Eye,
      colorClass: 'text-violet-600 dark:text-violet-400',
      bgClass: 'bg-violet-50 dark:bg-violet-950/40',
    },
  ]
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toString()
}

export function DashboardStatsCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    getDashboardStats().then(setStats)
  }, [])

  if (!stats) return <StatsCardsSkeleton />

  const cards = buildCards(stats)

  return (
    <div className="grid grid-cols-2 gap-3 px-4 lg:grid-cols-4 lg:gap-4 lg:px-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="group relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md lg:p-5"
          >
            {/* decorative blob */}
            <div
              className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-10 blur-xl transition-all duration-500 group-hover:opacity-20"
              style={{ background: 'hsl(var(--primary))' }}
            />

            <div className="flex items-start justify-between">
              <p className="text-xs font-medium text-muted-foreground lg:text-sm">{card.label}</p>
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bgClass}`}
              >
                <Icon className={`h-4 w-4 ${card.colorClass}`} />
              </span>
            </div>

            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
              {formatNumber(card.value)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{card.description}</p>
          </div>
        )
      })}
    </div>
  )
}
