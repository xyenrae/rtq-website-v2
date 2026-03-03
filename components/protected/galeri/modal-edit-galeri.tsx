'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  IconEdit,
  IconX,
  IconCheck,
  IconLoader2,
  IconPhoto,
  IconLink,
  IconDimensions,
  IconTag,
  IconAlertCircle,
  IconEye,
  IconFileDescription,
} from '@tabler/icons-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { updateGaleri, getKategoriStyle, type GaleriWithKategori } from '@/lib/galeri'

// ─── Reusable UI ─────────────────────────────────────────────────────────────

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
  return (
    <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
      <IconAlertCircle size={11} />
      {message}
    </p>
  )
}

const inputBase = cn(
  'w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground',
  'placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20',
  'focus:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
)

const textareaBase = cn(inputBase, 'min-h-[80px] max-h-[120px] resize-y leading-relaxed')

// ─── Types ────────────────────────────────────────────────────────────────────

interface GaleriKategoriOption {
  id: string
  nama: string
}

export interface ModalEditGaleriProps {
  open: boolean
  onClose: () => void
  galeri: GaleriWithKategori
  onUpdate: (galeri: GaleriWithKategori) => void
  kategoris: GaleriKategoriOption[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ModalEditGaleri({
  open,
  onClose,
  galeri,
  onUpdate,
  kategoris,
}: ModalEditGaleriProps) {
  const [imageUrl, setImageUrl] = useState(galeri.image_url)
  const [judul, setJudul] = useState(galeri.judul ?? '')
  const [deskripsi, setDeskripsi] = useState(galeri.deskripsi ?? '')
  const [kategoriId, setKategoriId] = useState<string>(galeri.galeri_kategori_id ?? '')
  const [width, setWidth] = useState<string>(galeri.width?.toString() ?? '')
  const [height, setHeight] = useState<string>(galeri.height?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [previewError, setPreviewError] = useState(false)
  const [error, setError] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setImageUrl(galeri.image_url)
      setJudul(galeri.judul ?? '')
      setDeskripsi(galeri.deskripsi ?? '')
      setKategoriId(galeri.galeri_kategori_id ?? '')
      setWidth(galeri.width?.toString() ?? '')
      setHeight(galeri.height?.toString() ?? '')
      setSaving(false)
      setPreviewError(false)
      setError({})
    }
  }, [open, galeri])

  const isDirty =
    imageUrl.trim() !== galeri.image_url ||
    judul.trim() !== (galeri.judul ?? '') ||
    deskripsi.trim() !== (galeri.deskripsi ?? '') ||
    kategoriId !== (galeri.galeri_kategori_id ?? '') ||
    width !== (galeri.width?.toString() ?? '') ||
    height !== (galeri.height?.toString() ?? '')

  const validate = () => {
    const newErr: Record<string, string> = {}
    if (!imageUrl.trim()) newErr.imageUrl = 'URL gambar tidak boleh kosong'
    else if (!/^https?:\/\/.+/.test(imageUrl.trim())) newErr.imageUrl = 'URL gambar tidak valid'
    if (judul.trim().length > 100) newErr.judul = 'Judul maksimal 100 karakter'
    if (deskripsi.length > 500) newErr.deskripsi = 'Deskripsi maksimal 500 karakter'
    if (width && (isNaN(Number(width)) || Number(width) <= 0))
      newErr.width = 'Lebar harus berupa angka positif'
    if (height && (isNaN(Number(height)) || Number(height) <= 0))
      newErr.height = 'Tinggi harus berupa angka positif'
    return newErr
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setError(errs)
      return
    }

    if (!isDirty) {
      onClose()
      return
    }

    setSaving(true)
    setError({})

