'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  IconChartBar,
  IconRefresh,
  IconSearch,
  IconFilter,
  IconAlertTriangle,
  IconCheck,
  IconInfoCircle,
  IconX,
  IconDownload,
  IconBrain,
} from '@tabler/icons-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  fetchHasilRekomendasiList,
  fetchStatistikRekomendasi,
  reklasifikasiSemua,
} from '@/lib/hasil-rekomendasi'
import type { RekomendasiRow, StatistikRekomendasi } from '@/lib/hasil-rekomendasi'
import type { StatusRekomendasi } from '@/lib/types'

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: StatusRekomendasi | null }) {
  if (!status)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
        Belum
      </span>
    )
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        status === 'BBK'
          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      }`}
    >
      {status === 'BBK' ? <IconAlertTriangle size={10} /> : <IconCheck size={10} />}
      {status}
    </span>
  )
}

function AlasanModal({
  alasan,
  nama,
  onClose,
}: {
  alasan: string
  nama: string
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <IconBrain size={18} className="text-primary" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">Detail Keputusan</h3>
              <p className="text-xs text-muted-foreground">{nama}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg">
            <IconX size={15} className="text-muted-foreground" />
          </button>
        </div>
        <div className="p-5">
          <pre className="text-xs text-foreground/80 bg-muted/40 rounded-lg p-4 whitespace-pre-wrap font-mono leading-relaxed">
            {alasan}
          </pre>
        </div>
      </div>
    </div>
  )
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name: string; value: number; fill: string }[]
  label?: string
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.fill }} className="font-medium">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HasilRekomendasiPage() {
  const [data, setData] = useState<RekomendasiRow[]>([])
  const [statistik, setStatistik] = useState<StatistikRekomendasi | null>(null)
  const [loading, setLoading] = useState(true)
  const [reklasLoading, setReklasLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<StatusRekomendasi | ''>('')
  const [showAlasan, setShowAlasan] = useState<{ alasan: string; nama: string } | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [list, stats] = await Promise.all([
        fetchHasilRekomendasiList(),
        fetchStatistikRekomendasi(),
      ])
      setData(list)
      setStatistik(stats)
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Re-fetch saat filter berubah
  useEffect(() => {
    if (loading) return
    fetchHasilRekomendasiList({ status: filterStatus, search })
      .then(setData)
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, search])

  async function handleReklasifikasiSemua() {
    setReklasLoading(true)
    try {
      const { berhasil } = await reklasifikasiSemua()
      toast.success(`Reklasifikasi selesai: ${berhasil} santri berhasil diproses`)
      loadData()
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Gagal reklasifikasi')
    } finally {
      setReklasLoading(false)
    }
  }

  function handleExport() {
    const rows = [
      ['No', 'Nama', 'Jilid', 'Taskih', 'Status', 'Probabilitas', 'Tanggal Klasifikasi'],
      ...data.map((r, i) => {
        const durasis = [0, 1, 2, 3, 4, 5, 6]
          .map((j) => (r as Record<string, number | null>)[`durasi_jilid_${j}`])
          .filter((d): d is number => d !== null)
        const total = durasis.reduce((a, b) => a + b, 0)
        const rata = durasis.length > 0 ? (total / durasis.length).toFixed(1) : '0'
        return [
          i + 1,
          r.nama,
          r.jilid_saat_ini,
          r.total_pengulangan_taskih,
          r.status_rekomendasi ?? '-',
          r.probabilitas ? `${Math.round(r.probabilitas * 100)}%` : '-',
          r.classified_at ? new Date(r.classified_at).toLocaleDateString('id-ID') : '-',
          `Total: ${total.toFixed(1)} bln`,
          `Rata: ${rata} bln`,
        ]
      }),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rekomendasi-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Laporan berhasil diekspor')
  }

  const pieData = statistik
    ? [
        { name: 'BBK', value: statistik.bbk, color: '#ef4444' },
        { name: 'TBBK', value: statistik.tbbk, color: '#10b981' },
      ]
    : []

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <IconChartBar size={24} className="text-primary" />
              Hasil Rekomendasi
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Hasil klasifikasi BBK/TBBK seluruh santri oleh model Decision Tree
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <IconDownload size={15} />
              Ekspor CSV
            </button>
            <button
              onClick={handleReklasifikasiSemua}
              disabled={reklasLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {reklasLoading ? (
                <IconRefresh size={15} className="animate-spin" />
              ) : (
                <IconBrain size={15} />
              )}
              Jalankan Ulang Klasifikasi
            </button>
          </div>
        </div>

        {/* Charts */}
        {statistik && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Distribusi Status</h3>
              {statistik.total > 0 ? (
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend
                        formatter={(value) => (
                          <span className="text-xs text-foreground">{value}</span>
                        )}
                      />
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-3 w-full mt-2">
                    <div className="text-center p-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <p className="text-xl font-bold text-red-600">{statistik.bbk}</p>
                      <p className="text-xs text-muted-foreground">BBK</p>
                    </div>
                    <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                      <p className="text-xl font-bold text-emerald-600">{statistik.tbbk}</p>
                      <p className="text-xs text-muted-foreground">TBBK</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                  Belum ada data
                </div>
              )}
            </div>

            <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold text-foreground mb-4">Status per Jilid</h3>
              {statistik.perJilid.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={statistik.perJilid} barSize={16} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="jilid"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => (
                        <span className="text-xs text-foreground">{value}</span>
                      )}
                    />
                    <Bar dataKey="bbk" name="BBK" fill="#ef4444" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="tbbk" name="TBBK" fill="#10b981" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  Belum ada data statistik
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <IconSearch
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama santri..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <IconFilter size={15} className="text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as StatusRekomendasi | '')}
              className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm"
            >
              <option value="">Semua Status</option>
              <option value="BBK">BBK</option>
              <option value="TBBK">TBBK</option>
            </select>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <IconRefresh size={15} />
            Refresh
          </button>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    No
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Nama
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Jilid
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Total Durasi
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Rata-rata
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Taskih
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Klasifikasi
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Alasan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 9 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-muted animate-pulse rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <IconChartBar size={32} className="text-muted-foreground/40" />
                        <p className="text-muted-foreground text-sm">Belum ada data rekomendasi</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((row, idx) => {
                    const durasis = [0, 1, 2, 3, 4, 5, 6]
                      .map((j) => (row as Record<string, number | null>)[`durasi_jilid_${j}`])
                      .filter((d): d is number => d !== null)
                    const totalDurasi = durasis.reduce((a, b) => a + b, 0)
                    const rataDurasi = durasis.length > 0 ? totalDurasi / durasis.length : 0

                    return (
                      <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground text-xs">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {row.nama.charAt(0)}
                            </div>
                            <span className="font-medium text-foreground">{row.nama}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {row.jilid_saat_ini === 7 ? 'Al-Quran' : `Jilid ${row.jilid_saat_ini}`}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {totalDurasi.toFixed(1)} bln
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {rataDurasi > 0 ? `${rataDurasi.toFixed(1)} bln` : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          {row.total_pengulangan_taskih}x
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={row.status_rekomendasi} />
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {row.classified_at
                            ? new Date(row.classified_at).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {row.alasan_rekomendasi ? (
                            <button
                              onClick={() =>
                                setShowAlasan({ alasan: row.alasan_rekomendasi!, nama: row.nama })
                              }
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            >
                              <IconInfoCircle size={13} />
                              Lihat Alasan
                            </button>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">Menampilkan {data.length} santri</p>
          </div>
        </div>
      </div>

      {showAlasan && (
        <AlasanModal
          alasan={showAlasan.alasan}
          nama={showAlasan.nama}
          onClose={() => setShowAlasan(null)}
        />
      )}
    </div>
  )
}
