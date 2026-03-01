'use client'

import * as React from 'react'
import { useState, useCallback, useRef } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as LabelPrimitive from '@radix-ui/react-label'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  X,
  FileText,
  Image,
  Tag,
  Clock,
  Link2,
  Eye,
  EyeOff,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  BookOpen,
  Megaphone,
  Newspaper,
  Calendar,
  Sparkles,
  Upload,
  Bold,
  Italic,
  List,
  Quote,
  Heading2,
  RotateCcw,
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
  tags: string[]
  waktuBaca: number
  status: Status
  tanggalDibuat: string
  tanggalDiterbitkan: string | null
  pengarang: string
  views: number
  featured: boolean
}

// ─── Slug Generator ───────────────────────────────────────────────────────────

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
  const wordsPerMinute = 200
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

// ─── Kategori Config ──────────────────────────────────────────────────────────

const kategoriConfig: Record<Kategori, { icon: React.ReactNode; color: string; bg: string }> = {
  Pendidikan: {
    icon: <BookOpen className="h-4 w-4" />,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
  },
  Kegiatan: {
    icon: <Calendar className="h-4 w-4" />,
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
  },
  Pengumuman: {
    icon: <Megaphone className="h-4 w-4" />,
    color: 'text-orange-600',
    bg: 'bg-orange-50 border-orange-200',
  },
  Artikel: {
    icon: <Newspaper className="h-4 w-4" />,
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-200',
  },
}

// ─── Sub Components ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i + 1 === current
                ? 'w-8 bg-primary'
                : i + 1 < current
                  ? 'w-2 bg-primary/60'
                  : 'w-2 bg-muted'
            )}
          />
        </React.Fragment>
      ))}
    </div>
  )
}

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
        pct > 0.9 ? 'text-destructive' : pct > 0.75 ? 'text-yellow-600' : 'text-muted-foreground'
      )}
    >
      {current}/{max}
    </span>
  )
}

// ─── Step 1: Informasi Dasar ──────────────────────────────────────────────────

interface Step1Props {
  judul: string
  slug: string
  slugLocked: boolean
  kategori: Kategori
  pengarang: string
  featured: boolean
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
  pengarang,
  featured,
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
          className={cn(
            'w-full border rounded-lg px-3.5 py-2.5 text-sm bg-background text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground transition-shadow',
            errors.judul ? 'border-destructive focus:ring-destructive/30' : 'border-input'
          )}
        />
        <FieldError message={errors.judul} />
      </div>

      {/* Slug */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <FieldLabel required htmlFor="slug">
            URL Slug
          </FieldLabel>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onRegenerateSlug}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Generate ulang
            </button>
            <button
              type="button"
              onClick={onToggleSlugLock}
              className={cn(
                'flex items-center gap-1 text-xs px-2 py-0.5 rounded border transition-colors',
                slugLocked
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'text-muted-foreground border-input hover:border-primary/40'
              )}
            >
              {slugLocked ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              {slugLocked ? 'Terkunci' : 'Manual'}
            </button>
          </div>
        </div>
        <div className="flex items-center rounded-lg border border-input bg-muted/30 overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent">
          <span className="px-3 py-2.5 text-xs text-muted-foreground border-r border-input bg-muted/50 shrink-0 select-none">
            /berita/
          </span>
          <input
            id="slug"
            value={slug}
            readOnly={slugLocked}
            onChange={(e) => onChange('slug', generateSlug(e.target.value))}
            className="flex-1 px-3 py-2.5 text-sm bg-transparent text-foreground focus:outline-none placeholder:text-muted-foreground"
            placeholder="url-berita-anda"
          />
        </div>
        <FieldError message={errors.slug} />
      </div>

      {/* Kategori */}
      <div>
        <FieldLabel required>Kategori</FieldLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(kategoriConfig) as Kategori[]).map((k) => {
            const cfg = kategoriConfig[k]
            const active = kategori === k
            return (
              <button
                key={k}
                type="button"
                onClick={() => onChange('kategori', k)}
                className={cn(
                  'flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border text-sm font-medium transition-all',
                  active
                    ? `${cfg.bg} ${cfg.color} border-current ring-2 ring-current/20`
                    : 'border-input text-muted-foreground hover:border-primary/30 hover:bg-accent'
                )}
              >
                <span className={active ? cfg.color : ''}>{cfg.icon}</span>
                {k}
              </button>
            )
          })}
        </div>
      </div>

      {/* Pengarang & Featured */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel htmlFor="pengarang">Pengarang</FieldLabel>
          <input
            id="pengarang"
            placeholder="Nama pengarang..."
            value={pengarang}
            onChange={(e) => onChange('pengarang', e.target.value)}
            className="w-full border border-input rounded-lg px-3.5 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <FieldLabel>Opsi Tampilan</FieldLabel>
          <label className="flex items-center gap-2.5 h-[42px] px-3.5 border border-input rounded-lg cursor-pointer hover:bg-accent transition-colors">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => onChange('featured', e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Featured</p>
            </div>
            <Sparkles className="h-4 w-4 text-yellow-500 ml-auto" />
          </label>
        </div>
      </div>
    </div>
  )
}

