'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  IconUsers,
  IconUserPlus,
  IconBook,
  IconRefresh,
  IconTrash,
  IconEdit,
  IconSearch,
  IconChevronDown,
  IconChevronUp,
  IconX,
  IconCheck,
  IconAlertTriangle,
  IconEye,
  IconBookmark,
  IconTrendingUp,
} from '@tabler/icons-react'
import {
  fetchSantriList,
  fetchMonitoringStats,
  fetchRiwayatRekomendasi,
  insertSantri,
  updateSantri,
  deleteSantri,
  reklasifikasiSantri,
} from '@/lib/monitoring-santri'
import type { SantriDenganRekomendasi, SantriFormData, MonitoringStats } from '@/lib/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const JILID_LABELS = ['Jilid 0', 'Jilid 1', 'Jilid 2', 'Jilid 3', 'Jilid 4', 'Jilid 5', 'Jilid 6']

type SortField = 'nama' | 'jilid_saat_ini' | 'status_rekomendasi' | 'created_at'

type DurasiKey =
  | 'durasi_jilid_0'
  | 'durasi_jilid_1'
  | 'durasi_jilid_2'
  | 'durasi_jilid_3'
  | 'durasi_jilid_4'
  | 'durasi_jilid_5'
  | 'durasi_jilid_6'

const DURASI_KEYS: DurasiKey[] = [
  'durasi_jilid_0',
  'durasi_jilid_1',
  'durasi_jilid_2',
  'durasi_jilid_3',
  'durasi_jilid_4',
  'durasi_jilid_5',
  'durasi_jilid_6',
]

const EMPTY_FORM: SantriFormData = {
  nama: '',
  tanggal_lahir: '',
  alamat: '',
  jenis_kelamin: 'L',
  jilid_saat_ini: 1,
  total_pengulangan_taskih: 0,
  durasi_jilid_0: '',
  durasi_jilid_1: '',
  durasi_jilid_2: '',
  durasi_jilid_3: '',
  durasi_jilid_4: '',
  durasi_jilid_5: '',
  durasi_jilid_6: '',
}

function santriToForm(s: SantriDenganRekomendasi): SantriFormData {
  return {
    nama: s.nama,
    tanggal_lahir: s.tanggal_lahir ?? '',
    alamat: s.alamat ?? '',
    jenis_kelamin: s.jenis_kelamin ?? 'L',
    jilid_saat_ini: s.jilid_saat_ini,
    total_pengulangan_taskih: s.total_pengulangan_taskih,
    durasi_jilid_0: s.durasi_jilid_0?.toString() ?? '',
    durasi_jilid_1: s.durasi_jilid_1?.toString() ?? '',
    durasi_jilid_2: s.durasi_jilid_2?.toString() ?? '',
    durasi_jilid_3: s.durasi_jilid_3?.toString() ?? '',
    durasi_jilid_4: s.durasi_jilid_4?.toString() ?? '',
    durasi_jilid_5: s.durasi_jilid_5?.toString() ?? '',
    durasi_jilid_6: s.durasi_jilid_6?.toString() ?? '',
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'BBK' | 'TBBK' | null }) {
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

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number | string
  icon: React.ComponentType<{ size?: number; className?: string }>
  color: string
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  )
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

