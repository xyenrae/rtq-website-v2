'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { IconEdit, IconX, IconCheck, IconLoader2, IconFileDescription } from '@tabler/icons-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { type GaleriKategori, updateGaleriKategori } from '@/lib/galeri-kategori'

// ─── Reusable UI Components ───────────────────────────────────────────────────

function FieldLabel({
  children,
  required,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label {...props} className={cn('text-xs font-semibold text-foreground', props.className)}>
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs text-destructive">{message}</p>
}

const inputBase = cn(
  'w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground',
  'placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20',
  'focus:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
)

const textareaBase = cn(inputBase, 'min-h-[80px] max-h-[120px] resize-y leading-relaxed')

// ─── Props Interface ──────────────────────────────────────────────────────────

export interface ModalEditGaleriKategoriProps {
  open: boolean
  onClose: () => void
  kategori: GaleriKategori
  onUpdate: (kategori: GaleriKategori) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ModalEditGaleriKategori({
  open,
  onClose,
  kategori,
  onUpdate,
}: ModalEditGaleriKategoriProps) {
  const [nama, setNama] = useState(kategori.nama)
  const [deskripsi, setDeskripsi] = useState(kategori.deskripsi ?? '')
  const [error, setError] = useState<{ nama?: string; deskripsi?: string }>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setNama(kategori.nama)
      setDeskripsi(kategori.deskripsi ?? '')
      setError({})
    }
  }, [open, kategori])

  const isDirty = nama.trim() !== kategori.nama || deskripsi.trim() !== (kategori.deskripsi ?? '')

  const handleSave = async () => {
    const newError: { nama?: string; deskripsi?: string } = {}

    if (!nama.trim()) {
      newError.nama = 'Nama kategori tidak boleh kosong'
    } else if (nama.trim().length < 2) {
      newError.nama = 'Nama kategori minimal 2 karakter'
    } else if (nama.trim().length > 50) {
      newError.nama = 'Nama kategori maksimal 50 karakter'
    }

    if (deskripsi.length > 200) {
      newError.deskripsi = 'Deskripsi maksimal 200 karakter'
    }

    if (Object.keys(newError).length > 0) {
      setError(newError)
      return
    }

    if (!isDirty) {
      onClose()
      return
    }

    setSaving(true)
    setError({})

    try {
      const updatePayload: { nama?: string; deskripsi?: string | null } = {}

      if (nama.trim() !== kategori.nama) {
        updatePayload.nama = nama.trim()
      }
      if (deskripsi.trim() !== (kategori.deskripsi ?? '')) {
        updatePayload.deskripsi = deskripsi.trim() || null
      }

      const result = await updateGaleriKategori(kategori.id, updatePayload)
      onUpdate(result)
      toast.success('Kategori galeri berhasil diperbarui', {
        description: `"${result.nama}" telah diperbarui.`,
        duration: 3000,
      })
      onClose()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Terjadi kesalahan pada server.'
      setError({ nama: msg })
      toast.error('Gagal memperbarui kategori galeri', { description: msg, duration: 5000 })
    } finally {
      setSaving(false)
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
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <IconEdit size={16} className="text-primary" />
              </div>
              <div>
                <DialogPrimitive.Title className="text-base font-bold text-foreground">
                  Edit Kategori Galeri
                </DialogPrimitive.Title>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">{kategori.nama}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isDirty && (
                <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Ada perubahan
                </span>
              )}
              <DialogPrimitive.Close
                onClick={onClose}
                disabled={saving}
                className="rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors p-1.5 disabled:opacity-40 ml-1"
              >
                <IconX size={16} />
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            {/* Nama */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <FieldLabel required htmlFor="edit-galeri-nama">
                  Nama Kategori
                </FieldLabel>
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    nama.length > 45 ? 'text-destructive' : 'text-muted-foreground'
                  )}
                >
                  {nama.length}/50
                </span>
              </div>
              <input
                id="edit-galeri-nama"
                maxLength={50}
                placeholder="Nama kategori galeri..."
                value={nama}
                onChange={(e) => {
                  setNama(e.target.value)
                  setError((prev) => ({ ...prev, nama: undefined }))
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !saving) handleSave()
                }}
                className={cn(
                  inputBase,
                  error.nama
                    ? 'border-destructive focus:ring-destructive/20 focus:border-destructive'
                    : ''
                )}
                autoFocus
              />
              <FieldError message={error.nama} />
            </div>

            {/* Deskripsi */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <FieldLabel htmlFor="edit-galeri-deskripsi">
                  Deskripsi <span className="text-muted-foreground font-normal">(Opsional)</span>
                </FieldLabel>
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    deskripsi.length > 190 ? 'text-destructive' : 'text-muted-foreground'
                  )}
                >
                  {deskripsi.length}/200
                </span>
              </div>
              <textarea
                id="edit-galeri-deskripsi"
                maxLength={200}
                placeholder="Jelaskan singkat tentang kategori galeri ini..."
                value={deskripsi}
                onChange={(e) => {
                  setDeskripsi(e.target.value)
                  setError((prev) => ({ ...prev, deskripsi: undefined }))
                }}
                className={cn(
                  textareaBase,
                  error.deskripsi
                    ? 'border-destructive focus:ring-destructive/20 focus:border-destructive'
                    : ''
                )}
              />
              <FieldError message={error.deskripsi} />
              <p className="text-[10px] text-muted-foreground mt-1">
                Deskripsi akan muncul sebagai tooltip atau info tambahan di tabel.
              </p>
            </div>

            {/* Preview perubahan */}
            {isDirty && (
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Perubahan
                </p>

                {nama.trim() !== kategori.nama && (
                  <div className="flex items-center gap-3 flex-wrap pb-3 border-b border-border/50">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase w-16">
                      Nama
                    </span>

                    <div className="flex items-center gap-2 flex-1">
                      <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground line-through opacity-60">
                        {kategori.nama}
                      </span>

                      <span className="text-xs text-muted-foreground">→</span>

                      <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground">
                        {nama.trim()}
                      </span>
                    </div>
                  </div>
                )}

                {deskripsi.trim() !== (kategori.deskripsi ?? '') && (
                  <div className="flex items-start gap-3 flex-wrap">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase w-16 mt-1">
                      Deskripsi
                    </span>
                    <div className="flex-1 space-y-2">
                      {(kategori.deskripsi ?? '') && (
                        <div className="flex items-start gap-2">
                          <IconFileDescription
                            size={12}
                            className="text-muted-foreground mt-0.5 shrink-0"
                          />
                          <p className="text-xs text-muted-foreground line-clamp-2 line-through opacity-60">
                            {kategori.deskripsi}
                          </p>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <IconFileDescription size={12} className="text-primary mt-0.5 shrink-0" />
                        <p className="text-xs text-foreground font-medium line-clamp-2">
                          {deskripsi.trim() || (
                            <span className="text-muted-foreground italic">[dihapus]</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !nama.trim() || !isDirty}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {saving ? (
                <>
                  <IconLoader2 size={15} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <IconCheck size={15} />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
