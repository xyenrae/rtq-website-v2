'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  IconEdit,
  IconX,
  IconCheck,
  IconLoader2,
  IconUser,
  IconLink,
  IconBriefcase,
  IconAlertCircle,
} from '@tabler/icons-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'

import { updateGuru, type Guru } from '@/lib/guru'

import { ImageUploader } from '@/components/image-uploader'

// ─── Reusable UI ─────────────────────────────────────────────────────────────

function FieldLabel({
  children,
  required,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label {...props} className={cn('text-xs font-semibold text-foreground', props.className)}>
      <span className="flex items-center gap-1">
        {children}

        {required && (
          <span className="text-destructive text-sm font-bold" title="Wajib diisi">
            *
          </span>
        )}
      </span>
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

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ModalEditGuruProps {
  open: boolean
  onClose: () => void
  guru: Guru
  onUpdate: (guru: Guru) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ModalEditGuru({ open, onClose, guru, onUpdate }: ModalEditGuruProps) {
  const [nama, setNama] = useState(guru.nama ?? '')
  const [jabatan, setJabatan] = useState(guru.jabatan ?? '')

  const [imageUrl, setImageUrl] = useState(guru.image_url ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [saving, setSaving] = useState(false)

  const [error, setError] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setNama(guru.nama ?? '')
      setJabatan(guru.jabatan ?? '')

      setImageUrl(guru.image_url ?? '')
      setImageFile(null)

      setSaving(false)
      setError({})
    }
  }, [open, guru])

  const validate = () => {
    const errs: Record<string, string> = {}

    // Nama wajib
    if (!nama.trim()) {
      errs.nama = 'Nama guru wajib diisi'
    } else if (nama.trim().length > 100) {
      errs.nama = 'Nama maksimal 100 karakter'
    }

    // Jabatan wajib
    if (!jabatan.trim()) {
      errs.jabatan = 'Jabatan wajib diisi'
    } else if (jabatan.trim().length > 100) {
      errs.jabatan = 'Jabatan maksimal 100 karakter'
    }

    // Foto wajib
    if (!imageFile && !imageUrl.trim()) {
      errs.imageUrl = 'Foto profil wajib diisi'
    }

    // Validasi URL
    if (imageUrl.trim() && !imageFile && !/^https?:\/\/.+/.test(imageUrl.trim())) {
      errs.imageUrl = 'URL foto tidak valid'
    }

    return errs
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
      const result = await updateGuru(
        guru.id,
        {
          nama: nama.trim(),
          jabatan: jabatan.trim(),
          image_url: imageFile ? null : imageUrl.trim(),
        },
        imageFile ?? undefined,
        guru.image_url ?? undefined
      )

      onUpdate(result)

      toast.success('Data guru berhasil diperbarui', {
        description: `"${result.nama}" telah diperbarui.`,
        duration: 3000,
      })

      onClose()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Terjadi kesalahan pada server.'

      setError({
        nama: msg,
      })

      toast.error('Gagal memperbarui data guru', {
        description: msg,
        duration: 5000,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && open) {
          onClose()
        }
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
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0">
                <IconEdit size={18} className="text-amber-600 dark:text-amber-400" />
              </div>

              <div>
                <DialogPrimitive.Title className="text-base font-bold text-foreground">
                  Edit Guru
                </DialogPrimitive.Title>

                <p className="text-xs text-muted-foreground mt-0.5">
                  Perbarui data guru &mdash;{' '}
                  <span className="font-medium text-foreground">{guru.nama ?? 'Tanpa nama'}</span>
                </p>
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

          {/* Body */}
          <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
            {/* Nama */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <FieldLabel required htmlFor="edit-nama">
                  <span className="flex items-center gap-1.5">
                    <IconUser size={12} />
                    Nama Guru
                  </span>
                </FieldLabel>

                <span
                  className={cn(
                    'text-xs tabular-nums',
                    nama.length > 90 ? 'text-destructive' : 'text-muted-foreground'
                  )}
                >
                  {nama.length}/100
                </span>
              </div>

              <input
                id="edit-nama"
                type="text"
                maxLength={100}
                placeholder="Contoh: Budi Santoso, S.Pd."
                value={nama}
                onChange={(e) => {
                  setNama(e.target.value)

                  setError((p) => ({
                    ...p,
                    nama: '',
                  }))
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

            {/* Jabatan */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <FieldLabel required htmlFor="edit-jabatan">
                  <span className="flex items-center gap-1.5">
                    <IconBriefcase size={12} />
                    Jabatan
                  </span>
                </FieldLabel>

                <span
                  className={cn(
                    'text-xs tabular-nums',
                    jabatan.length > 90 ? 'text-destructive' : 'text-muted-foreground'
                  )}
                >
                  {jabatan.length}/100
                </span>
              </div>

              <input
                id="edit-jabatan"
                type="text"
                maxLength={100}
                placeholder="Contoh: Guru Matematika / Kepala Sekolah"
                value={jabatan}
                onChange={(e) => {
                  setJabatan(e.target.value)

                  setError((p) => ({
                    ...p,
                    jabatan: '',
                  }))
                }}
                className={cn(
                  inputBase,
                  error.jabatan
                    ? 'border-destructive focus:ring-destructive/20 focus:border-destructive'
                    : ''
                )}
              />

              <FieldError message={error.jabatan} />
            </div>

            {/* Foto Profil */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <FieldLabel required htmlFor="edit-image-url">
                  <span className="flex items-center gap-1.5">
                    <IconLink size={12} />
                    Foto Profil
                  </span>
                </FieldLabel>
              </div>

              <ImageUploader
                currentUrl={guru.image_url ?? undefined}
                urlValue={imageUrl}
                fileValue={imageFile}
                onUrlChange={(url) => {
                  setImageUrl(url)

                  setError((p) => ({
                    ...p,
                    imageUrl: '',
                  }))
                }}
                onFileChange={(file) => {
                  setImageFile(file)

                  if (file) {
                    setImageUrl('')
                  }

                  setError((p) => ({
                    ...p,
                    imageUrl: '',
                  }))
                }}
                error={error.imageUrl}
                disabled={saving}
              />

              <FieldError message={error.imageUrl} />
            </div>
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
              disabled={
                saving || !nama.trim() || !jabatan.trim() || (!imageFile && !imageUrl.trim())
              }
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
                  Perbarui Data
                </>
              )}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