function SantriForm({
  initial,
  onClose,
  onSaved,
}: {
  initial?: SantriDenganRekomendasi | null
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!initial
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<SantriFormData>(initial ? santriToForm(initial) : EMPTY_FORM)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nama.trim()) {
      toast.error('Nama santri wajib diisi')
      return
    }

    setLoading(true)
    try {
      if (isEdit) {
        const { klasifikasi } = await updateSantri(initial!.id, form)
        toast.success(`Data diperbarui. Status: ${klasifikasi.status}`, {
          description: 'Klasifikasi ulang telah dijalankan.',
        })
      } else {
        const { klasifikasi } = await insertSantri(form)
        toast.success(`Santri ditambahkan. Status: ${klasifikasi.status}`, {
          description: 'Klasifikasi otomatis berhasil dijalankan.',
        })
      }
      onSaved()
      onClose()
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const jilid = Number(form.jilid_saat_ini)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {isEdit ? (
                <IconEdit size={18} className="text-primary" />
              ) : (
                <IconUserPlus size={18} className="text-primary" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-foreground">
                {isEdit ? 'Edit Data Santri' : 'Tambah Santri Baru'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Klasifikasi BBK/TBBK otomatis setelah disimpan
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <IconX size={16} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Identitas */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-primary/10 text-primary text-xs rounded-full flex items-center justify-center font-bold">
                1
              </span>
              Identitas Santri
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  name="tanggal_lahir"
                  value={form.tanggal_lahir}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Jenis Kelamin
                </label>
                <select
                  name="jenis_kelamin"
                  value={form.jenis_kelamin}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Alamat
                </label>
                <textarea
                  name="alamat"
                  value={form.alamat}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Alamat tinggal santri"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none"
                />
              </div>
            </div>
          </section>

          {/* Capaian */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-primary/10 text-primary text-xs rounded-full flex items-center justify-center font-bold">
                2
              </span>
              Capaian Pembelajaran
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Jilid Saat Ini <span className="text-red-500">*</span>
                </label>
                <select
                  name="jilid_saat_ini"
                  value={form.jilid_saat_ini}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((j) => (
                    <option key={j} value={j}>
                      {j === 7 ? 'Al-Quran' : `Jilid ${j}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Total Pengulangan Taskih
                </label>
                <input
                  type="number"
                  name="total_pengulangan_taskih"
                  value={form.total_pengulangan_taskih}
                  onChange={handleChange}
                  min={0}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </div>
            </div>
          </section>

          {/* Durasi per Jilid */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
              <span className="w-5 h-5 bg-primary/10 text-primary text-xs rounded-full flex items-center justify-center font-bold">
                3
              </span>
              Durasi Penyelesaian per Jilid (bulan)
            </h3>
            <p className="text-xs text-muted-foreground mb-3 ml-7">
              Isi durasi jilid yang sudah diselesaikan. Kosongkan jika belum selesai.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[0, 1, 2, 3, 4, 5, 6].map((j) => {
                const fieldKey = `durasi_jilid_${j}` as keyof SantriFormData
                const isCompleted = j < jilid
                return (
                  <div key={j}>
                    <label
                      className={`text-xs font-medium mb-1.5 block ${
                        isCompleted ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {JILID_LABELS[j]}
                      {isCompleted && <span className="ml-1 text-primary text-[10px]">✓</span>}
                    </label>
                    <input
                      type="number"
                      name={fieldKey}
                      value={form[fieldKey]}
                      onChange={handleChange}
                      min={0}
                      step={0.5}
                      placeholder="—"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                    />
                  </div>
                )
              })}
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <IconRefresh size={14} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <IconCheck size={14} />
                  Simpan & Klasifikasi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
  santri,
  onClose,
}: {
  santri: SantriDenganRekomendasi
  onClose: () => void
}) {
  type RiwayatItem = {
    status: 'BBK' | 'TBBK'
    classified_at: string
    probabilitas: number
  }
  const [riwayat, setRiwayat] = useState<RiwayatItem[]>([])
  useEffect(() => {
    fetchRiwayatRekomendasi(santri.id)
      .then((data) => setRiwayat((data as RiwayatItem[]).slice(0, 5)))
      .catch(() => {})
  }, [santri.id])

  const durations = DURASI_KEYS.map((key, index) => ({
    label: `Jilid ${index}`,
    value: santri[key],
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
              {santri.nama.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-sm">{santri.nama}</h2>
              <p className="text-xs text-muted-foreground">
                Jilid {santri.jilid_saat_ini} •{' '}
                {santri.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={santri.status_rekomendasi} />
            <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg">
              <IconX size={15} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Grid durasi */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Durasi per Jilid
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {durations.map(({ label, value }) => (
                <div
                  key={label}
                  className={`rounded-lg p-2.5 text-center border ${
                    value !== null ? 'border-primary/20 bg-primary/5' : 'border-border bg-muted/50'
                  }`}
                >
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                  <p
                    className={`text-sm font-semibold mt-0.5 ${value !== null ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    {value !== null ? `${value} bln` : '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Taskih */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
            <span className="text-sm text-muted-foreground">Total Pengulangan Taskih</span>
            <span className="font-semibold text-foreground">
              {santri.total_pengulangan_taskih}x
            </span>
          </div>

          {/* Alasan */}
          {santri.alasan_rekomendasi && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Alasan Keputusan
              </h3>
              <pre className="text-xs text-foreground/80 bg-muted/40 rounded-lg p-3 whitespace-pre-wrap font-mono leading-relaxed">
                {santri.alasan_rekomendasi}
              </pre>
            </div>
          )}

          {/* Riwayat klasifikasi */}
          {riwayat.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Riwayat Klasifikasi
              </h3>
              <div className="space-y-1.5">
                {riwayat.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/30 border border-border"
                  >
                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.status as 'BBK' | 'TBBK'} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.classified_at as string).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {Math.round((r.probabilitas as number) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MonitoringSantriPage() {
  const [santriList, setSantriList] = useState<SantriDenganRekomendasi[]>([])
  const [stats, setStats] = useState<MonitoringStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterJilid, setFilterJilid] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editSantri, setEditSantri] = useState<SantriDenganRekomendasi | null>(null)
  const [detailSantri, setDetailSantri] = useState<SantriDenganRekomendasi | null>(null)
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [list, statsData] = await Promise.all([fetchSantriList(), fetchMonitoringStats()])
      setSantriList(list)
      setStats(statsData)
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleDelete(id: string, nama: string) {
    if (!confirm(`Yakin hapus santri "${nama}"?`)) return
    try {
      await deleteSantri(id)
      toast.success(`Santri "${nama}" dihapus`)
      loadData()
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Gagal menghapus')
    }
  }

  async function handleReklasifikasi(id: string) {
    try {
      const hasil = await reklasifikasiSantri(id)
      toast.success(`Reklasifikasi selesai: ${hasil.status}`)
      loadData()
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Gagal reklasifikasi')
    }
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const filtered = santriList
    .filter((s) => {
      const matchSearch = s.nama.toLowerCase().includes(search.toLowerCase())
      const matchJilid = filterJilid === '' || s.jilid_saat_ini === Number(filterJilid)
      return matchSearch && matchJilid
    })
    .sort((a, b) => {
      const valA = a[sortField as keyof SantriDenganRekomendasi]
      const valB = b[sortField as keyof SantriDenganRekomendasi]
      const cmp = String(valA ?? '').localeCompare(String(valB ?? ''))
      return sortDir === 'asc' ? cmp : -cmp
    })

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field)
      return <IconChevronDown size={12} className="text-muted-foreground opacity-40" />
    return sortDir === 'asc' ? (
      <IconChevronUp size={12} className="text-primary" />
    ) : (
      <IconChevronDown size={12} className="text-primary" />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <IconUsers size={24} className="text-primary" />
              Monitoring Santri
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola data santri dan klasifikasi BBK/TBBK otomatis
            </p>
          </div>
          <button
            onClick={() => {
              setEditSantri(null)
              setShowForm(true)
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
          >
            <IconUserPlus size={16} />
            Tambah Santri
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Santri"
              value={stats.total_santri}
              icon={IconUsers}
              color="bg-primary"
            />
            <StatCard
              label="BBK"
              value={stats.bbk_count}
              icon={IconAlertTriangle}
              color="bg-red-500"
            />
            <StatCard
              label="TBBK"
              value={stats.tbbk_count}
              icon={IconCheck}
              color="bg-emerald-500"
            />
            <StatCard
              label="Rata-rata Durasi"
              value={`${stats.rata_rata_durasi} bln`}
              icon={IconTrendingUp}
              color="bg-amber-500"
            />
          </div>
        )}

        {/* Filters */}
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
          <select
            value={filterJilid}
            onChange={(e) => setFilterJilid(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm min-w-[140px]"
          >
            <option value="">Semua Jilid</option>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((j) => (
              <option key={j} value={j}>
                {j === 7 ? 'Al-Quran' : `Jilid ${j}`}
              </option>
            ))}
          </select>
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
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('nama')}
                  >
                    <span className="flex items-center gap-1">
                      Nama <SortIcon field="nama" />
                    </span>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('jilid_saat_ini')}
                  >
                    <span className="flex items-center gap-1">
                      Jilid <SortIcon field="jilid_saat_ini" />
                    </span>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Taskih
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort('status_rekomendasi')}
                  >
                    <span className="flex items-center gap-1">
                      Status <SortIcon field="status_rekomendasi" />
                    </span>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Probabilitas
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-muted animate-pulse rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <IconBook size={32} className="text-muted-foreground/40" />
                        <p className="text-muted-foreground text-sm">
                          {search ? 'Tidak ada santri yang cocok' : 'Belum ada data santri'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((santri, idx) => (
                    <tr key={santri.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-4 py-3 text-muted-foreground text-xs">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                            {santri.nama.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{santri.nama}</p>
                            <p className="text-xs text-muted-foreground">
                              {santri.jenis_kelamin === 'L'
                                ? 'Laki-laki'
                                : santri.jenis_kelamin === 'P'
                                  ? 'Perempuan'
                                  : '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                          <IconBookmark size={10} />
                          {santri.jilid_saat_ini === 7
                            ? 'Al-Quran'
                            : `Jilid ${santri.jilid_saat_ini}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground text-sm font-medium">
                        {santri.total_pengulangan_taskih}x
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={santri.status_rekomendasi} />
                      </td>
                      <td className="px-4 py-3">
                        {santri.probabilitas !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  santri.status_rekomendasi === 'BBK'
                                    ? 'bg-red-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{
                                  width: `${Math.round((santri.probabilitas ?? 0) * 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {Math.round((santri.probabilitas ?? 0) * 100)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setDetailSantri(santri)}
                            className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                            title="Lihat detail"
                          >
                            <IconEye size={15} />
                          </button>
                          <button
                            onClick={() => {
                              setEditSantri(santri)
                              setShowForm(true)
                            }}
                            className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit"
                          >
                            <IconEdit size={15} />
                          </button>
                          <button
                            onClick={() => handleReklasifikasi(santri.id)}
                            className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors"
                            title="Klasifikasi ulang"
                          >
                            <IconRefresh size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(santri.id, santri.nama)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                            title="Hapus"
                          >
                            <IconTrash size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Menampilkan {filtered.length} dari {santriList.length} santri
            </p>
            {filtered.length !== santriList.length && (
              <button
                onClick={() => {
                  setSearch('')
                  setFilterJilid('')
                }}
                className="text-xs text-primary hover:underline"
              >
                Reset filter
              </button>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <SantriForm
          initial={editSantri}
          onClose={() => {
            setShowForm(false)
            setEditSantri(null)
          }}
          onSaved={loadData}
        />
      )}
      {detailSantri && <DetailModal santri={detailSantri} onClose={() => setDetailSantri(null)} />}
    </div>
  )
}