// ─── Step 2: Konten ──────────────────────────────────────────────────────────

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
          placeholder="Tuliskan ringkasan singkat yang menarik perhatian pembaca (maks. 250 karakter)..."
          value={ringkasan}
          onChange={(e) => onChange('ringkasan', e.target.value)}
          className={cn(
            'w-full border rounded-lg px-3.5 py-2.5 text-sm bg-background text-foreground resize-none',
            'focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground',
            errors.ringkasan ? 'border-destructive' : 'border-input'
          )}
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
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />~{readTime} menit baca
            </span>
            <CharCount current={konten.length} max={50000} />
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 px-2 py-1.5 border border-b-0 border-input rounded-t-lg bg-muted/40">
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
          <div className="ml-auto text-xs text-muted-foreground px-2">Markdown didukung</div>
        </div>

        <textarea
          ref={kontenRef}
          id="konten"
          rows={12}
          maxLength={50000}
          placeholder="Tulis konten berita di sini...

Gunakan toolbar di atas untuk memformat teks:
## Heading
**bold** atau _italic_
- bullet list
> blockquote"
          value={konten}
          onChange={(e) => onChange('konten', e.target.value)}
          className={cn(
            'w-full border rounded-b-lg px-3.5 py-3 text-sm bg-background text-foreground resize-y font-mono',
            'focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground leading-relaxed',
            errors.konten ? 'border-destructive' : 'border-input'
          )}
        />
        <FieldError message={errors.konten} />
      </div>
    </div>
  )
}

// ─── Step 3: Media & Tags ────────────────────────────────────────────────────

interface Step3Props {
  thumbnail: string
  tags: string[]
  waktuBaca: number
  errors: Partial<Record<string, string>>
  onChange: (field: string, value: string | string[] | number) => void
}

