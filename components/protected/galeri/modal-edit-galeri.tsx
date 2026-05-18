'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  IconEdit,
  IconX,
  IconCheck,
  IconLoader2,
  IconTag,
  IconDimensions,
  IconAlertCircle,
  IconFileDescription,
  IconLink,
} from '@tabler/icons-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { updateGaleri, type GaleriWithKategori } from '@/lib/galeri'
import { ImageUploader } from '@/components/protected/galeri/image-uploader'

function FieldLabel({
  children,
  required,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label {...props} className={cn('text-xs font-semibold text-foreground', props.className)}>
      {children}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null

  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
      <IconAlertCircle size={11} />
      {message}
    </p>
  )
}

const inputBase = cn(
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground',
  'placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20',
  'focus:border-primary transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50'
)

const textareaBase = cn(inputBase, 'min-h-[80px] max-h-[120px] resize-y leading-relaxed')

async function getImageDimensions(src: string): Promise<{
  width: number
  height: number
}> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }

    img.onerror = reject
    img.src = src
  })
}

async function extractFileDimensions(file: File) {
  const objectUrl = URL.createObjectURL(file)

  try {
    return await getImageDimensions(objectUrl)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

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

export function ModalEditGaleri({
  open,
  onClose,
  galeri,
  onUpdate,
  kategoris,
}: ModalEditGaleriProps) {
  const [imageUrl, setImageUrl] = useState(galeri.image_url)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [judul, setJudul] = useState(galeri.judul ?? '')
  const [deskripsi, setDeskripsi] = useState(galeri.deskripsi ?? '')
  const [kategoriId, setKategoriId] = useState(galeri.galeri_kategori_id ?? '')

  const [width, setWidth] = useState(galeri.width?.toString() ?? '')
  const [height, setHeight] = useState(galeri.height?.toString() ?? '')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<Record<string, string>>({})

  const [createdAt, setCreatedAt] = useState(
    galeri.created_at ? new Date(galeri.created_at).toISOString().slice(0, 16) : ''
  )

  useEffect(() => {
    if (open) {
      setImageUrl(galeri.image_url)
      setImageFile(null)

      setJudul(galeri.judul ?? '')
      setDeskripsi(galeri.deskripsi ?? '')
      setKategoriId(galeri.galeri_kategori_id ?? '')

      setWidth(galeri.width?.toString() ?? '')
      setHeight(galeri.height?.toString() ?? '')

      setCreatedAt(galeri.created_at ? new Date(galeri.created_at).toISOString().slice(0, 16) : '')

      setSaving(false)
      setError({})
    }
  }, [open, galeri])

  const isDirty =
    !!imageFile ||
    imageUrl.trim() !== galeri.image_url ||
    judul.trim() !== (galeri.judul ?? '') ||
    deskripsi.trim() !== (galeri.deskripsi ?? '') ||
    kategoriId !== (galeri.galeri_kategori_id ?? '') ||
    createdAt !== (galeri.created_at ? new Date(galeri.created_at).toISOString().slice(0, 16) : '')

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

    if (!isDirty) {
      onClose()
      return
    }

    setSaving(true)
    setError({})

    try {
      const result = await updateGaleri(
        galeri.id,
        {
          image_url: imageFile ? undefined : imageUrl.trim(),
          judul: judul.trim(),
          deskripsi: deskripsi.trim(),
          galeri_kategori_id: kategoriId,
          width: width ? Number(width) : null,
          height: height ? Number(height) : null,
          created_at: new Date(createdAt).toISOString(),
        },
        imageFile ?? undefined,
        imageFile ? galeri.image_url : undefined
      )

      onUpdate(result)

      toast.success('Foto berhasil diperbarui', {
        description: `"${result.judul}" telah diperbarui.`,
        duration: 3000,
      })

      onClose()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Terjadi kesalahan pada server.'

      setError({ imageUrl: msg })

      toast.error('Gagal memperbarui foto', {
        description: msg,
        duration: 5000,
      })
    } finally {
      setSaving(false)
    }
  }

  const selectedKategori = kategoris.find((k) => k.id === kategoriId)

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
            'flex max-h-[90vh] w-full max-w-lg flex-col',
            'rounded-2xl border border-border bg-card shadow-2xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'duration-200'
          )}
        >
          <div className="flex items-start justify-between border-b border-border px-6 pb-4 pt-5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                <IconEdit size={16} className="text-primary" />
              </div>

              <div>
                <DialogPrimitive.Title className="text-base font-bold text-foreground">
                  Edit Foto Galeri
                </DialogPrimitive.Title>

                <p className="mt-0.5 max-w-55 truncate text-xs text-muted-foreground">
                  {galeri.judul || galeri.id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isDirty && (
                <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                  Ada perubahan
                </span>
              )}

              <DialogPrimitive.Close
                onClick={onClose}
                disabled={saving}
                className="ml-1 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
              >
                <IconX size={16} />
              </DialogPrimitive.Close>
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div>
              <FieldLabel required className="mb-2 block">
                Gambar
              </FieldLabel>

              <ImageUploader
                currentUrl={galeri.image_url}
                onFileChange={async (f) => {
                  setImageFile(f)

                  setError((p) => ({
                    ...p,
                    imageUrl: '',
                  }))

                  if (f) {
                    try {
                      const dimensions = await extractFileDimensions(f)

                      setWidth(dimensions.width.toString())
                      setHeight(dimensions.height.toString())
                    } catch {
                      toast.error('Gagal membaca dimensi gambar')
                    }
                  }
                }}
                onUrlChange={async (u) => {
                  setImageUrl(u)

                  setError((p) => ({
                    ...p,
                    imageUrl: '',
                  }))

                  if (/^https?:\/\/.+/.test(u.trim())) {
                    try {
                      const dimensions = await getImageDimensions(u.trim())

                      setWidth(dimensions.width.toString())
                      setHeight(dimensions.height.toString())
                    } catch {
                      // ignore
                    }
                  }
                }}
                urlValue={imageUrl}
                fileValue={imageFile}
                error={error.imageUrl}
                disabled={saving}
              />

              {imageFile && (
                <p className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                  <IconLink size={10} />
                  File baru akan menggantikan gambar lama di storage
                </p>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <FieldLabel required htmlFor="edit-judul">
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
                id="edit-judul"
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

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <FieldLabel required htmlFor="edit-deskripsi">
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
                id="edit-deskripsi"
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

            <div>
              <FieldLabel className="mb-1.5 block">Tanggal Upload</FieldLabel>

              <input
                type="datetime-local"
                value={createdAt}
                disabled={saving}
                onChange={(e) => setCreatedAt(e.target.value)}
                className={inputBase}
              />
            </div>

            <div>
              <FieldLabel required htmlFor="edit-kategori" className="mb-1.5 flex">
                <span className="flex items-center gap-1.5">
                  <IconTag size={12} />
                  Kategori
                </span>
              </FieldLabel>

              <select
                id="edit-kategori"
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
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-xs font-medium text-foreground dark:border-white/10 dark:bg-white/5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{selectedKategori.nama}</span>
                  </span>
                </div>
              )}
            </div>

            <div>
              <FieldLabel className="mb-1.5 block">
                <span className="flex items-center gap-1.5">
                  <IconDimensions size={12} />
                  Dimensi Gambar
                </span>
              </FieldLabel>

              <div className="grid grid-cols-2 gap-3">
                <input
                  value={width}
                  disabled
                  readOnly
                  className={cn(inputBase, 'bg-muted/40')}
                  placeholder="Lebar otomatis"
                />

                <input
                  value={height}
                  disabled
                  readOnly
                  className={cn(inputBase, 'bg-muted/40')}
                  placeholder="Tinggi otomatis"
                />
              </div>

              <p className="mt-1 text-[10px] text-muted-foreground">
                Dimensi diambil otomatis dari gambar dan tidak dapat diubah manual.
              </p>
            </div>

            {isDirty && (
              <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Perubahan
                </p>

                {imageFile && (
                  <div className="flex items-center gap-2 text-xs">
                    <IconLink size={11} className="shrink-0 text-muted-foreground" />

                    <span className="text-muted-foreground">Gambar baru:</span>

                    <span className="max-w-40 truncate font-medium text-foreground">
                      {imageFile.name}
                    </span>
                  </div>
                )}

                {judul.trim() !== (galeri.judul ?? '') && (
                  <div className="flex items-center gap-2 text-xs">
                    <IconFileDescription size={11} className="shrink-0 text-muted-foreground" />

                    <span className="line-through opacity-60">{galeri.judul || '(kosong)'}</span>

                    <span className="text-muted-foreground">→</span>

                    <span className="font-medium text-foreground">{judul.trim()}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-6 py-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
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
