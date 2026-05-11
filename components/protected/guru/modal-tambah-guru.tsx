'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  IconPlus,
  IconX,
  IconCheck,
  IconLoader2,
  IconUser,
  IconLink,
  IconBriefcase,
  IconAlertCircle,
  IconEye,
  IconPhoto,
} from '@tabler/icons-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { insertGuru, type Guru } from '@/lib/guru'
import Image from 'next/image'

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

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModalTambahGuruProps {
  open: boolean
  onClose: () => void
  onSave: (guru: Guru) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ModalTambahGuru({ open, onClose, onSave }: ModalTambahGuruProps) {
  const [nama, setNama] = useState('')
  const [jabatan, setJabatan] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [previewError, setPreviewError] = useState(false)
  const [error, setError] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setNama('')
      setJabatan('')
      setImageUrl('')
      setSaving(false)
      setPreviewError(false)
      setError({})
    }
  }, [open])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!nama.trim()) errs.nama = 'Nama guru tidak boleh kosong'
    else if (nama.trim().length > 100) errs.nama = 'Nama maksimal 100 karakter'
    if (jabatan.trim().length > 100) errs.jabatan = 'Jabatan maksimal 100 karakter'
    if (imageUrl.trim() && !/^https?:\/\/.+/.test(imageUrl.trim()))
      errs.imageUrl = 'URL foto tidak valid'
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
      const result = await insertGuru({
        nama: nama.trim(),
        jabatan: jabatan.trim() || null,
        image_url: imageUrl.trim() || null,
      })

      onSave(result)
      toast.success('Guru berhasil ditambahkan', {
        description: `"${result.nama}" telah ditambahkan ke daftar guru.`,
        duration: 3000,
      })
      onClose()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Terjadi kesalahan pada server.'
      setError({ nama: msg })
      toast.error('Gagal menambahkan guru', { description: msg, duration: 5000 })
    } finally {
      setSaving(false)
    }
  }

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
                <IconPlus size={18} className="text-primary" />
              </div>
              <div>
                <DialogPrimitive.Title className="text-base font-bold text-foreground">
                  Tambah Guru
                </DialogPrimitive.Title>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tambah data guru baru ke daftar
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
                <FieldLabel required htmlFor="tambah-nama">
                  <span className="flex items-center gap-1.5">
                    <IconUser size={12} /> Nama Guru
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
                id="tambah-nama"
                type="text"
                maxLength={100}
                placeholder="Contoh: Budi Santoso, S.Pd."
                value={nama}
                onChange={(e) => {
                  setNama(e.target.value)
                  setError((p) => ({ ...p, nama: undefined as unknown as string }))
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
                <FieldLabel htmlFor="tambah-jabatan">
                  <span className="flex items-center gap-1.5">
                    <IconBriefcase size={12} /> Jabatan{' '}
                    <span className="text-muted-foreground font-normal">(Opsional)</span>
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
                id="tambah-jabatan"
                type="text"
                maxLength={100}
                placeholder="Contoh: Guru Matematika / Kepala Sekolah"
                value={jabatan}
                onChange={(e) => {
                  setJabatan(e.target.value)
                  setError((p) => ({ ...p, jabatan: undefined as unknown as string }))
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

            {/* Image URL */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <FieldLabel htmlFor="tambah-image-url">
                  <span className="flex items-center gap-1.5">
                    <IconLink size={12} /> URL Foto Profil{' '}
                    <span className="text-muted-foreground font-normal">(Opsional)</span>
                  </span>
                </FieldLabel>
              </div>
              <input
                id="tambah-image-url"
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
                  error.imageUrl
                    ? 'border-destructive focus:ring-destructive/20 focus:border-destructive'
                    : ''
                )}
              />
              <FieldError message={error.imageUrl} />
            </div>

            {/* Image Preview */}
            {showPreview && (
              <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
                  <IconEye size={12} className="text-muted-foreground" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Pratinjau Foto Profil
                  </span>
                </div>
                {!previewError ? (
                  <div className="relative w-full h-48 bg-muted/50 flex items-center justify-center overflow-hidden">
                    <Image
                      src={imageUrl.trim()}
                      alt="preview"
                      fill
                      className="object-contain"
                      onError={() => setPreviewError(true)}
                    />
                  </div>
                ) : (
                  <div className="h-32 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <IconPhoto size={28} className="opacity-40" />
                    <p className="text-xs">Gagal memuat pratinjau foto</p>
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
              disabled={saving || !nama.trim()}
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
                  Simpan Guru
                </>
              )}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
