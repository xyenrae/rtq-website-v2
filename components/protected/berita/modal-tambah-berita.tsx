'use client'

import * as React from 'react'
import { useState, useCallback, useRef, useEffect } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  X,
  FileText,
  Image,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  BookOpen,
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
} from 'lucide-react'

// ─── Utils ────────────────────────────────────────────────────────────────────

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type Kategori = 'Pendidikan' | 'Kegiatan' | 'Pengumuman' | 'Artikel'
export type Status = 'published' | 'draft'

export interface Berita {
  id: number
  judul: string
  slug: string
  kategori: Kategori
  konten: string
  ringkasan: string
  thumbnail: string | null
  waktuBaca: number
  status: Status
  tanggalDibuat: string
  tanggalDiterbitkan: string | null
  views: number
  featured: boolean
}

// ─── Kategori List ────────────────────────────────────────────────────────────

const kategoriList: { value: Kategori; icon: React.ReactNode }[] = [
  { value: 'Pendidikan', icon: <BookOpen className="h-4 w-4" /> },
  { value: 'Kegiatan', icon: <Calendar className="h-4 w-4" /> },
  { value: 'Pengumuman', icon: <Megaphone className="h-4 w-4" /> },
  { value: 'Artikel', icon: <Newspaper className="h-4 w-4" /> },
]

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
  kategori: Kategori
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
          <FieldLabel required htmlFor="judul">
            Judul Berita
          </FieldLabel>
          <CharCount current={judul.length} max={120} />
        </div>
        <input
          id="judul"
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
          <FieldLabel required htmlFor="slug">
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
            id="slug"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {kategoriList.map(({ value }) => {
            const active = kategori === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange('kategori', value)}
                className={cn(
                  'flex items-center justify-center py-3 px-2 rounded-xl border text-sm font-medium transition-all duration-200',
                  active
                    ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                    : 'border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <span className="text-xs font-semibold">{value}</span>
              </button>
            )
          })}
        </div>
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
          <FieldLabel required htmlFor="ringkasan">
            Ringkasan / Excerpt
          </FieldLabel>
          <CharCount current={ringkasan.length} max={250} />
        </div>
        <textarea
          id="ringkasan"
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
          <FieldLabel required htmlFor="konten">
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
          id="konten"
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

interface Step3Props {
  thumbnail: string
  thumbnailFile: File | null
  errors: Partial<Record<string, string>>
  onThumbnailUrlChange: (url: string) => void
  onThumbnailFileChange: (file: File | null) => void
}

function Step3({
  thumbnail,
  thumbnailFile,
  errors,
  onThumbnailUrlChange,
  onThumbnailFileChange,
}: Step3Props) {
  const [mode, setMode] = useState<'url' | 'upload'>('url')
  const fileRef = useRef<HTMLInputElement>(null)
  const [previewError, setPreviewError] = useState(false)

  const previewSrc = thumbnailFile ? URL.createObjectURL(thumbnailFile) : thumbnail

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      onThumbnailFileChange(file)
      onThumbnailUrlChange('')
      setPreviewError(false)
    }
  }

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
            <Image className="h-4 w-4 text-muted-foreground ml-3.5 shrink-0" />
            <input
              type="url"
              placeholder="https://example.com/gambar.jpg  "
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
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null
                onThumbnailFileChange(file)
                onThumbnailUrlChange('')
                setPreviewError(false)
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt="Preview thumbnail"
              className="w-full h-full object-cover"
              onError={() => setPreviewError(true)}
            />
            <button
              type="button"
              onClick={() => {
                onThumbnailUrlChange('')
                onThumbnailFileChange(null)
                setPreviewError(false)
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 border border-border text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none">
              <p className="text-xs text-white font-medium">Pratinjau Thumbnail</p>
            </div>
          </div>
        )}
      </div>

      {/* Waktu baca info */}
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
  kategori: Kategori
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
  kategori,
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
        <FieldLabel htmlFor="tanggalDiterbitkan">
          Jadwal Penerbitan <span className="text-muted-foreground font-normal">(opsional)</span>
        </FieldLabel>
        <p className="text-xs text-muted-foreground mb-2">
          Biarkan kosong untuk langsung terbit saat disimpan.
        </p>
        <input
          id="tanggalDiterbitkan"
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
            <span
              className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full border',
                'border-border bg-muted/50 text-foreground'
              )}
            >
              {kategori}
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

