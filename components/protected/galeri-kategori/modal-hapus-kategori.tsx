'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  IconTrash,
  IconX,
  IconAlertTriangle,
  IconPhoto,
  IconCheck,
  IconLoader2,
} from '@tabler/icons-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
  deleteGaleriKategori,
  type GaleriKategori,
  getGaleriKategoriStyle,
} from '@/lib/galeri-kategori'

// ─── Props Interface ──────────────────────────────────────────────────────────

export interface ModalHapusGaleriKategoriProps {
  open: boolean
  onClose: () => void
  kategori: GaleriKategori
  galeriCount: number
  onDeleted: (id: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ModalHapusGaleriKategori({
  open,
  onClose,
  kategori,
  galeriCount,
  onDeleted,
}: ModalHapusGaleriKategoriProps) {
  const [deleting, setDeleting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const handleClose = () => {
    if (deleting) return
    setConfirmed(false)
    onClose()
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteGaleriKategori(kategori.id)
      onDeleted(kategori.id)
      toast.success('Kategori galeri berhasil dihapus', {
        description: `"${kategori.nama}" telah dihapus secara permanen.`,
        duration: 4000,
      })
      setConfirmed(false)
      onClose()
    } catch (e: unknown) {
      toast.error('Gagal menghapus kategori galeri', {
        description:
          e instanceof Error ? e.message : 'Terjadi kesalahan pada server. Silakan coba lagi.',
        duration: 5000,
      })
    } finally {
      setDeleting(false)
    }
  }

  const style = getGaleriKategoriStyle(kategori.nama)

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && open) handleClose()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />
        <DialogPrimitive.Content
          onInteractOutside={(e) => {
            e.preventDefault()
            handleClose()
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault()
            handleClose()
          }}
          className={cn(
            'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
            'w-full max-w-md flex flex-col',
            'bg-card border border-border rounded-2xl shadow-2xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'duration-200'
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <IconTrash size={16} className="text-destructive" />
              </div>
              <div>
                <DialogPrimitive.Title className="text-base font-bold text-foreground">
                  Hapus Kategori Galeri
                </DialogPrimitive.Title>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>
            <DialogPrimitive.Close
              onClick={handleClose}
              disabled={deleting}
              className="rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors p-1.5 disabled:opacity-40"
            >
              <IconX size={16} />
            </DialogPrimitive.Close>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            {/* Warning */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-destructive/5 border border-destructive/20">
              <IconAlertTriangle size={15} className="text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive leading-relaxed">
                Kategori yang dihapus <span className="font-semibold">tidak dapat dipulihkan</span>.
                {galeriCount > 0 && (
                  <>
                    {' '}
                    Terdapat <span className="font-semibold">{galeriCount} foto/galeri</span> yang
                    terhubung dengan kategori ini.
                  </>
                )}
              </p>
            </div>

            {/* Detail kategori */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center gap-4">
              <div
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border',
                  style.bg,
                  style.border
                )}
              >
                <IconPhoto size={18} className={style.text} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-foreground text-sm">{kategori.nama}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{galeriCount} foto terkait</p>
              </div>
              <span
                className={cn(
                  'ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-secondary/50',
                  'border-border dark:bg-white/5 dark:border-white/10'
                )}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                <span className={style.text}>{kategori.nama}</span>
              </span>
            </div>

            {/* Konfirmasi */}
            <label className="flex items-start gap-3 cursor-pointer select-none group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  disabled={deleting}
                  className="peer sr-only"
                />
                <div
                  className={cn(
                    'w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center',
                    confirmed
                      ? 'bg-destructive border-destructive'
                      : 'bg-background border-border group-hover:border-destructive/50'
                  )}
                >
                  {confirmed && <IconCheck size={11} className="text-white" />}
                </div>
              </div>
              <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                Saya mengerti bahwa kategori{' '}
                <span className="font-semibold text-foreground">"{kategori.nama}"</span> akan
                dihapus secara permanen dan tidak bisa dipulihkan.
              </span>
            </label>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
            <button
              type="button"
              onClick={handleClose}
              disabled={deleting}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!confirmed || deleting}
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
                confirmed && !deleting
                  ? 'bg-destructive text-destructive-foreground hover:opacity-90 shadow-sm'
                  : 'bg-destructive/30 text-destructive-foreground/50 cursor-not-allowed'
              )}
            >
              {deleting ? (
                <>
                  <IconLoader2 size={15} className="animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <IconTrash size={15} />
                  Hapus Permanen
                </>
              )}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
