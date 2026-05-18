'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconPhoto,
  IconLoader2,
  IconAlertCircle,
  IconRefresh,
  IconChevronRight,
  IconLayoutGrid,
  IconTag,
  IconDimensions,
  IconCalendar,
  IconFilter,
} from '@tabler/icons-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { toast } from 'sonner'
import {
  fetchGaleri,
  deleteBulkGaleri,
  formatDimensions,
  type GaleriWithKategori,
} from '@/lib/galeri'
import { fetchGaleriKategori, type GaleriKategori } from '@/lib/galeri-kategori'
import { DataTable, type ColumnDef } from '@/components/data-table'
import { ModalEditGaleri } from '@/components/protected/galeri/modal-edit-galeri'
import { ModalHapusGaleri } from '@/components/protected/galeri/modal-hapus-galeri'
import { ModalTambahGaleri } from '@/components/protected/galeri/modal-tambah-galeri'
import Image from 'next/image'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
    outline: 'border border-input hover:bg-muted text-foreground',
    default: 'bg-primary text-primary-foreground hover:opacity-90',
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group">
      <div className="hidden sm:flex items-start gap-4">
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-bold text-foreground leading-tight wrap-break-word">
            {value}
          </p>
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
            <p className="text-lg font-bold text-foreground leading-tight wrap-break-word">
              {value}
            </p>
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

function ThumbnailCell({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false)
  return (
    <div className="relative w-14 h-10 rounded-lg border border-border bg-muted/50 overflow-hidden flex items-center justify-center shrink-0">
      {!error ? (
        <Image src={src} alt={alt} fill className="object-cover" onError={() => setError(true)} />
      ) : (
        <IconPhoto size={16} className="text-muted-foreground opacity-40" />
      )}
    </div>
  )
}

