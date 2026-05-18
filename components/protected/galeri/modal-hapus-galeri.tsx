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
  IconLink,
  IconDimensions,
  IconCalendar,
} from '@tabler/icons-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { deleteGaleri, formatDimensions, type GaleriWithKategori } from '@/lib/galeri'
import Image from 'next/image'

export interface ModalHapusGaleriProps {
  open: boolean
  onClose: () => void
  galeri: GaleriWithKategori
  onDeleted: (id: string) => void
}

export function ModalHapusGaleri({ open, onClose, galeri, onDeleted }: ModalHapusGaleriProps) {
  const [deleting, setDeleting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleClose = () => {
    if (deleting) return
    setConfirmed(false)
    setImgError(false)
    onClose()
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteGaleri(galeri.id, galeri.image_url)
      onDeleted(galeri.id)
      toast.success('Foto berhasil dihapus', {
        description: galeri.judul
          ? `"${galeri.judul}" dan file storage telah dihapus permanen.`
          : 'Foto dan file storage telah dihapus permanen.',
        duration: 4000,
      })
      setConfirmed(false)
      onClose()
    } catch (e: unknown) {
      toast.error('Gagal menghapus foto', {
        description:
          e instanceof Error ? e.message : 'Terjadi kesalahan pada server. Silakan coba lagi.',
        duration: 5000,
      })
    } finally {
      setDeleting(false)
    }
  }

  const formattedDate = galeri.created_at
    ? new Date(galeri.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

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
            'w-full max-w-md flex flex-col max-h-[90vh]',
            'bg-card border border-border rounded-2xl shadow-2xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'duration-200'
          )}
        >
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <IconTrash size={16} className="text-destructive" />
              </div>
              <div>
                <DialogPrimitive.Title className="text-base font-bold text-foreground">
                  Hapus Foto Galeri
                </DialogPrimitive.Title>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Foto & file storage akan dihapus permanen
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

          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-destructive/5 border border-destructive/20">
              <IconAlertTriangle size={15} className="text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive leading-relaxed">
                Data galeri <span className="font-semibold">dan file gambar di storage</span> akan
                dihapus secara permanen dan{' '}
                <span className="font-semibold">tidak dapat dipulihkan</span>.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
              <div className="relative w-full h-40 bg-muted/50 flex items-center justify-center overflow-hidden">
                {!imgError ? (
                  <Image
                    src={galeri.image_url}
                    alt={galeri.judul || 'foto'}
                    fill
                    className="object-cover opacity-80"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <IconPhoto size={32} className="opacity-30" />
                    <span className="text-xs">Pratinjau tidak tersedia</span>
                  </div>
                )}
                {galeri.galeri_kategori && (
                  <div className="absolute bottom-2 left-2 z-10">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-card/90 backdrop-blur-sm border-border text-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>{galeri.galeri_kategori.nama}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-2">
                <p className="font-bold text-foreground text-sm">
                  {galeri.judul || (
                    <span className="text-muted-foreground italic font-normal">Tanpa judul</span>
                  )}
                </p>
                {galeri.deskripsi && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{galeri.deskripsi}</p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                  {(galeri.width ?? galeri.height) && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <IconDimensions size={11} />
                      {formatDimensions(galeri.width, galeri.height)}
                    </span>
                  )}
                  {formattedDate && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <IconCalendar size={11} />
                      {formattedDate}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground truncate max-w-50">
                    <IconLink size={11} />
                    <span className="truncate">{galeri.image_url}</span>
                  </span>
                </div>
              </div>
            </div>

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
                Saya mengerti bahwa foto dan file storage akan dihapus secara{' '}
                <span className="font-semibold text-foreground">
                  permanen dan tidak bisa dipulihkan
                </span>
                .
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20 shrink-0">
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
