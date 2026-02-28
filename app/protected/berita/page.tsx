'use client'

import { useState } from 'react'
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconClock,
  IconCalendar,
  IconNews,
  IconTrendingUp,
  IconBookmark,
  IconChartBar,
} from '@tabler/icons-react'
import { DataTable, type ColumnDef, type DataTableFilter } from '@/components/data-table'

// ─── Types ────────────────────────────────────────────────────────────────────

type Kategori = 'Pendidikan' | 'Kegiatan' | 'Pengumuman' | 'Artikel'
type Status = 'published' | 'draft'

interface Berita {
  id: number
  judul: string
  kategori: Kategori
  tanggalDibuat: string
  views: number
  waktuBaca: number
  status: Status
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const INITIAL_DATA: Berita[] = [
  {
    id: 1,
    judul: 'Workshop Pengembangan Diri untuk Santri',
    kategori: 'Pendidikan',
    tanggalDibuat: '2025-02-20',
    views: 11,
    waktuBaca: 2,
    status: 'published',
  },
  {
    id: 2,
    judul: 'Kegiatan Bakti Sosial di Lingkungan Sekitar',
    kategori: 'Kegiatan',
    tanggalDibuat: '2025-02-20',
    views: 33,
    waktuBaca: 2,
    status: 'published',
  },
  {
    id: 3,
    judul: 'Pengumuman Penerimaan Santri Baru 2025',
    kategori: 'Pengumuman',
    tanggalDibuat: '2025-02-20',
    views: 6,
    waktuBaca: 2,
    status: 'published',
  },
  {
    id: 4,
    judul: 'Artikel Inspiratif: Menggapai Ilmu dengan Iman',
    kategori: 'Artikel',
    tanggalDibuat: '2025-02-20',
    views: 5,
    waktuBaca: 2,
    status: 'draft',
  },
  {
    id: 5,
    judul: 'Seminar Kesehatan Rohani dan Jasmani',
    kategori: 'Kegiatan',
    tanggalDibuat: '2025-02-20',
    views: 14,
    waktuBaca: 2,
    status: 'published',
  },
  {
    id: 6,
    judul: "Pelatihan Intensif Tahfidz Al-Qur'an",
    kategori: 'Pendidikan',
    tanggalDibuat: '2025-02-20',
    views: 3,
    waktuBaca: 2,
    status: 'published',
  },
  {
    id: 7,
    judul: 'Peringatan HUT RTQ Alhikmah ke-10',
    kategori: 'Pengumuman',
    tanggalDibuat: '2025-02-20',
    views: 8,
    waktuBaca: 2,
    status: 'published',
  },
  {
    id: 8,
    judul: 'Kajian Rutin Tafsir Quran Setiap Minggu',
    kategori: 'Kegiatan',
    tanggalDibuat: '2025-02-18',
    views: 22,
    waktuBaca: 3,
    status: 'published',
  },
  {
    id: 9,
    judul: 'Program Beasiswa Santri Berprestasi 2025',
    kategori: 'Pengumuman',
    tanggalDibuat: '2025-02-15',
    views: 47,
    waktuBaca: 4,
    status: 'published',
  },
  {
    id: 10,
    judul: 'Tips Menghafal Al-Quran dengan Metode Efektif',
    kategori: 'Artikel',
    tanggalDibuat: '2025-02-10',
    views: 89,
    waktuBaca: 5,
    status: 'published',
  },
  {
    id: 11,
    judul: 'Peresmian Gedung Asrama Baru',
    kategori: 'Kegiatan',
    tanggalDibuat: '2025-02-08',
    views: 31,
    waktuBaca: 2,
    status: 'draft',
  },
  {
    id: 12,
    judul: 'Pendaftaran Kelas Bahasa Arab Intermediate',
    kategori: 'Pendidikan',
    tanggalDibuat: '2025-02-05',
    views: 18,
    waktuBaca: 3,
    status: 'published',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const KATEGORI_STYLE: Record<Kategori, string> = {
  Pendidikan:
    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  Kegiatan:
    'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
  Pengumuman:
    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  Artikel:
    'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800',
}

const KATEGORI_DOT: Record<Kategori, string> = {
  Pendidikan: 'bg-emerald-500',
  Kegiatan: 'bg-sky-500',
  Pengumuman: 'bg-amber-500',
  Artikel: 'bg-violet-500',
}

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub: string
  accent: string
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

// ─── Modal Tambah ─────────────────────────────────────────────────────────────

function ModalTambah({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (b: Omit<Berita, 'id'>) => void
}) {
  const [form, setForm] = useState<{
    judul: string
    kategori: Kategori
    waktuBaca: number
    status: Status
  }>({
    judul: '',
    kategori: 'Pendidikan',
    waktuBaca: 2,
    status: 'published',
  })

  if (!open) return null

  const labelClass = 'block text-sm font-medium text-foreground mb-1.5'
  const inputClass =
    'w-full border border-input rounded-lg px-3.5 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-foreground mb-5">Tambah Berita Baru</h2>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Judul Berita</label>
            <input
              className={inputClass}
              placeholder="Masukkan judul berita..."
              value={form.judul}
              onChange={(e) => setForm((f) => ({ ...f, judul: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Kategori</label>
              <select
                className={inputClass}
                value={form.kategori}
                onChange={(e) => setForm((f) => ({ ...f, kategori: e.target.value as Kategori }))}
              >
                {(['Pendidikan', 'Kegiatan', 'Pengumuman', 'Artikel'] as Kategori[]).map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Waktu Baca (menit)</label>
              <input
                type="number"
                min={1}
                max={60}
                className={inputClass}
                value={form.waktuBaca}
                onChange={(e) => setForm((f) => ({ ...f, waktuBaca: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <div className="flex gap-2">
              {(['published', 'draft'] as Status[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, status: s }))}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    form.status === s
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-input hover:border-primary/40'
                  }`}
                >
                  {s === 'published' ? 'Published' : 'Draft'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => {
              if (!form.judul.trim()) return
              onSave({ ...form, tanggalDibuat: new Date().toISOString().split('T')[0], views: 0 })
              onClose()
              setForm({ judul: '', kategori: 'Pendidikan', waktuBaca: 2, status: 'published' })
            }}
            className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Simpan Berita
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BeritaPage() {
  const [data, setData] = useState<Berita[]>(INITIAL_DATA)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const totalViews = data.reduce((a, b) => a + b.views, 0)
  const publishedCount = data.filter((b) => b.status === 'published').length

  // ── Column definitions ────────────────────────────────────────────────────

  const columns: ColumnDef<Berita>[] = [
    {
      key: 'judul',
      header: 'Judul',
      sortable: true,
      cell: (row) => (
        <span className="font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
          {row.judul}
        </span>
      ),
    },
    {
      key: 'kategori',
      header: 'Kategori',
      cell: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${KATEGORI_STYLE[row.kategori]}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${KATEGORI_DOT[row.kategori]}`} />
          {row.kategori}
        </span>
      ),
    },
    {
      key: 'tanggalDibuat',
      header: 'Tanggal Dibuat',
      sortable: true,
      cell: (row) => (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <IconCalendar size={13} />
          {formatTanggal(row.tanggalDibuat)}
        </span>
      ),
    },
    {
      key: 'views',
      header: 'Views',
      sortable: true,
      cell: (row) => (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <IconEye size={13} />
          {row.views.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'waktuBaca',
      header: 'Waktu Baca',
      cell: (row) => (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <IconClock size={13} />
          {row.waktuBaca} menit
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            row.status === 'published'
              ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-secondary text-muted-foreground border-border'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${row.status === 'published' ? 'bg-emerald-500' : 'bg-muted-foreground'}`}
          />
          {row.status === 'published' ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Aksi',
      align: 'center',
      cell: (row) => (
        <div
          className="flex items-center justify-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
            title="Edit"
          >
            <IconEdit size={15} />
          </button>
          {confirmDeleteId === row.id ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setData((d) => d.filter((b) => b.id !== row.id))
                  setConfirmDeleteId(null)
                }}
                className="px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Ya
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-accent transition-colors"
              >
                Tidak
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDeleteId(row.id)}
              className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
              title="Hapus"
            >
              <IconTrash size={15} />
            </button>
          )}
        </div>
      ),
    },
  ]

  const tableFilters: DataTableFilter<Berita>[] = [
    {
      key: 'kategori',
      label: 'Kategori',
      options: [
        { label: 'Pendidikan', value: 'Pendidikan' },
        { label: 'Kegiatan', value: 'Kegiatan' },
        { label: 'Pengumuman', value: 'Pengumuman' },
        { label: 'Artikel', value: 'Artikel' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background p-6">
      {/* ── Header ── */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <IconNews size={18} className="text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Kelola Berita</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-11">
            Manajemen konten berita & artikel pesantren
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
        >
          <IconPlus size={17} />
          Tambah Baru
        </button>
      </div>

      <hr className='my-4'/>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<IconNews size={18} className="text-primary" />}
          label="Total Berita"
          value={data.length}
          sub="Semua kategori"
          accent="bg-primary/10"
        />
        <StatCard
          icon={<IconTrendingUp size={18} className="text-sky-600" />}
          label="Total Views"
          value={totalViews.toLocaleString()}
          sub="Akumulasi semua berita"
          accent="bg-sky-100 dark:bg-sky-950"
        />
        <StatCard
          icon={<IconBookmark size={18} className="text-emerald-600" />}
          label="Published"
          value={publishedCount}
          sub={`${data.length - publishedCount} draft tersisa`}
          accent="bg-emerald-100 dark:bg-emerald-950"
        />
        <StatCard
          icon={<IconChartBar size={18} className="text-violet-600" />}
          label="Rata-rata Views"
          value={data.length ? Math.round(totalViews / data.length) : 0}
          sub="Per artikel"
          accent="bg-violet-100 dark:bg-violet-950"
        />
      </div>

      {/* ── Table ── */}
      <DataTable<Berita>
        data={data}
        columns={columns}
        rowKey="id"
        pageSize={10}
        searchFields={['judul']}
        searchPlaceholder="Cari berita..."
        filters={tableFilters}
        selectable
        onBulkDelete={(keys) => setData((d) => d.filter((b) => !keys.includes(b.id)))}
        emptyMessage="Tidak ada berita ditemukan."
        toolbarExtra={
          <span className="text-xs text-muted-foreground">
            Total <span className="font-semibold text-foreground">{data.length}</span> berita
          </span>
        }
      />

      {/* ── Modal ── */}
      <ModalTambah
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(berita) =>
          setData((d) => [{ ...berita, id: Math.max(0, ...d.map((x) => x.id)) + 1 }, ...d])
        }
      />
    </div>
  )
}
