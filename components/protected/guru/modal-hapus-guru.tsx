'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { IconTrash, IconX, IconLoader2, IconAlertTriangle } from '@tabler/icons-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { deleteGuru, type Guru } from '@/lib/guru'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModalHapusGuruProps {
  open: boolean
  onClose: () => void
  guru: Guru
  onDeleted: (id: number) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ModalHapusGuru({ open, onClose, guru, onDeleted }: ModalHapusGuruProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteGuru(guru.id)
      toast.success('Guru berhasil dihapus', {
        description: `"${guru.nama ?? 'Tanpa nama'}" telah dihapus dari daftar.`,
        duration: 3000,
      })
      onDeleted(guru.id)
      onClose()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Terjadi kesalahan pada server.'
      toast.error('Gagal menghapus guru', { description: msg, duration: 5000 })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && open) onClose()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />
        <DialogPrimitive.Content
          onInteractOutside={(e) => {
            e.preventDefault()
            onClose()
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault()
            onClose()
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
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <IconAlertTriangle size={18} className="text-destructive" />
              </div>
              <div>
                <DialogPrimitive.Title className="text-base font-bold text-foreground">
                  Hapus Guru
                </DialogPrimitive.Title>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>
            <DialogPrimitive.Close
              onClick={onClose}
              disabled={deleting}
              className="rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors p-1.5 disabled:opacity-40"
            >
              <IconX size={16} />
            </DialogPrimitive.Close>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Apakah kamu yakin ingin menghapus guru{' '}
              <span className="font-semibold text-foreground">
                &ldquo;{guru.nama ?? 'Tanpa nama'}&rdquo;
              </span>
              ?
            </p>
            <p className="text-sm text-muted-foreground mt-1.5">
              Data yang sudah dihapus{' '}
              <span className="font-medium text-destructive">tidak dapat dipulihkan</span>.
            </p>

            {/* Info card */}
            <div className="mt-4 rounded-xl border border-border bg-muted/30 px-4 py-3 space-y-1.5">
              {guru.nama && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Nama</span>
                  <span className="font-medium text-foreground">{guru.nama}</span>
                </div>
              )}
              {guru.jabatan && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Jabatan</span>
                  <span className="font-medium text-foreground">{guru.jabatan}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-foreground">#{guru.id}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {deleting ? (
                <>
                  <IconLoader2 size={15} className="animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <IconTrash size={15} />
                  Ya, Hapus
                </>
              )}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
