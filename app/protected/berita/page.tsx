'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  IconLoader2,
  IconAlertCircle,
  IconRefresh,
  IconChevronRight,
} from '@tabler/icons-react'
import { DataTable, type ColumnDef, type DataTableFilter } from '@/components/data-table'
import { ModalTambahBerita } from '@/components/protected/berita/modal-tambah-berita'
import { ModalEditBerita } from '@/components/protected/berita/modal-edit-berita'
import { ModalDeleteBerita } from '@/components/protected/berita/modal-delete-berita'
import {
  fetchBerita,
  deleteBerita,
  deleteBulkBerita,
  type Berita,
  type BeritaKategori,
} from '@/lib/berita'
import { toast } from 'sonner'
import { fetchKategori } from '@/lib/berita-kategori'

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  ctaLabel,
  onCtaClick,
  ctaVariant = 'ghost',
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub: string
  accent: string
  ctaLabel?: string
  onCtaClick?: () => void
  ctaVariant?: 'ghost' | 'outline' | 'default'
}) {
  const ctaStyles = {
    ghost: 'text-primary hover:bg-primary/10',
    outline: 'border border-input hover:bg-accent text-foreground',
    default: 'bg-primary text-primary-foreground hover:opacity-90',
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group">
      {/* ── Desktop Layout (1 Row) ── */}
      <div className="hidden sm:flex items-start gap-4">
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-bold text-foreground leading-tight break-words">{value}</p>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
        {ctaLabel && onCtaClick && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCtaClick()
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 mt-1 ${ctaStyles[ctaVariant]}`}
          >
            {ctaLabel}
            <IconChevronRight
              size={14}
              className="opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
            />
          </button>
        )}
      </div>

      {/* ── Mobile Layout (2 Rows) ── */}
      <div className="flex sm:hidden flex-col gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent}`}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide leading-tight">
              {label}
            </p>
            <p className="text-lg font-bold text-foreground leading-tight break-words">{value}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">{sub}</p>
          {ctaLabel && onCtaClick && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCtaClick()
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors shrink-0 ${ctaStyles[ctaVariant]}`}
            >
              {ctaLabel}
              <IconChevronRight size={12} className="opacity-70" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Category Colors ──────────────────────────────────────────────────────────

const DYNAMIC_COLORS = [
  { text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-600 dark:bg-blue-400' },
  { text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-600 dark:bg-emerald-400' },
  { text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-600 dark:bg-amber-400' },
  { text: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-600 dark:bg-violet-400' },
  { text: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-600 dark:bg-rose-400' },
  { text: 'text-cyan-600 dark:text-cyan-400', dot: 'bg-cyan-600 dark:bg-cyan-400' },
  { text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-600 dark:bg-orange-400' },
]

function getCategoryStyle(name: string) {
  if (!name) return DYNAMIC_COLORS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return DYNAMIC_COLORS[Math.abs(hash) % DYNAMIC_COLORS.length]
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BeritaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [data, setData] = useState<Berita[]>([])
  const [kategoris, setKategoris] = useState<BeritaKategori[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editBerita, setEditBerita] = useState<Berita | null>(null)
  const [deleteBeritaTarget, setDeleteBeritaTarget] = useState<Berita | null>(null)
  const [externalFilter, setExternalFilter] = useState<Record<string, string>>({})

  const handleManagePublished = () => {
    setExternalFilter({ status: 'draft' })
  }

  function handleUpdate(updated: Berita) {
    setData((d) => d.map((b) => (b.id === updated.id ? updated : b)))
  }

  function handleDeleted(id: string) {
    setData((d) => d.filter((b) => b.id !== id))
  }

  // ── Load data ──────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [beritaList, kategoriList] = await Promise.all([fetchBerita(), fetchKategori()])
      setData(beritaList)
      setKategoris(kategoriList)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ── Auto-open edit modal dari ?edit=<id> (CTA dari dashboard) ─────────────

  useEffect(() => {
    const editId = searchParams.get('edit')
    if (!editId || data.length === 0) return

    const target = data.find((b) => b.id === editId)
    if (!target) return

    setEditBerita(target)
    // Bersihkan param dari URL agar bisa trigger ulang di klik berikutnya
    router.replace('/protected/berita', { scroll: false })
  }, [searchParams, data, router])

  // ── Stats ──────────────────────────────────────────────────────────────────

  const totalViews = data.reduce((a, b) => a + b.views, 0)
  const publishedCount = data.filter((b) => b.status === 'published').length

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await deleteBerita(id)
      setData((d) => d.filter((b) => b.id !== id))
      setConfirmDeleteId(null)
      toast.success('Berita berhasil dihapus')
    } catch (e: unknown) {
      toast.error('Gagal menghapus berita', {
        description: e instanceof Error ? e.message : undefined,
      })
    } finally {
      setDeletingId(null)
    }
  }

  async function handleBulkDelete(keys: string[]) {
    try {
      await deleteBulkBerita(keys)
      setData((d) => d.filter((b) => !keys.includes(b.id)))
      toast.success(`${keys.length} berita berhasil dihapus`)
    } catch (e: unknown) {
      toast.error('Gagal menghapus beberapa berita', {
        description: e instanceof Error ? e.message : undefined,
      })
    }
  }

  function handleSave(berita: Berita) {
    setData((d) => [berita, ...d])
  }

  // ── Dynamic filter options ─────────────────────────────────────────────────

  const tableFilters: DataTableFilter<Berita>[] = [
    {
      key: 'kategori_id',
      label: 'Kategori',
      options: kategoris.map((k) => ({ label: k.nama, value: k.id })),
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

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns: ColumnDef<Berita>[] = [
    {
      key: 'judul',
      header: 'Judul',
      sortable: true,
      cell: (row) => (
        <div className="min-w-0">
          <span className="font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
            {row.judul}
          </span>
          {row.ringkasan && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{row.ringkasan}</p>
          )}
        </div>
      ),
    },
    {
      key: 'kategori_id',
      header: 'Kategori',
      cell: (row) => {
        const nama = row.berita_kategori?.nama ?? '-'
        const style = getCategoryStyle(nama)
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-secondary/50 border-border dark:bg-white/5 dark:border-white/10">
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            <span className={style.text}>{nama}</span>
          </span>
        )
      },
    },
    {
      key: 'created_at',
      header: 'Tanggal Dibuat',
      sortable: true,
      cell: (row) => (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground whitespace-nowrap">
          <IconCalendar size={13} />
          {formatTanggal(row.created_at)}
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
      key: 'waktu_baca',
      header: 'Waktu Baca',
      cell: (row) => (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground whitespace-nowrap">
          <IconClock size={13} />
          {row.waktu_baca} menit
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
            className={`w-1.5 h-1.5 rounded-full ${
              row.status === 'published' ? 'bg-emerald-500' : 'bg-muted-foreground'
            }`}
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
            onClick={() => setEditBerita(row)}
            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
            title="Edit"
          >
            <IconEdit size={15} />
          </button>

          {confirmDeleteId === row.id ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleDelete(row.id)}
                disabled={deletingId === row.id}
                className="px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-1"
              >
                {deletingId === row.id && <IconLoader2 size={11} className="animate-spin" />}
                Ya
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                disabled={deletingId === row.id}
                className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-60"
              >
                Tidak
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeleteBeritaTarget(row)}
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      {/* Header */}
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
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 border border-border text-foreground px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-accent transition-colors disabled:opacity-50"
          >
            <IconRefresh size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
          >
            <IconPlus size={17} />
            Tambah Baru
          </button>
        </div>
      </div>

      <hr className="my-4" />

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3">
          <IconAlertCircle size={18} className="shrink-0" />
          <span className="text-sm font-medium">{error}</span>
          <button onClick={loadData} className="ml-auto text-xs underline hover:no-underline">
            Coba lagi
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard
          icon={
            loading ? (
              <IconLoader2 size={18} className="text-primary animate-spin" />
            ) : (
              <IconNews size={18} className="text-primary" />
            )
          }
          label="Total Berita"
          value={loading ? '—' : data.length}
          sub="Semua kategori"
          accent="bg-primary/10"
        />
        <StatCard
          icon={<IconChartBar size={18} className="text-violet-600" />}
          label="Rata-rata Views"
          value={loading ? '—' : data.length ? Math.round(totalViews / data.length) : 0}
          sub="Per artikel"
          accent="bg-violet-100 dark:bg-violet-950"
        />
        <StatCard
          icon={<IconTrendingUp size={18} className="text-sky-600" />}
          label="Total Views"
          value={loading ? '—' : totalViews.toLocaleString()}
          sub="Akumulasi berita"
          accent="bg-sky-100 dark:bg-sky-950"
          ctaLabel="Analisis"
          onCtaClick={() => {}}
          ctaVariant="outline"
        />
        <StatCard
          icon={<IconBookmark size={18} className="text-emerald-600" />}
          label="Published"
          value={loading ? '—' : publishedCount}
          sub={loading ? '' : `${data.length - publishedCount} draft tersisa`}
          accent="bg-emerald-100 dark:bg-emerald-950"
          ctaLabel="Kelola"
          onCtaClick={handleManagePublished}
          ctaVariant="outline"
        />
      </div>

      {/* Table */}
      {loading && data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground gap-2">
          <IconLoader2 size={20} className="animate-spin" />
          <span className="text-sm">Memuat data...</span>
        </div>
      ) : (
        <DataTable<Berita>
          data={data}
          columns={columns}
          rowKey="id"
          pageSize={10}
          searchFields={['judul', 'ringkasan']}
          searchPlaceholder="Cari berita..."
          filters={tableFilters}
          selectable
          onBulkDelete={(keys) => handleBulkDelete(keys as string[])}
          emptyMessage="Tidak ada berita ditemukan."
          toolbarExtra={
            <span className="text-xs text-muted-foreground">
              Total <span className="font-semibold text-foreground">{data.length}</span> berita
            </span>
          }
          externalFilter={externalFilter}
        />
      )}

      {/* Modals */}
      <ModalTambahBerita
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        kategoris={kategoris}
      />

      {editBerita && (
        <ModalEditBerita
          open={!!editBerita}
          onClose={() => setEditBerita(null)}
          onUpdate={handleUpdate}
          berita={editBerita}
          kategoris={kategoris}
        />
      )}

      {deleteBeritaTarget && (
        <ModalDeleteBerita
          open={!!deleteBeritaTarget}
          onClose={() => setDeleteBeritaTarget(null)}
          onDeleted={handleDeleted}
          berita={deleteBeritaTarget}
        />
      )}
    </div>
  )
}