// ─── Confirmation Dialog Component (RENDERED OUTSIDE DIALOG) ─────────────────

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
      {/* Overlay dengan pointer-events agar bisa diklik */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
        onClick={onCancel}
      />
      {/* Dialog content dengan pointer-events agar interaktif */}
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

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface ModalTambahBeritaProps {
  open: boolean
  onClose: () => void
  onSave: (b: Omit<Berita, 'id'>) => Promise<void> | void
}

type FormData = {
  judul: string
  slug: string
  slugLocked: boolean
  kategori: Kategori
  ringkasan: string
  konten: string
  thumbnail: string
  thumbnailFile: File | null
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

const defaultForm: FormData = {
  judul: '',
  slug: '',
  slugLocked: true,
  kategori: 'Pendidikan',
  ringkasan: '',
  konten: '',
  thumbnail: '',
  thumbnailFile: null,
  status: 'published',
  tanggalDiterbitkan: '',
}

function validateStep(s: number, form: FormData): FormErrors {
  const errors: FormErrors = {}
  if (s === 1) {
    if (!form.judul.trim()) errors.judul = 'Judul tidak boleh kosong'
    else if (form.judul.length < 5) errors.judul = 'Judul minimal 5 karakter'
    if (!form.slug.trim()) errors.slug = 'Slug tidak boleh kosong'
  }
  if (s === 2) {
    if (!form.ringkasan.trim()) errors.ringkasan = 'Ringkasan tidak boleh kosong'
    if (!form.konten.trim()) errors.konten = 'Konten tidak boleh kosong'
    else if (form.konten.length < 50) errors.konten = 'Konten minimal 50 karakter'
  }
  return errors
}

function getCompletedSteps(form: FormData): number[] {
  const done: number[] = []
  if (Object.keys(validateStep(1, form)).length === 0) done.push(1)
  if (done.includes(1) && Object.keys(validateStep(2, form)).length === 0) done.push(2)
  if (done.includes(2)) done.push(3)
  if (done.includes(3)) done.push(4)
  return done
}

export function ModalTambahBerita({ open, onClose, onSave }: ModalTambahBeritaProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)

  // State untuk konfirmasi tutup
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [pendingCloseAction, setPendingCloseAction] = useState<(() => void) | null>(null)

  // Close handler dengan opsi reset data
  const handleClose = (resetData = true) => {
    if (resetData) {
      setStep(1)
      setForm(defaultForm)
      setErrors({})
    }
    onClose()
  }

  // Handler untuk klik overlay / ESC - tutup tapi JANGAN reset data
  const handleOverlayClose = () => {
    onClose()
  }

  // Cek apakah ada data yang sudah diisi
  const hasUnsavedData =
    form.judul || form.konten || form.ringkasan || form.thumbnail || form.thumbnailFile
  // Request close dengan konfirmasi jika ada data
  const requestClose = (resetData: boolean, source: 'overlay' | 'button' | 'save') => {
    if (source === 'save') {
      // Langsung tutup tanpa konfirmasi untuk aksi simpan
      handleClose(resetData)
      return
    }

    if (hasUnsavedData && (source === 'button' || source === 'overlay')) {
      // Simpan aksi yang akan dilakukan setelah konfirmasi
      setPendingCloseAction(() => () => handleClose(true))
      setShowCloseConfirm(true)
    } else {
      // Tidak ada data atau sumber overlay → langsung tutup
      handleClose(resetData)
    }
  }

  // Handler untuk tombol Batal / X di header
  const handleCancelButton = () => {
    // Batal = reset data + tutup
    requestClose(true, 'button')
  }

  // Handler untuk overlay / ESC
  const handleOverlayCloseButton = () => {
    // Overlay = tutup saja, data tetap
    requestClose(false, 'overlay')
  }

  const handleChange = (field: string, value: string | boolean | number | File | null) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
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

  const handleSave = async () => {
    for (let s = 1; s <= 2; s++) {
      const errs = validateStep(s, form)
      if (Object.keys(errs).length) {
        setErrors(errs)
        setStep(s)
        return
      }
    }
    setSaving(true)
    try {
      const waktuBaca = estimateReadTime(form.konten)
      await onSave({
        judul: form.judul,
        slug: form.slug,
        kategori: form.kategori,
        konten: form.konten,
        ringkasan: form.ringkasan,
        thumbnail: form.thumbnail || null,
        waktuBaca,
        status: form.status,
        tanggalDibuat: new Date().toISOString().split('T')[0],
        tanggalDiterbitkan: form.tanggalDiterbitkan || null,
        views: 0,
        featured: false,
      })
      // Simpan sukses → reset data + tutup tanpa konfirmasi
      requestClose(true, 'save')
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
          // Jika modal ditutup via overlay/ESC (bukan via tombol)
          if (!isOpen && open) {
            handleOverlayCloseButton()
          }
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />
          <DialogPrimitive.Content
            onInteractOutside={(e) => {
              // Prevent default close behavior, handle manually
              e.preventDefault()
              handleOverlayCloseButton()
            }}
            onEscapeKeyDown={(e) => {
              // Optional: handle ESC key same as overlay
              e.preventDefault()
              handleOverlayCloseButton()
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
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border shrink-0">
              <div>
                <DialogPrimitive.Title className="text-base font-bold text-foreground">
                  Tambah Berita Baru
                </DialogPrimitive.Title>
                <p className="text-xs text-muted-foreground mt-0.5">{STEPS[step - 1].fullLabel}</p>
              </div>

              {/* Tombol X: Hanya muncul di Step 2+ */}
              {step >= 2 && (
                <DialogPrimitive.Close
                  onClick={handleCancelButton}
                  className="rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors p-1.5"
                  title="Tutup (data akan hilang)"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Tutup</span>
                </DialogPrimitive.Close>
              )}
            </div>

            {/* ── Step Navigator ── */}
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
                          'flex flex-col items-center gap-1.5 group transition-all duration-200 select-none',
                          isReachable ? 'cursor-pointer' : 'cursor-default',
                          'flex-none'
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

            {/* ── Body ── */}
            <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
              {step === 1 && (
                <Step1
                  judul={form.judul}
                  slug={form.slug}
                  slugLocked={form.slugLocked}
                  kategori={form.kategori}
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
                />
              )}
              {step === 4 && (
                <Step4
                  status={form.status}
                  tanggalDiterbitkan={form.tanggalDiterbitkan}
                  judul={form.judul}
                  slug={form.slug}
                  kategori={form.kategori}
                  ringkasan={form.ringkasan}
                  konten={form.konten}
                  waktuBaca={estimateReadTime(form.konten)}
                  onChange={handleChange}
                />
              )}
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border shrink-0 bg-muted/20">
              <button
                type="button"
                onClick={step === 1 ? handleCancelButton : prevStep}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium transition-colors',
                  hasUnsavedData && step === 1
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

              {step < STEPS.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
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
                      <CheckCircle2 className="h-4 w-4" />
                      Simpan Berita
                    </>
                  )}
                </button>
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* Confirmation Dialog for Close - RENDERED OUTSIDE Dialog */}
      <ConfirmDialog
        open={showCloseConfirm}
        title={step === 1 ? 'Batal Mengisi Formulir?' : 'Tutup Tanpa Menyimpan?'}
        description="Semua data yang sudah Anda isi akan hilang. Apakah Anda yakin ingin melanjutkan?"
        confirmText="Ya, Tutup Saja"
        cancelText="Lanjut Mengisi"
        variant="danger"
        onConfirm={() => {
          setShowCloseConfirm(false)
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

// ─── Demo ─────────────────────────────────────────────────────────────────────

export default function Demo() {
  const [open, setOpen] = useState(false)

  const handleSave = async (berita: Omit<Berita, 'id'>) => {
    await new Promise((r) => setTimeout(r, 1200))
    console.log('Berita disimpan:', berita)
    alert(
      `✓ Berita berhasil disimpan!\n\nJudul: ${berita.judul}\nSlug: /berita/${berita.slug}\nWaktu baca: ~${berita.waktuBaca} menit`
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Demo Modal Tambah Berita</h1>
        <p className="text-sm text-muted-foreground">
          Klik tombol di bawah untuk membuka modal
          <br />
          <span className="text-xs text-muted-foreground/70">
            • Step 1: Tombol X tersembunyi, hanya ada "Batal"
            <br />
            • Step 2+: Tombol X muncul di pojok kanan atas
            <br />
            • Klik luar modal: tutup tapi data tetap
            <br />• Klik Batal/X: konfirmasi → Ya = reset data
          </span>
        </p>
        <button
          onClick={() => setOpen(true)}
          className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          + Tambah Berita Baru
        </button>
      </div>
      <ModalTambahBerita open={open} onClose={() => setOpen(false)} onSave={handleSave} />
    </div>
  )
}
