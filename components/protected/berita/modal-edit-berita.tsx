'use client'

import * as React from 'react'
import { useState, useCallback, useRef, useEffect } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  X,
  FileText,
  Image as ImageIcon,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Megaphone,
  Newspaper,
  Calendar,
  RotateCcw,
  Bold,
  Italic,
  List,
  Quote,
  Heading2,
  Upload,
  Link,
  Lock,
  Unlock,
  Trash2,
  BookOpen,
  Save,
} from 'lucide-react'
import {
  updateBeritaWithImage,
  uploadGambar,
  type BeritaKategori,
  type Berita,
  type Status,
} from '@/lib/berita'
import { toast } from 'sonner'
import Image from 'next/image'

// ─── Utils ────────────────────────────────────────────────────────────────────

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '')
}

function estimateReadTime(text: string): number {
  const charCount = text.trim().length
  const minutes = charCount / 1000
  return Math.max(1, Math.ceil(minutes))
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function FieldLabel({
  children,
  required,
  htmlFor,
}: {
  children: React.ReactNode
  required?: boolean
  htmlFor?: string
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-semibold text-foreground mb-1.5 select-none"
    >
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1.5 text-xs text-destructive mt-1.5">
      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
      {message}
    </p>
  )
}

function CharCount({ current, max }: { current: number; max: number }) {
  const pct = current / max
  return (
    <span
      className={cn(
        'text-xs tabular-nums',
        pct > 0.9
          ? 'text-destructive'
          : pct > 0.75
            ? 'text-yellow-600 dark:text-yellow-400'
            : 'text-muted-foreground'
      )}
    >
      {current}/{max}
    </span>
  )
}

const inputBase =
  'w-full border border-border rounded-lg px-3.5 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground transition-colors duration-200'

// ─── Step 1: Informasi Dasar ──────────────────────────────────────────────────

interface Step1Props {
  judul: string
  slug: string
  slugLocked: boolean
  kategori: string
  kategoriList: BeritaKategori[]
  errors: Partial<Record<string, string>>
  onChange: (field: string, value: string | boolean) => void
  onToggleSlugLock: () => void
  onRegenerateSlug: () => void
}

function Step1({
  judul,
  slug,
  slugLocked,
  kategori,
  kategoriList,
  errors,
  onChange,
  onToggleSlugLock,
  onRegenerateSlug,
}: Step1Props) {
  return (
    <div className="space-y-5">
      {/* Judul */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <FieldLabel required htmlFor="edit-judul">
            Judul Berita
          </FieldLabel>
          <CharCount current={judul.length} max={120} />
        </div>
        <input
          id="edit-judul"
          maxLength={120}
          placeholder="Masukkan judul berita yang menarik..."
          value={judul}
          onChange={(e) => onChange('judul', e.target.value)}
          className={cn(inputBase, errors.judul ? 'border-destructive' : '')}
        />
        <FieldError message={errors.judul} />
      </div>

      {/* Slug */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <FieldLabel required htmlFor="edit-slug">
            URL Slug
          </FieldLabel>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRegenerateSlug}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Generate ulang
            </button>
            <button
              type="button"
              onClick={onToggleSlugLock}
              title={slugLocked ? 'Klik untuk edit manual' : 'Klik untuk kunci'}
              className={cn(
                'flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border transition-colors',
                slugLocked
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'text-muted-foreground border-border hover:border-primary/40'
              )}
            >
              {slugLocked ? (
                <>
                  <Lock className="h-3 w-3" /> Terkunci
                </>
              ) : (
                <>
                  <Unlock className="h-3 w-3" /> Manual
                </>
              )}
            </button>
          </div>
        </div>
        <div
          className={cn(
            'flex items-center rounded-lg border bg-background overflow-hidden',
            errors.slug ? 'border-destructive' : 'border-border'
          )}
        >
          <span className="px-3 py-2.5 text-xs text-muted-foreground border-r border-border bg-muted/50 shrink-0 select-none whitespace-nowrap">
            /berita/
          </span>
          <input
            id="edit-slug"
            value={slug}
            readOnly={slugLocked}
            onChange={(e) => onChange('slug', generateSlug(e.target.value))}
            className="flex-1 px-3 py-2.5 text-sm bg-transparent text-foreground placeholder:text-muted-foreground"
            placeholder="url-berita-anda"
          />
        </div>
        <FieldError message={errors.slug} />
      </div>

      {/* Kategori */}
      <div>
        <FieldLabel required>Kategori</FieldLabel>
        {kategoriList.length === 0 ? (
          <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat kategori...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {kategoriList.map((k) => {
              const active = kategori === k.nama
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => onChange('kategori', k.nama)}
                  className={cn(
                    'flex items-center justify-center py-3 px-2 rounded-xl border text-sm font-medium transition-all duration-200',
                    active
                      ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                      : 'border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <span className="text-xs font-semibold">{k.nama}</span>
                </button>
              )
            })}
          </div>
        )}
        <FieldError message={errors.kategori} />
      </div>
    </div>
  )
}

// ─── Step 2: Konten ───────────────────────────────────────────────────────────

interface Step2Props {
  ringkasan: string
  konten: string
  errors: Partial<Record<string, string>>
  onChange: (field: string, value: string) => void
}

const toolbarButtons = [
  { icon: <Heading2 className="h-4 w-4" />, label: 'Heading', prefix: '## ', suffix: '' },
  { icon: <Bold className="h-4 w-4" />, label: 'Bold', prefix: '**', suffix: '**' },
  { icon: <Italic className="h-4 w-4" />, label: 'Italic', prefix: '_', suffix: '_' },
  { icon: <List className="h-4 w-4" />, label: 'List', prefix: '- ', suffix: '' },
  { icon: <Quote className="h-4 w-4" />, label: 'Quote', prefix: '> ', suffix: '' },
]

function Step2({ ringkasan, konten, errors, onChange }: Step2Props) {
  const kontenRef = useRef<HTMLTextAreaElement>(null)

  const insertMarkdown = useCallback(
    (prefix: string, suffix: string) => {
      const el = kontenRef.current
      if (!el) return
      const start = el.selectionStart
      const end = el.selectionEnd
      const selected = konten.slice(start, end)
      const before = konten.slice(0, start)
      const after = konten.slice(end)
      const newVal = `${before}${prefix}${selected}${suffix}${after}`
      onChange('konten', newVal)
      setTimeout(() => {
        el.focus()
        el.setSelectionRange(start + prefix.length, end + prefix.length)
      }, 0)
    },
    [konten, onChange]
  )

  const readTime = estimateReadTime(konten)

  return (
    <div className="space-y-5">
      {/* Ringkasan */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <FieldLabel required htmlFor="edit-ringkasan">
            Ringkasan / Excerpt
          </FieldLabel>
          <CharCount current={ringkasan.length} max={250} />
        </div>
        <textarea
          id="edit-ringkasan"
          rows={3}
          maxLength={250}
          placeholder="Tuliskan ringkasan singkat yang menarik perhatian pembaca..."
          value={ringkasan}
          onChange={(e) => onChange('ringkasan', e.target.value)}
          className={cn(inputBase, 'resize-none', errors.ringkasan ? 'border-destructive' : '')}
        />
        <FieldError message={errors.ringkasan} />
      </div>

      {/* Konten */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <FieldLabel required htmlFor="edit-konten">
            Konten Berita
          </FieldLabel>
          <div className="flex items-center gap-3">
            {konten.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />~{readTime} menit
              </span>
            )}
            <CharCount current={konten.length} max={50000} />
          </div>
        </div>

        {/* Markdown toolbar */}
        <div className="flex items-center gap-0.5 px-2 py-1.5 border border-b-0 border-border rounded-t-lg bg-muted/40">
          {toolbarButtons.map((btn) => (
            <button
              key={btn.label}
              type="button"
              title={btn.label}
              onClick={() => insertMarkdown(btn.prefix, btn.suffix)}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {btn.icon}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground px-2 select-none">Markdown</span>
        </div>

        <textarea
          ref={kontenRef}
          id="edit-konten"
          rows={12}
          maxLength={50000}
          placeholder={`Tulis konten berita di sini...\n\n## Heading\n**bold** atau _italic_\n- bullet list\n> blockquote`}
          value={konten}
          onChange={(e) => onChange('konten', e.target.value)}
          className={cn(
            inputBase,
            'rounded-t-none resize-y font-mono leading-relaxed',
            errors.konten ? 'border-destructive' : ''
          )}
        />
        <FieldError message={errors.konten} />
      </div>
    </div>
  )
}

// ─── Step 3: Media ────────────────────────────────────────────────────────────
const ALLOWED_MIME = ['image/png', 'image/jpeg']
const ALLOWED_LABEL = 'PNG atau JPG'
const MAX_SIZE_BYTES = 1 * 1024 * 1024 // 1 MB
const MAX_SIZE_LABEL = '1 MB'

interface Step3Props {
  thumbnail: string
  thumbnailFile: File | null
  errors: Partial<Record<string, string>>
  onThumbnailUrlChange: (url: string) => void
  onThumbnailFileChange: (file: File | null) => void
  onFileError: (message: string | null) => void // ← tambah prop ini
}

function Step3({
  thumbnail,
  thumbnailFile,
  errors,
  onThumbnailUrlChange,
  onThumbnailFileChange,
  onFileError,
}: Step3Props) {
  const [mode, setMode] = useState<'url' | 'upload'>('url')
  const fileRef = useRef<HTMLInputElement>(null)
  const [previewError, setPreviewError] = useState(false)

  const previewSrc = thumbnailFile ? URL.createObjectURL(thumbnailFile) : thumbnail
  function validateAndSetFile(file: File | null) {
    if (!file) {
      onThumbnailFileChange(null)
      onFileError(null)
      return
    }

    if (!ALLOWED_MIME.includes(file.type)) {
      const message = `Format tidak didukung: ${file.type || 'unknown'}. Gunakan ${ALLOWED_LABEL}.`

      onFileError(message)
      onThumbnailFileChange(null)

      toast.error(message, {
        duration: 5000,
      })

      return
    }

    if (file.size > MAX_SIZE_BYTES) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2)
      const message = `File terlalu besar (${sizeMB} MB). Maksimal ${MAX_SIZE_LABEL}.`

      onFileError(message)
      onThumbnailFileChange(null)

      toast.error(message, {
        duration: 5000,
      })

      return
    }

    onFileError(null)
    onThumbnailFileChange(file)
    onThumbnailUrlChange('')
    setPreviewError(false)
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0] ?? null
    validateAndSetFile(file)
  }

  // Auto-switch ke tab upload jika sudah ada file (untuk edit modal)
  useEffect(() => {
    if (thumbnailFile) setMode('upload')
  }, [thumbnailFile])

  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>Thumbnail Berita</FieldLabel>

        {/* Mode toggle */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-4 w-fit">
          {(
            [
              { key: 'url', label: 'URL', icon: <Link className="h-3.5 w-3.5" /> },
              { key: 'upload', label: 'Upload File', icon: <Upload className="h-3.5 w-3.5" /> },
            ] as const
          ).map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                mode === m.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'url' ? (
          <div className="flex items-center rounded-lg border border-border bg-background overflow-hidden">
            <ImageIcon className="h-4 w-4 text-muted-foreground ml-3.5 shrink-0" />
            <input
              type="url"
              placeholder="https://example.com/gambar.jpg"
              value={thumbnail}
              onChange={(e) => {
                onThumbnailUrlChange(e.target.value)
                onThumbnailFileChange(null)
                setPreviewError(false)
              }}
              className="flex-1 px-3 py-2.5 text-sm bg-transparent text-foreground placeholder:text-muted-foreground"
            />
          </div>
        ) : (
          <div
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className={cn(
              'flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed border-border rounded-xl bg-muted/30',
              'cursor-pointer hover:border-primary/40 hover:bg-muted/50 transition-colors'
            )}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              className="hidden"
              onChange={(e) => {
                validateAndSetFile(e.target.files?.[0] ?? null)
                // reset input value agar file yang sama bisa dipilih ulang
                e.target.value = ''
              }}
            />
            <div className="p-3 rounded-full bg-background border border-border">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {thumbnailFile ? thumbnailFile.name : 'Klik atau drag & drop'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {thumbnailFile
                  ? `${(thumbnailFile.size / 1024 / 1024).toFixed(2)} MB`
                  : 'PNG, JPG, WEBP hingga 10MB'}
              </p>
            </div>
          </div>
        )}

        <FieldError message={errors.thumbnail} />

        {/* Preview */}
        {previewSrc && !previewError && (
          <div className="mt-3 relative rounded-xl border border-border overflow-hidden bg-muted h-48 group">
            <Image
              src={previewSrc}
              alt="Preview thumbnail"
              fill
              className="object-cover"
              onError={() => setPreviewError(true)}
            />

            <button
              type="button"
              onClick={() => {
                onThumbnailUrlChange('')
                onThumbnailFileChange(null)
                setPreviewError(false)
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 border border-border text-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-10">
              <p className="text-xs text-white font-medium">Pratinjau Thumbnail</p>
            </div>
          </div>
        )}
      </div>

      {/* Info waktu baca */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/30">
        <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Estimasi Waktu Baca Otomatis</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Waktu baca dihitung otomatis dari panjang konten (~200 kata/menit, rata-rata 5
            karakter/kata = 1.000 karakter/menit). Tidak perlu diisi manual.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Step 4: Publikasi ────────────────────────────────────────────────────────

interface Step4Props {
  status: Status
  tanggalDiterbitkan: string
  judul: string
  slug: string
  kategoriNama: string
  ringkasan: string
  konten: string
  waktuBaca: number
  onChange: (field: string, value: string) => void
}

function Step4({
  status,
  tanggalDiterbitkan,
  judul,
  slug,
  kategoriNama,
  ringkasan,
  konten,
  waktuBaca,
  onChange,
}: Step4Props) {
  const today = new Date().toISOString().slice(0, 16)

  return (
    <div className="space-y-5">
      {/* Status */}
      <div>
        <FieldLabel>Status Publikasi</FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              value: 'published' as Status,
              label: 'Published',
              desc: 'Langsung tayang setelah disimpan',
              icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
              activeClass:
                'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-200 dark:ring-emerald-800',
            },
            {
              value: 'draft' as Status,
              label: 'Draft',
              desc: 'Disimpan tapi belum ditampilkan',
              icon: <FileText className="h-5 w-5 text-muted-foreground" />,
              activeClass: 'border-border bg-muted ring-2 ring-border',
            },
          ].map((s) => {
            const active = status === s.value
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => onChange('status', s.value)}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200',
                  active ? s.activeClass : 'border-border hover:bg-muted/50'
                )}
              >
                <div className="mt-0.5 shrink-0">{s.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Jadwal */}
      <div>
        <FieldLabel htmlFor="edit-tanggalDiterbitkan">
          Jadwal Penerbitan <span className="text-muted-foreground font-normal">(opsional)</span>
        </FieldLabel>
        <p className="text-xs text-muted-foreground mb-2">
          Biarkan kosong untuk langsung terbit saat disimpan.
        </p>
        <input
          id="edit-tanggalDiterbitkan"
          type="datetime-local"
          min={today}
          value={tanggalDiterbitkan}
          onChange={(e) => onChange('tanggalDiterbitkan', e.target.value)}
          className={inputBase}
        />
      </div>

      {/* Preview card */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
        <p className="text-xs font-bold text-foreground uppercase tracking-widest">
          Pratinjau Berita
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-border bg-muted/50 text-foreground">
              {kategoriNama || <span className="text-muted-foreground italic">Belum dipilih</span>}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {waktuBaca} menit baca
            </span>
            <span
              className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                status === 'published'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {status}
            </span>
          </div>
          <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2">
            {judul || (
              <span className="text-muted-foreground font-normal italic">Judul belum diisi</span>
            )}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {ringkasan || <span className="italic">Ringkasan belum diisi</span>}
          </p>
          <p className="text-xs text-primary/70 font-mono">/berita/{slug || '...'}</p>
          <p className="text-xs text-muted-foreground">
            {konten.length.toLocaleString('id')} karakter ·{' '}
            {konten.trim().split(/\s+/).filter(Boolean).length.toLocaleString('id')} kata
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'p-2 rounded-full shrink-0',
              variant === 'danger'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-primary/10 text-primary'
            )}
          >
            {variant === 'danger' ? (
              <Trash2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold transition-opacity',
              variant === 'danger'
                ? 'bg-destructive text-destructive-foreground hover:opacity-90'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModalEditBeritaProps {
  open: boolean
  onClose: () => void
  /** Berita yang sedang diedit — diisi dari parent */
  berita: Berita
  /** Dipanggil setelah update berhasil — parent update state list-nya */
  onUpdate: (berita: Berita) => void
  /** Daftar kategori dari DB */
  kategoris: BeritaKategori[]
}

type FormData = {
  judul: string
  slug: string
  slugLocked: boolean
  kategori: string // nama kategori
  ringkasan: string
  konten: string
  thumbnail: string
  thumbnailFile: File | null
  thumbnailError: string | null
  status: Status
  tanggalDiterbitkan: string
}

type FormErrors = Partial<Record<string, string>>

const STEPS = [
  { label: 'Info', fullLabel: 'Informasi Dasar' },
  { label: 'Konten', fullLabel: 'Konten Berita' },
  { label: 'Media', fullLabel: 'Media' },
  { label: 'Publikasi', fullLabel: 'Pengaturan Publikasi' },
]

/** Inisialisasi form dari data Berita yang ada */
function makeFormFromBerita(berita: Berita, kategoris: BeritaKategori[]): FormData {
  const kategoriNama = kategoris.find((k) => k.id === berita.kategori_id)?.nama ?? ''
  return {
    judul: berita.judul ?? '',
    slug: berita.slug ?? '',
    slugLocked: true,
    kategori: kategoriNama,
    ringkasan: berita.ringkasan ?? '',
    konten: berita.konten ?? '',
    thumbnail: berita.gambar ?? '',
    thumbnailFile: null,
    status: berita.status ?? 'draft',
    thumbnailError: null,
    tanggalDiterbitkan: berita.tanggal_diterbitkan
      ? new Date(berita.tanggal_diterbitkan).toISOString().slice(0, 16)
      : '',
  }
}

function validateStep(s: number, form: FormData): FormErrors {
  const errors: FormErrors = {}
  if (s === 1) {
    if (!form.judul.trim()) errors.judul = 'Judul tidak boleh kosong'
    else if (form.judul.length < 5) errors.judul = 'Judul minimal 5 karakter'
    if (!form.slug.trim()) errors.slug = 'Slug tidak boleh kosong'
    if (!form.kategori) errors.kategori = 'Pilih kategori terlebih dahulu'
  }
  if (s === 2) {
    if (!form.ringkasan.trim()) errors.ringkasan = 'Ringkasan tidak boleh kosong'
    if (!form.konten.trim()) errors.konten = 'Konten tidak boleh kosong'
    else if (form.konten.length < 50) errors.konten = 'Konten minimal 50 karakter'
  }
  if (s === 3) {
    if (!form.thumbnail.trim() && !form.thumbnailFile) {
      errors.thumbnail = 'Thumbnail wajib diisi (URL atau upload file)'
    }
  }
  return errors
}

function getCompletedSteps(form: FormData): number[] {
  const done: number[] = []
  if (Object.keys(validateStep(1, form)).length === 0) done.push(1)
  if (done.includes(1) && Object.keys(validateStep(2, form)).length === 0) done.push(2)
  if (done.includes(2) && Object.keys(validateStep(3, form)).length === 0) done.push(3)
  if (done.includes(3)) done.push(4)
  return done
}

/** Deteksi apakah ada perubahan dari data awal */
function hasChanges(form: FormData, original: FormData): boolean {
  return (
    form.judul !== original.judul ||
    form.slug !== original.slug ||
    form.kategori !== original.kategori ||
    form.ringkasan !== original.ringkasan ||
    form.konten !== original.konten ||
    form.thumbnail !== original.thumbnail ||
    form.thumbnailFile !== null ||
    form.status !== original.status ||
    form.tanggalDiterbitkan !== original.tanggalDiterbitkan
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function ModalEditBerita({
  open,
  onClose,
  berita,
  onUpdate,
  kategoris,
}: ModalEditBeritaProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(() => makeFormFromBerita(berita, kategoris))
  const [originalForm, setOriginalForm] = useState<FormData>(() =>
    makeFormFromBerita(berita, kategoris)
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [pendingCloseAction, setPendingCloseAction] = useState<(() => void) | null>(null)

  // Reset form setiap kali modal dibuka dengan berita yang (mungkin) berbeda
  useEffect(() => {
    if (open) {
      const initial = makeFormFromBerita(berita, kategoris)
      setStep(1)
      setForm(initial)
      setOriginalForm(initial)
      setErrors({})
      setSaveError(null)
    }
  }, [open, berita, kategoris])

  const isDirty = hasChanges(form, originalForm)

  const handleClose = () => {
    setStep(1)
    setErrors({})
    setSaveError(null)
    onClose()
  }

  const requestClose = (source: 'overlay' | 'button' | 'save') => {
    if (source === 'save') {
      handleClose()
      return
    }
    if (isDirty) {
      setPendingCloseAction(() => () => handleClose())
      setShowCloseConfirm(true)
    } else {
      handleClose()
    }
  }

  const handleFileError = (message: string | null) => {
    setErrors((prev) => ({
      ...prev,
      thumbnail: message || undefined,
    }))
  }

  const handleChange = (field: string, value: string | boolean | number | File | null) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      // Jika judul berubah dan slug tidak di-lock manual, auto-update slug
      if (field === 'judul' && prev.slugLocked) {
        next.slug = generateSlug(value as string)
      }
      return next
    })
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const navigateTo = (target: number) => {
    if (target < step) {
      setErrors({})
      setStep(target)
      return
    }
    for (let s = step; s < target; s++) {
      const errs = validateStep(s, form)
      if (Object.keys(errs).length) {
        setErrors(errs)
        setStep(s)
        return
      }
    }
    setErrors({})
    setStep(target)
  }

  const nextStep = () => navigateTo(step + 1)
  const prevStep = () => navigateTo(step - 1)

  // ── Update ke Supabase ──────────────────────────────────────────────────────

  const handleSave = async () => {
    // Validasi step 1 - 3
    for (let s = 1; s <= 3; s++) {
      const errs = validateStep(s, form)
      if (Object.keys(errs).length) {
        setErrors(errs)
        setStep(s)
        return
      }
    }

    if (form.thumbnailError) {
      setStep(3)
      return
    }

    // Resolve kategori nama → UUID
    const kategoriObj = kategoris.find((k) => k.nama === form.kategori)
    if (!kategoriObj) {
      setErrors({ kategori: 'Kategori tidak valid' })
      setStep(1)
      return
    }

    setSaving(true)
    setSaveError(null)

    try {
      const waktuBaca = estimateReadTime(form.konten)

      const result = await updateBeritaWithImage(
        berita.id,
        {
          judul: form.judul.trim(),
          slug: form.slug.trim() || generateSlug(form.judul),
          konten: form.konten.trim(),
          ringkasan: form.ringkasan.trim(),
          gambar: form.thumbnailFile ? null : form.thumbnail || null,
          waktu_baca: waktuBaca,
          status: form.status,
          kategori_id: kategoriObj.id,
          ...(form.tanggalDiterbitkan
            ? { tanggal_diterbitkan: new Date(form.tanggalDiterbitkan).toISOString() }
            : {}),
        },
        form.thumbnailFile,
        originalForm.thumbnail
      )

      onUpdate(result)
      toast.success('Berita berhasil diperbarui', {
        description: `Status: ${form.status === 'published' ? 'Dipublikasikan' : 'Draft'} • ${form.kategori}`,
        duration: 3000,
      })
      requestClose('save')
    } catch (e: unknown) {
      toast.error('Gagal memperbarui berita', {
        description:
          e instanceof Error ? e.message : 'Terjadi kesalahan pada server. Silakan coba lagi.',
        duration: 5000,
      })
      setSaveError(e instanceof Error ? e.message : 'Gagal memperbarui berita. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  const completedSteps = getCompletedSteps(form)

  return (
    <>
      <DialogPrimitive.Root
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen && open) requestClose('overlay')
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />
          <DialogPrimitive.Content
            onInteractOutside={(e) => {
              e.preventDefault()
              requestClose('overlay')
            }}
            onEscapeKeyDown={(e) => {
              e.preventDefault()
              requestClose('button')
            }}
            className={cn(
              'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
              'w-full max-w-2xl max-h-[92vh] flex flex-col',
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
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border shrink-0">
              <div className="min-w-0 flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <DialogPrimitive.Title className="text-base font-bold text-foreground">
                    Edit Berita
                  </DialogPrimitive.Title>
                  {isDirty && (
                    <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Ada perubahan
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {STEPS[step - 1].fullLabel} · <span className="font-mono">{berita.slug}</span>
                </p>
              </div>
              <DialogPrimitive.Close
                onClick={() => requestClose('button')}
                className="rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors p-1.5 shrink-0"
                title="Tutup"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Tutup</span>
              </DialogPrimitive.Close>
            </div>

            {/* Step Navigator */}
            <div className="px-6 pt-4 pb-2 shrink-0">
              <div className="flex items-start">
                {STEPS.map((s, i) => {
                  const num = i + 1
                  const isActive = step === num
                  const isDone = completedSteps.includes(num) && !isActive
                  const isReachable = num < step || num === step || completedSteps.includes(num - 1)
                  const isLast = i === STEPS.length - 1

                  return (
                    <React.Fragment key={s.label}>
                      <button
                        type="button"
                        disabled={!isReachable}
                        onClick={() => isReachable && navigateTo(num)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 group transition-all duration-200 select-none flex-none',
                          isReachable ? 'cursor-pointer' : 'cursor-default'
                        )}
                      >
                        <div
                          className={cn(
                            'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-200',
                            isActive
                              ? 'border-primary bg-primary text-primary-foreground scale-110 shadow-sm'
                              : isDone
                                ? 'border-primary bg-primary/10 text-primary'
                                : isReachable
                                  ? 'border-border bg-background text-muted-foreground group-hover:border-primary/50 group-hover:text-primary/70'
                                  : 'border-border bg-background text-muted-foreground/50'
                          )}
                        >
                          {isDone ? <CheckCircle2 className="h-4 w-4" /> : num}
                        </div>
                        <span
                          className={cn(
                            'text-xs font-medium transition-colors hidden sm:block',
                            isActive
                              ? 'text-foreground'
                              : isDone
                                ? 'text-primary'
                                : 'text-muted-foreground'
                          )}
                        >
                          {s.label}
                        </span>
                      </button>
                      {!isLast && (
                        <div className="flex-1 h-0.5 mx-2 mt-4 rounded-full overflow-hidden bg-border">
                          <div
                            className="h-full bg-primary transition-all duration-500 rounded-full"
                            style={{ width: completedSteps.includes(num) ? '100%' : '0%' }}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
              {/* Save error banner */}
              {saveError && (
                <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {saveError}
                </div>
              )}

              {step === 1 && (
                <Step1
                  judul={form.judul}
                  slug={form.slug}
                  slugLocked={form.slugLocked}
                  kategori={form.kategori}
                  kategoriList={kategoris}
                  errors={errors}
                  onChange={handleChange}
                  onToggleSlugLock={() => setForm((f) => ({ ...f, slugLocked: !f.slugLocked }))}
                  onRegenerateSlug={() => setForm((f) => ({ ...f, slug: generateSlug(f.judul) }))}
                />
              )}
              {step === 2 && (
                <Step2
                  ringkasan={form.ringkasan}
                  konten={form.konten}
                  errors={errors}
                  onChange={handleChange}
                />
              )}
              {step === 3 && (
                <Step3
                  thumbnail={form.thumbnail}
                  thumbnailFile={form.thumbnailFile}
                  errors={errors}
                  onThumbnailUrlChange={(url) => handleChange('thumbnail', url)}
                  onThumbnailFileChange={(file) => handleChange('thumbnailFile', file)}
                  onFileError={handleFileError}
                />
              )}
              {step === 4 && (
                <Step4
                  status={form.status}
                  tanggalDiterbitkan={form.tanggalDiterbitkan}
                  judul={form.judul}
                  slug={form.slug}
                  kategoriNama={form.kategori}
                  ringkasan={form.ringkasan}
                  konten={form.konten}
                  waktuBaca={estimateReadTime(form.konten)}
                  onChange={handleChange}
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border shrink-0 bg-muted/20">
              <button
                type="button"
                onClick={step === 1 ? () => requestClose('button') : prevStep}
                disabled={saving}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium transition-colors disabled:opacity-50',
                  isDirty && step === 1
                    ? 'text-destructive hover:bg-destructive/10 border-destructive/30'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                {step === 1 ? (
                  <>
                    <X className="h-3.5 w-3.5" />
                    Batal
                  </>
                ) : (
                  <>
                    <span>←</span> Sebelumnya
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                {/* Tombol simpan cepat dari step manapun (hanya muncul jika ada perubahan) */}
                {isDirty && step < STEPS.length && (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-primary/30 bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
                    title="Simpan perubahan sekarang"
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Simpan
                  </button>
                )}

                {step < STEPS.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Selanjutnya →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* Confirm discard Dialog */}
      <ConfirmDialog
        open={showCloseConfirm}
        title="Tutup Tanpa Menyimpan?"
        description="Ada perubahan yang belum disimpan. Menutup modal akan membuang semua perubahan tersebut."
        confirmText="Ya, Buang Perubahan"
        cancelText="Lanjut Edit"
        variant="danger"
        onConfirm={() => {
          setShowCloseConfirm(false)
          toast.warning('Perubahan dibuang', {
            description: 'Perubahan yang belum disimpan telah dihapus.',
          })
          if (pendingCloseAction) {
            pendingCloseAction()
            setPendingCloseAction(null)
          }
        }}
        onCancel={() => {
          setShowCloseConfirm(false)
          setPendingCloseAction(null)
        }}
      />
    </>
  )
}