export default function GaleriPage() {
  const [galeris, setGaleris] = useState<GaleriWithKategori[]>([])
  const [kategoris, setKategoris] = useState<GaleriKategori[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterKategori, setFilterKategori] = useState('all')
  const [modalTambahOpen, setModalTambahOpen] = useState(false)
  const [editGaleri, setEditGaleri] = useState<GaleriWithKategori | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<GaleriWithKategori | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [galeriList, kategoriList] = await Promise.all([fetchGaleri(), fetchGaleriKategori()])
      setGaleris(galeriList)
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

  const totalFoto = galeris.length
  const fotoWithKategori = galeris.filter((g) => g.galeri_kategori_id !== null).length
  const fotoWithDimensi = galeris.filter((g) => g.width && g.height).length

  const filteredGaleris =
    filterKategori === 'all'
      ? galeris
      : filterKategori === 'uncategorized'
        ? galeris.filter((g) => !g.galeri_kategori_id)
        : galeris.filter((g) => g.galeri_kategori_id === filterKategori)

  function handleSave(galeri: GaleriWithKategori) {
    setGaleris((prev) => [galeri, ...prev])
  }

  function handleUpdate(updated: GaleriWithKategori) {
    setGaleris((prev) => prev.map((g) => (g.id === updated.id ? updated : g)))
  }

  function handleDeleted(id: string) {
    setGaleris((prev) => prev.filter((g) => g.id !== id))
    setDeleteTarget(null)
  }

  async function handleBulkDelete(keys: string[]) {
    const items = galeris
      .filter((g) => keys.includes(g.id))
      .map((g) => ({ id: g.id, imageUrl: g.image_url }))

    try {
      await deleteBulkGaleri(items)
      setGaleris((prev) => prev.filter((g) => !keys.includes(g.id)))
      toast.success(`${keys.length} foto galeri berhasil dihapus`, {
        description: 'File storage ikut terhapus.',
      })
    } catch (e: unknown) {
      toast.error('Gagal menghapus beberapa foto', {
        description: e instanceof Error ? e.message : undefined,
      })
    }
  }

  const columns: ColumnDef<GaleriWithKategori>[] = [
    {
      key: 'thumbnail',
      header: 'Foto',
      cell: (row) => <ThumbnailCell src={row.image_url} alt={row.judul || 'foto'} />,
    },
    {
      key: 'judul',
      header: 'Judul & Deskripsi',
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col min-w-0 max-w-xs">
          <span className="font-semibold text-foreground truncate">
            {row.judul || (
              <span className="text-muted-foreground italic font-normal text-xs">Tanpa judul</span>
            )}
          </span>
          {row.deskripsi && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1" title={row.deskripsi}>
              {row.deskripsi}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'galeri_kategori',
      header: 'Kategori',
      sortable: true,
      cell: (row) => {
        if (!row.galeri_kategori) {
          return <span className="text-xs text-muted-foreground italic">—</span>
        }

        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-border bg-muted text-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>{row.galeri_kategori.nama}</span>
          </span>
        )
      },
    },
    {
      key: 'dimensi',
      header: 'Dimensi',
      cell: (row) => {
        const dim = formatDimensions(row.width, row.height)
        return (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {dim !== '-' ? (
              <>
                <IconDimensions size={12} />
                {dim}
              </>
            ) : (
              <span className="italic">—</span>
            )}
          </span>
        )
      },
    },
    {
      key: 'created_at',
      header: 'Tanggal',
      sortable: true,
      cell: (row) => {
        if (!row.created_at) return <span className="text-xs text-muted-foreground italic">—</span>
        return (
          <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
            <IconCalendar size={12} />
            {new Date(row.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        )
      },
    },
    {
      key: 'aksi',
      header: 'Aksi',
      align: 'center',
      cell: (row) => (
        <div
          className="flex items-center justify-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setEditGaleri(row)}
            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
            title="Edit"
          >
            <IconEdit size={15} />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
            title="Hapus"
          >
            <IconTrash size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <IconPhoto size={18} className="text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Galeri Foto</h1>
          </div>
          <p className="text-sm text-muted-foreground pl-11">
            Manajemen foto &amp; gambar untuk ditampilkan di website
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 border border-border text-foreground px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-muted transition-colors disabled:opacity-50"
          >
            <IconRefresh size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setModalTambahOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
          >
            <IconPlus size={17} />
            Tambah Foto
          </button>
        </div>
      </div>

      <hr className="my-4" />

      {error && (
        <div className="mb-6 flex items-center gap-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3">
          <IconAlertCircle size={18} className="shrink-0" />
          <span className="text-sm font-medium">{error}</span>
          <button onClick={loadData} className="ml-auto text-xs underline hover:no-underline">
            Coba lagi
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard
          icon={
            loading ? (
              <IconLoader2 size={18} className="text-primary animate-spin" />
            ) : (
              <IconPhoto size={18} className="text-primary" />
            )
          }
          label="Total Foto"
          value={loading ? '—' : totalFoto}
          sub="Semua foto tersedia"
          accent="bg-primary/10"
        />
        <StatCard
          icon={<IconTag size={18} className="text-violet-600" />}
          label="Foto Berkategori"
          value={loading ? '—' : fotoWithKategori}
          sub={loading ? '' : `${totalFoto - fotoWithKategori} foto tanpa kategori`}
          accent="bg-violet-100 dark:bg-violet-950"
        />
        <StatCard
          icon={<IconDimensions size={18} className="text-sky-600" />}
          label="Ada Dimensi"
          value={loading ? '—' : fotoWithDimensi}
          sub={loading ? '' : `${totalFoto - fotoWithDimensi} foto tanpa dimensi`}
          accent="bg-sky-100 dark:bg-sky-950"
        />
        <StatCard
          icon={<IconLayoutGrid size={18} className="text-emerald-600" />}
          label="Kategori Tersedia"
          value={loading ? '—' : kategoris.length}
          sub="Total kategori galeri"
          accent="bg-emerald-100 dark:bg-emerald-950"
        />
      </div>

      {!loading && kategoris.length > 0 && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <IconFilter size={13} />
            Filter:
          </span>
          <button
            onClick={() => setFilterKategori('all')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border transition-all',
              filterKategori === 'all'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-secondary/50 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            )}
          >
            Semua ({totalFoto})
          </button>
          <button
            onClick={() => setFilterKategori('uncategorized')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border transition-all',
              filterKategori === 'uncategorized'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-secondary/50 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            )}
          >
            Tanpa Kategori ({galeris.filter((g) => !g.galeri_kategori_id).length})
          </button>
          {kategoris.map((k) => {
            const count = galeris.filter((g) => g.galeri_kategori_id === k.id).length
            return (
              <button
                key={k.id}
                onClick={() => setFilterKategori(k.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all',
                  filterKategori === k.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary/50 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                )}
              >
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    filterKategori === k.id ? 'bg-primary-foreground' : 'bg-primary'
                  )}
                />
                {k.nama} ({count})
              </button>
            )
          })}
        </div>
      )}

      {loading && galeris.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground gap-2">
          <IconLoader2 size={20} className="animate-spin" />
          <span className="text-sm">Memuat data...</span>
        </div>
      ) : (
        <DataTable<GaleriWithKategori>
          data={filteredGaleris}
          columns={columns}
          rowKey="id"
          pageSize={10}
          defaultSort={{ key: 'created_at', direction: 'desc' }}
          searchFields={['judul', 'deskripsi']}
          searchPlaceholder="Cari foto berdasarkan judul atau deskripsi..."
          selectable
          onBulkDelete={(keys) => handleBulkDelete(keys as string[])}
          emptyMessage="Tidak ada foto ditemukan."
          toolbarExtra={
            <span className="text-xs text-muted-foreground">
              Menampilkan{' '}
              <span className="font-semibold text-foreground">{filteredGaleris.length}</span> dari{' '}
              <span className="font-semibold text-foreground">{totalFoto}</span> foto
            </span>
          }
        />
      )}

      <ModalTambahGaleri
        open={modalTambahOpen}
        onClose={() => setModalTambahOpen(false)}
        onSave={handleSave}
        kategoris={kategoris}
      />

      {editGaleri && (
        <ModalEditGaleri
          open={!!editGaleri}
          onClose={() => setEditGaleri(null)}
          galeri={editGaleri}
          onUpdate={handleUpdate}
          kategoris={kategoris}
        />
      )}

      {deleteTarget && (
        <ModalHapusGaleri
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          galeri={deleteTarget}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}