    try {
      const result = await updateGaleri(galeri.id, {
        image_url: imageUrl.trim(),
        judul: judul.trim() || null,
        deskripsi: deskripsi.trim() || null,
        galeri_kategori_id: kategoriId || null,
        width: width ? Number(width) : null,
        height: height ? Number(height) : null,
      })

      onUpdate(result)
      toast.success('Foto berhasil diperbarui', {
        description: result.judul
          ? `"${result.judul}" telah diperbarui.`
          : 'Data foto telah diperbarui.',
        duration: 3000,
      })
      onClose()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Terjadi kesalahan pada server.'
      setError({ imageUrl: msg })
      toast.error('Gagal memperbarui foto', { description: msg, duration: 5000 })
    } finally {
      setSaving(false)
    }
  }

  const selectedKategori = kategoris.find((k) => k.id === kategoriId)
  const kategoriStyle = selectedKategori ? getKategoriStyle(selectedKategori.nama) : null
  const showPreview = imageUrl.trim() && /^https?:\/\/.+/.test(imageUrl.trim())

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
            'w-full max-w-lg flex flex-col max-h-[90vh]',
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
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <IconEdit size={16} className="text-primary" />
              </div>
              <div>
                <DialogPrimitive.Title className="text-base font-bold text-foreground">
                  Edit Foto Galeri
                </DialogPrimitive.Title>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate max-w-[220px]">
                  {galeri.judul || galeri.id}
                </p>
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
          <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
            {/* Image URL */}
            <div>
              <FieldLabel required htmlFor="edit-image-url" className="block mb-1.5">
                <span className="flex items-center gap-1.5">
                  <IconLink size={12} /> URL Gambar
                </span>
              </FieldLabel>
              <input
                id="edit-image-url"
                type="url"
                placeholder="https://example.com/foto.jpg"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value)
                  setPreviewError(false)
                  setError((p) => ({ ...p, imageUrl: undefined as unknown as string }))
                }}
                className={cn(
                  inputBase,
                  error.imageUrl ? 'border-destructive focus:ring-destructive/20' : ''
                )}
                autoFocus
              />
              <FieldError message={error.imageUrl} />
            </div>

            {/* Image Preview */}
            {showPreview && (
              <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
                  <IconEye size={12} className="text-muted-foreground" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Pratinjau Gambar
                  </span>
                </div>
                {!previewError ? (
                  <div className="relative w-full h-48 bg-muted/50 flex items-center justify-center overflow-hidden">
                    <img
                      src={imageUrl.trim()}
                      alt="preview"
                      className="w-full h-full object-contain"
                      onError={() => setPreviewError(true)}
                    />
                  </div>
                ) : (
                  <div className="h-32 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <IconPhoto size={28} className="opacity-40" />
                    <p className="text-xs">Gagal memuat pratinjau gambar</p>
                  </div>
                )}
              </div>
            )}

            {/* Judul */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <FieldLabel htmlFor="edit-judul">
                  Judul <span className="text-muted-foreground font-normal">(Opsional)</span>
                </FieldLabel>
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    judul.length > 90 ? 'text-destructive' : 'text-muted-foreground'
                  )}
                >
                  {judul.length}/100
                </span>
              </div>
              <input
                id="edit-judul"
                maxLength={100}
                placeholder="Judul foto..."
                value={judul}
                onChange={(e) => {
                  setJudul(e.target.value)
                  setError((p) => ({ ...p, judul: undefined as unknown as string }))
                }}
                className={cn(
                  inputBase,
                  error.judul ? 'border-destructive focus:ring-destructive/20' : ''
                )}
              />
              <FieldError message={error.judul} />
            </div>

            {/* Deskripsi */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <FieldLabel htmlFor="edit-deskripsi">
                  Deskripsi <span className="text-muted-foreground font-normal">(Opsional)</span>
                </FieldLabel>
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    deskripsi.length > 480 ? 'text-destructive' : 'text-muted-foreground'
                  )}
                >
                  {deskripsi.length}/500
                </span>
              </div>
              <textarea
                id="edit-deskripsi"
                maxLength={500}
                placeholder="Deskripsi singkat tentang foto ini..."
                value={deskripsi}
                onChange={(e) => {
                  setDeskripsi(e.target.value)
                  setError((p) => ({ ...p, deskripsi: undefined as unknown as string }))
                }}
                className={cn(
                  textareaBase,
                  error.deskripsi ? 'border-destructive focus:ring-destructive/20' : ''
                )}
              />
              <FieldError message={error.deskripsi} />
            </div>

            {/* Kategori */}
            <div>
              <FieldLabel htmlFor="edit-kategori" className="block mb-1.5">
                <span className="flex items-center gap-1.5">
                  <IconTag size={12} /> Kategori{' '}
                  <span className="text-muted-foreground font-normal">(Opsional)</span>
                </span>
              </FieldLabel>
              <select
                id="edit-kategori"
                value={kategoriId}
                onChange={(e) => setKategoriId(e.target.value)}
                className={cn(inputBase, 'cursor-pointer')}
              >
                <option value="">— Tanpa Kategori —</option>
                {kategoris.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
              {selectedKategori && kategoriStyle && (
                <div className="mt-2 flex items-center gap-1.5">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-secondary/50 border-border dark:bg-white/5 dark:border-white/10'
                    )}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${kategoriStyle.dot}`} />
                    <span className={kategoriStyle.text}>{selectedKategori.nama}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Dimensi */}
            <div>
              <FieldLabel className="block mb-1.5">
                <span className="flex items-center gap-1.5">
                  <IconDimensions size={12} /> Dimensi{' '}
                  <span className="text-muted-foreground font-normal">(Opsional)</span>
                </span>
              </FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    min={1}
                    placeholder="Lebar (px)"
                    value={width}
                    onChange={(e) => {
                      setWidth(e.target.value)
                      setError((p) => ({ ...p, width: undefined as unknown as string }))
                    }}
                    className={cn(
                      inputBase,
                      error.width ? 'border-destructive focus:ring-destructive/20' : ''
                    )}
                  />
                  <FieldError message={error.width} />
                </div>
                <div>
                  <input
                    type="number"
                    min={1}
                    placeholder="Tinggi (px)"
                    value={height}
                    onChange={(e) => {
                      setHeight(e.target.value)
                      setError((p) => ({ ...p, height: undefined as unknown as string }))
                    }}
                    className={cn(
                      inputBase,
                      error.height ? 'border-destructive focus:ring-destructive/20' : ''
                    )}
                  />
                  <FieldError message={error.height} />
                </div>
              </div>
            </div>

            {/* Perubahan preview */}
            {isDirty && (
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Perubahan
                </p>
                {imageUrl.trim() !== galeri.image_url && (
                  <div className="flex items-center gap-2 text-xs">
                    <IconLink size={11} className="text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground line-through truncate max-w-[120px] opacity-60">
                      {galeri.image_url}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-foreground truncate max-w-[120px]">
                      {imageUrl.trim()}
                    </span>
                  </div>
                )}
                {judul.trim() !== (galeri.judul ?? '') && (
                  <div className="flex items-center gap-2 text-xs">
                    <IconFileDescription size={11} className="text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground line-through opacity-60">
                      {galeri.judul || '(kosong)'}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-foreground font-medium">
                      {judul.trim() || '(kosong)'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20 shrink-0">
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
              disabled={saving || !imageUrl.trim() || !isDirty}
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