function Step3({ thumbnail, tags, waktuBaca, errors, onChange }: Step3Props) {
  const [tagInput, setTagInput] = useState('')

  const addTag = (val: string) => {
    const cleaned = val.trim().toLowerCase().replace(/\s+/g, '-')
    if (cleaned && !tags.includes(cleaned) && tags.length < 10) {
      onChange('tags', [...tags, cleaned])
    }
    setTagInput('')
  }

  const removeTag = (t: string) =>
    onChange(
      'tags',
      tags.filter((x) => x !== t)
    )

  return (
    <div className="space-y-5">
      {/* Thumbnail */}
      <div>
        <FieldLabel htmlFor="thumbnail">URL Thumbnail</FieldLabel>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center rounded-lg border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring">
            <Image className="h-4 w-4 text-muted-foreground ml-3 shrink-0" />
            <input
              id="thumbnail"
              type="url"
              placeholder="https://example.com/gambar.jpg"
              value={thumbnail}
              onChange={(e) => onChange('thumbnail', e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm bg-transparent text-foreground focus:outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
        {thumbnail && (
          <div className="mt-2 rounded-lg border border-border overflow-hidden h-32 bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnail}
              alt="Preview thumbnail"
              className="w-full h-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        )}
        <FieldError message={errors.thumbnail} />
      </div>

      {/* Tags */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <FieldLabel>Tags</FieldLabel>
          <span className="text-xs text-muted-foreground">{tags.length}/10</span>
        </div>
        <div
          className={cn(
            'min-h-[48px] flex flex-wrap gap-1.5 p-2 border rounded-lg bg-background',
            'focus-within:ring-2 focus-within:ring-ring',
            errors.tags ? 'border-destructive' : 'border-input'
          )}
        >
          {tags.map((t) => (
            <span
              key={t}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
            >
              <Tag className="h-3 w-3" />
              {t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                className="ml-0.5 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {tags.length < 10 && (
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  addTag(tagInput)
                }
                if (e.key === 'Backspace' && !tagInput && tags.length) {
                  removeTag(tags[tags.length - 1])
                }
              }}
              onBlur={() => tagInput && addTag(tagInput)}
              placeholder={tags.length === 0 ? 'Tambahkan tag, tekan Enter atau koma...' : ''}
              className="flex-1 min-w-[120px] text-sm bg-transparent text-foreground focus:outline-none placeholder:text-muted-foreground py-1 px-1"
            />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Tekan{' '}
          <kbd className="px-1 py-0.5 rounded border border-border bg-muted text-xs">Enter</kbd>{' '}
          atau <kbd className="px-1 py-0.5 rounded border border-border bg-muted text-xs">,</kbd>{' '}
          untuk menambahkan tag
        </p>
        <FieldError message={errors.tags} />
      </div>

      {/* Waktu Baca Manual Override */}
      <div>
        <FieldLabel htmlFor="waktuBaca">Estimasi Waktu Baca (menit)</FieldLabel>
        <p className="text-xs text-muted-foreground mb-2">
          Otomatis dihitung dari panjang konten, atau override manual di sini.
        </p>
        <div className="flex items-center gap-3">
          <input
            id="waktuBaca"
            type="range"
            min={1}
            max={60}
            value={waktuBaca}
            onChange={(e) => onChange('waktuBaca', Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="flex items-center gap-1.5 w-20 shrink-0 border border-input rounded-lg px-3 py-2 text-sm font-semibold text-foreground">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            {waktuBaca} mnt
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Step 4: Pengaturan Publikasi ────────────────────────────────────────────

interface Step4Props {
  status: Status
  tanggalDiterbitkan: string
  onChange: (field: string, value: string) => void
}

function Step4({ status, tanggalDiterbitkan, onChange }: Step4Props) {
  const today = new Date().toISOString().slice(0, 16)

  return (
    <div className="space-y-5">
      {/* Status */}
      <div>
        <FieldLabel>Status Publikasi</FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              {
                value: 'published',
                label: 'Published',
                desc: 'Langsung tayang setelah disimpan',
                icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
                style: 'border-green-300 bg-green-50 ring-green-200',
              },
              {
                value: 'draft',
                label: 'Draft',
                desc: 'Disimpan tapi belum ditampilkan',
                icon: <FileText className="h-5 w-5 text-muted-foreground" />,
                style: 'border-border bg-muted/30 ring-border',
              },
            ] as const
          ).map((s) => {
            const active = status === s.value
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => onChange('status', s.value)}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-xl border text-left transition-all',
                  active
                    ? `${s.style} ring-2`
                    : 'border-input hover:border-primary/30 hover:bg-accent'
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
        <FieldLabel htmlFor="tanggalDiterbitkan">Jadwal Penerbitan (opsional)</FieldLabel>
        <p className="text-xs text-muted-foreground mb-2">
          Biarkan kosong untuk langsung terbit (jika status Published).
        </p>
        <input
          id="tanggalDiterbitkan"
          type="datetime-local"
          min={today}
          value={tanggalDiterbitkan}
          onChange={(e) => onChange('tanggalDiterbitkan', e.target.value)}
          className="w-full border border-input rounded-lg px-3.5 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Summary Preview */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Pratinjau Pengaturan
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="font-medium text-foreground capitalize">{status}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Jadwal</p>
            <p className="font-medium text-foreground">
              {tanggalDiterbitkan
                ? new Date(tanggalDiterbitkan).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : 'Segera'}
            </p>
          </div>
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
  pengarang: string
  featured: boolean
  ringkasan: string
  konten: string
  thumbnail: string
  tags: string[]
  waktuBaca: number
  status: Status
  tanggalDiterbitkan: string
}

type FormErrors = Partial<Record<keyof FormData | string, string>>

const STEPS = ['Informasi Dasar', 'Konten', 'Media & Tags', 'Publikasi']

const defaultForm: FormData = {
  judul: '',
  slug: '',
  slugLocked: true,
  kategori: 'Pendidikan',
  pengarang: '',
  featured: false,
  ringkasan: '',
  konten: '',
  thumbnail: '',
  tags: [],
  waktuBaca: 2,
  status: 'published',
  tanggalDiterbitkan: '',
}

function validateStep(step: number, form: FormData): FormErrors {
  const errors: FormErrors = {}
  if (step === 1) {
    if (!form.judul.trim()) errors.judul = 'Judul tidak boleh kosong'
    else if (form.judul.length < 5) errors.judul = 'Judul minimal 5 karakter'
    if (!form.slug.trim()) errors.slug = 'Slug tidak boleh kosong'
  }
  if (step === 2) {
    if (!form.ringkasan.trim()) errors.ringkasan = 'Ringkasan tidak boleh kosong'
    if (!form.konten.trim()) errors.konten = 'Konten tidak boleh kosong'
    else if (form.konten.length < 50) errors.konten = 'Konten minimal 50 karakter'
  }
  return errors
}

export function ModalTambahBerita({ open, onClose, onSave }: ModalTambahBeritaProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)

  const handleClose = () => {
    setStep(1)
    setForm(defaultForm)
    setErrors({})
    onClose()
  }

  const handleChange = (field: string, value: string | boolean | number | string[]) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      // Auto-slug dari judul jika terkunci
      if (field === 'judul' && prev.slugLocked) {
        next.slug = generateSlug(value as string)
      }
      // Auto waktu baca dari konten
      if (field === 'konten') {
        next.waktuBaca = estimateReadTime(value as string)
      }
      return next
    })
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const nextStep = () => {
    const errs = validateStep(step, form)
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setStep((s) => Math.min(s + 1, STEPS.length))
  }

  const prevStep = () => {
    setErrors({})
    setStep((s) => Math.max(s - 1, 1))
  }

  const handleSave = async () => {
    const errs = validateStep(step, form)
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setSaving(true)
    try {
      await onSave({
        judul: form.judul,
        slug: form.slug,
        kategori: form.kategori,
        konten: form.konten,
        ringkasan: form.ringkasan,
        thumbnail: form.thumbnail || null,
        tags: form.tags,
        waktuBaca: form.waktuBaca,
        status: form.status,
        tanggalDibuat: new Date().toISOString().split('T')[0],
        tanggalDiterbitkan: form.tanggalDiterbitkan || null,
        pengarang: form.pengarang,
        views: 0,
        featured: form.featured,
      })
      handleClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
            'w-full max-w-2xl max-h-[90vh] flex flex-col',
            'bg-card border border-border rounded-2xl shadow-2xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            'duration-200'
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border shrink-0">
            <div>
              <DialogPrimitive.Title className="text-lg font-bold text-foreground">
                Tambah Berita Baru
              </DialogPrimitive.Title>
              <p className="text-sm text-muted-foreground mt-0.5">
                Langkah {step} dari {STEPS.length}:{' '}
                <span className="font-medium text-foreground">{STEPS[step - 1]}</span>
              </p>
            </div>
            <div className="flex items-center gap-4 ml-4">
              <StepIndicator current={step} total={STEPS.length} />
              <DialogPrimitive.Close
                onClick={handleClose}
                className="rounded-md text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring p-1"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Tutup</span>
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Step Nav Pills */}
          <div className="flex gap-1 px-6 pt-3 shrink-0">
            {STEPS.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => i + 1 < step && setStep(i + 1)}
                className={cn(
                  'flex-1 text-xs py-1 rounded-md transition-colors font-medium',
                  i + 1 === step
                    ? 'bg-primary/10 text-primary'
                    : i + 1 < step
                      ? 'text-primary/70 hover:bg-primary/5 cursor-pointer'
                      : 'text-muted-foreground cursor-default'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {step === 1 && (
              <Step1
                judul={form.judul}
                slug={form.slug}
                slugLocked={form.slugLocked}
                kategori={form.kategori}
                pengarang={form.pengarang}
                featured={form.featured}
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
                tags={form.tags}
                waktuBaca={form.waktuBaca}
                errors={errors}
                onChange={handleChange}
              />
            )}
            {step === 4 && (
              <Step4
                status={form.status}
                tanggalDiterbitkan={form.tanggalDiterbitkan}
                onChange={handleChange}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border shrink-0 bg-muted/30">
            <button
              type="button"
              onClick={step === 1 ? handleClose : prevStep}
              className="px-4 py-2.5 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              {step === 1 ? 'Batal' : '← Sebelumnya'}
            </button>

            <div className="flex items-center gap-2">
              {/* Save as draft shortcut on any step */}
              {step === STEPS.length ? (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
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
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Selanjutnya →
                </button>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

// ─── Demo / Usage Example ─────────────────────────────────────────────────────

export default function Demo() {
  const [open, setOpen] = useState(false)

  const handleSave = async (berita: Omit<Berita, 'id'>) => {
    // Simulasi API call
    await new Promise((r) => setTimeout(r, 1200))
    console.log('Berita disimpan:', berita)
    alert(`Berita "${berita.judul}" berhasil disimpan!\nSlug: /berita/${berita.slug}`)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Demo Modal Tambah Berita</h1>
        <p className="text-muted-foreground">Klik tombol di bawah untuk membuka modal</p>
        <button
          onClick={() => setOpen(true)}
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          + Tambah Berita Baru
        </button>
      </div>

      <ModalTambahBerita open={open} onClose={() => setOpen(false)} onSave={handleSave} />
    </div>
  )
}
