'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  IconPlus,
  IconX,
  IconCheck,
  IconLoader2,
  IconTag,
  IconDimensions,
  IconAlertCircle,
  IconLock,
} from '@tabler/icons-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { insertGaleri, type GaleriWithKategori } from '@/lib/galeri'
import { ImageUploader } from '@/components/protected/galeri/image-uploader'

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

function getImageDimensions(file: File): Promise<{
  width: number
  height: number
}> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      })

      URL.revokeObjectURL(img.src)
    }

    img.onerror = reject

    img.src = URL.createObjectURL(file)
  })
}

interface GaleriKategoriOption {
  id: string
  nama: string
}

export interface ModalTambahGaleriProps {
  open: boolean
  onClose: () => void
  onSave: (galeri: GaleriWithKategori) => void
  kategoris: GaleriKategoriOption[]
}

export function ModalTambahGaleri({ open, onClose, onSave, kategoris }: ModalTambahGaleriProps) {
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [judul, setJudul] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [kategoriId, setKategoriId] = useState('')

  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<Record<string, string>>({})

  const [createdAt, setCreatedAt] = useState(new Date().toISOString().slice(0, 16))

  useEffect(() => {
    if (open) {
      setImageUrl('')
      setImageFile(null)

      setJudul('')
      setDeskripsi('')
      setKategoriId('')

      setWidth('')
      setHeight('')

      setCreatedAt(new Date().toISOString().slice(0, 16))

      setSaving(false)
      setError({})
    }
  }, [open])

  const validate = () => {
    const newErr: Record<string, string> = {}

    if (!imageFile && !imageUrl.trim()) {
      newErr.imageUrl = 'Pilih file atau masukkan URL gambar'
    } else if (!imageFile && !/^https?:\/\/.+/.test(imageUrl.trim())) {
      newErr.imageUrl = 'URL gambar tidak valid'
    }

    if (!judul.trim()) {
      newErr.judul = 'Judul wajib diisi'
    } else if (judul.trim().length > 100) {
      newErr.judul = 'Judul maksimal 100 karakter'
    }

    if (!deskripsi.trim()) {
      newErr.deskripsi = 'Deskripsi wajib diisi'
    } else if (deskripsi.length > 500) {
      newErr.deskripsi = 'Deskripsi maksimal 500 karakter'
    }

    if (!kategoriId) {
      newErr.kategoriId = 'Kategori wajib dipilih'
    }

    return newErr
  }

  const handleSave = async () => {
    const errs = validate()

    if (Object.keys(errs).length > 0) {
      setError(errs)
      return
    }

    setSaving(true)
    setError({})

    try {
      const result = await insertGaleri(
        {
          image_url: imageUrl.trim(),
          judul: judul.trim(),
          deskripsi: deskripsi.trim(),
          galeri_kategori_id: kategoriId,
          width: width ? Number(width) : null,
          height: height ? Number(height) : null,
          created_at: new Date(createdAt).toISOString(),
        },
        imageFile ?? undefined
      )

      onSave(result)

      toast.success('Foto berhasil ditambahkan', {
        description: `"${result.judul}" telah ditambahkan.`,
        duration: 3000,
      })

      onClose()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Terjadi kesalahan pada server.'

      setError({ imageUrl: msg })

      toast.error('Gagal menambahkan foto', {
        description: msg,
        duration: 5000,
      })
    } finally {
      setSaving(false)
    }
  }

  const selectedKategori = kategoris.find((k) => k.id === kategoriId)

  const hasImage = !!imageFile || (!!imageUrl.trim() && /^https?:\/\/.+/.test(imageUrl.trim()))

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
          {/* HEADER */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <IconPlus size={18} className="text-primary" />
              </div>

              <div>
                <DialogPrimitive.Title className="text-base font-bold text-foreground">
                  Tambah Foto Galeri
                </DialogPrimitive.Title>

                <p className="text-xs text-muted-foreground mt-0.5">Upload foto baru ke galeri</p>
              </div>
            </div>

            <DialogPrimitive.Close
              onClick={onClose}
              disabled={saving}
              className="rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors p-1.5 disabled:opacity-40"
            >
              <IconX size={16} />
            </DialogPrimitive.Close>
          </div>

          {/* CONTENT */}
          <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
            {/* IMAGE */}
            <div>
              <FieldLabel required className="block mb-2">
                Gambar
              </FieldLabel>

              <ImageUploader
                onFileChange={async (f) => {
                  setImageFile(f)

                  setError((p) => ({
                    ...p,
                    imageUrl: '',
                  }))

                  if (f) {
                    try {
                      const dimensions = await getImageDimensions(f)

                      setWidth(String(dimensions.width))
                      setHeight(String(dimensions.height))
                    } catch {
                      setWidth('')
                      setHeight('')
                    }
                  } else {
                    setWidth('')
                    setHeight('')
                  }
                }}
                onUrlChange={(u) => {
                  setImageUrl(u)

                  setError((p) => ({
                    ...p,
                    imageUrl: '',
                  }))
                }}
                urlValue={imageUrl}
                fileValue={imageFile}
                error={error.imageUrl}
                disabled={saving}
              />
            </div>

            {/* JUDUL */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <FieldLabel required htmlFor="tambah-judul">
                  Judul
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
                id="tambah-judul"
                maxLength={100}
                placeholder="Masukkan judul foto..."
                value={judul}
                disabled={saving}
                onChange={(e) => {
                  setJudul(e.target.value)

                  setError((p) => ({
                    ...p,
                    judul: '',
                  }))
                }}
                className={cn(
                  inputBase,
                  error.judul ? 'border-destructive focus:ring-destructive/20' : ''
                )}
              />

              <FieldError message={error.judul} />
            </div>

            {/* DESKRIPSI */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <FieldLabel required htmlFor="tambah-deskripsi">
                  Deskripsi
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
                id="tambah-deskripsi"
                maxLength={500}
                placeholder="Masukkan deskripsi foto..."
                value={deskripsi}
                disabled={saving}
                onChange={(e) => {
                  setDeskripsi(e.target.value)

                  setError((p) => ({
                    ...p,
                    deskripsi: '',
                  }))
                }}
                className={cn(
                  textareaBase,
                  error.deskripsi ? 'border-destructive focus:ring-destructive/20' : ''
                )}
              />

              <FieldError message={error.deskripsi} />
            </div>

            {/* TANGGAL */}
            <div>
              <FieldLabel className="block mb-1.5">Tanggal Upload</FieldLabel>

              <input
                type="datetime-local"
                value={createdAt}
                disabled={saving}
                onChange={(e) => setCreatedAt(e.target.value)}
                className={inputBase}
              />
            </div>

            {/* KATEGORI */}
            <div>
              <FieldLabel required htmlFor="tambah-kategori" className="flex mb-1.5">
                <span className="flex items-center gap-1.5">
                  <IconTag size={12} />
                  Kategori
                </span>
              </FieldLabel>

              <select
                id="tambah-kategori"
                value={kategoriId}
                disabled={saving}
                onChange={(e) => {
                  setKategoriId(e.target.value)

                  setError((p) => ({
                    ...p,
                    kategoriId: '',
                  }))
                }}
                className={cn(
                  inputBase,
                  'cursor-pointer',
                  error.kategoriId ? 'border-destructive focus:ring-destructive/20' : ''
                )}
              >
                <option value="">— Pilih Kategori —</option>

                {kategoris.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>

              <FieldError message={error.kategoriId} />

              {selectedKategori && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-secondary/50 border-border text-foreground dark:bg-white/5 dark:border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />

                    <span>{selectedKategori.nama}</span>
                  </span>
                </div>
              )}
            </div>

            {/* DIMENSI */}
            <div>
              <FieldLabel className="block mb-1.5">
                <span className="flex items-center gap-1.5">
                  <IconDimensions size={12} />
                  Dimensi Gambar
                </span>
              </FieldLabel>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="text"
                    value={width ? `${width}px` : '-'}
                    disabled
                    className={cn(inputBase, 'pr-10 bg-muted/40')}
                  />

                  <IconLock
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={height ? `${height}px` : '-'}
                    disabled
                    className={cn(inputBase, 'pr-10 bg-muted/40')}
                  />

                  <IconLock
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground mt-1">
                Dimensi otomatis terdeteksi dari gambar dan tidak dapat diubah.
              </p>
            </div>
          </div>

          {/* FOOTER */}
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
              disabled={saving || !hasImage || !judul.trim() || !deskripsi.trim() || !kategoriId}
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
                  Simpan Foto
                </>
              )}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
