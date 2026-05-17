'use client'

import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { IconPhoto, IconUpload, IconX, IconEye, IconAlertCircle } from '@tabler/icons-react'
import Image from 'next/image'
import { formatFileSize } from '@/lib/galeri'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const MAX_SIZE = 5 * 1024 * 1024

interface ImageUploaderProps {
  currentUrl?: string
  onFileChange: (file: File | null) => void
  onUrlChange: (url: string) => void
  urlValue: string
  fileValue: File | null
  error?: string
  disabled?: boolean
}

type UploadMode = 'url' | 'file'

export function ImageUploader({
  currentUrl,
  onFileChange,
  onUrlChange,
  urlValue,
  fileValue,
  error,
  disabled,
}: ImageUploaderProps) {
  const [mode, setMode] = useState<UploadMode>(
    currentUrl && !currentUrl.startsWith('blob:') ? 'url' : 'file'
  )
  const [previewError, setPreviewError] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const previewSrc = fileValue ? URL.createObjectURL(fileValue) : urlValue.trim()
  const isValidUrl = /^https?:\/\/.+/.test(urlValue.trim())
  const showPreview = mode === 'file' ? !!fileValue : isValidUrl

  function handleFile(file: File) {
    setFileError(null)
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Format tidak didukung. Gunakan JPEG, PNG, WebP, GIF, atau AVIF.')
      return
    }
    if (file.size > MAX_SIZE) {
      setFileError(`Ukuran file terlalu besar. Maksimal ${formatFileSize(MAX_SIZE)}.`)
      return
    }
    onFileChange(file)
    setPreviewError(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const inputBase = cn(
    'w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground',
    'placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20',
    'focus:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center rounded-lg border border-border overflow-hidden bg-muted/30 p-0.5 gap-0.5">
        {(['url', 'file'] as UploadMode[]).map((m) => (
          <button
            key={m}
            type="button"
            disabled={disabled}
            onClick={() => {
              setMode(m)
              setFileError(null)
              setPreviewError(false)
              if (m === 'url') onFileChange(null)
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150',
              mode === m
                ? 'bg-background text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {m === 'url' ? (
              <>
                <IconEye size={13} />
                URL Eksternal
              </>
            ) : (
              <>
                <IconUpload size={13} />
                Upload File
              </>
            )}
          </button>
        ))}
      </div>

      {mode === 'url' ? (
        <input
          type="url"
          placeholder="https://example.com/foto.jpg"
          value={urlValue}
          disabled={disabled}
          onChange={(e) => {
            onUrlChange(e.target.value)
            setPreviewError(false)
          }}
          className={cn(inputBase, error ? 'border-destructive focus:ring-destructive/20' : '')}
          autoFocus
        />
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            'relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 p-6',
            dragOver
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-border hover:border-primary/50 hover:bg-muted/40',
            disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={handleInputChange}
            disabled={disabled}
          />
          {fileValue ? (
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <IconPhoto size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{fileValue.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(fileValue.size)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onFileChange(null)
                  setFileError(null)
                }}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <IconX size={14} />
              </button>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <IconUpload size={18} className="text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Klik atau seret file ke sini</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  JPEG, PNG, WebP, GIF, AVIF — maks. {formatFileSize(MAX_SIZE)}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {(fileError ?? error) && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <IconAlertCircle size={11} />
          {fileError ?? error}
        </p>
      )}

      {showPreview && !fileError && (
        <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
            <IconEye size={12} className="text-muted-foreground" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              Pratinjau
            </span>
          </div>
          {!previewError ? (
            <div className="relative w-full h-44 bg-muted/50 overflow-hidden">
              <Image
                src={previewSrc}
                alt="preview"
                fill
                className="object-contain"
                onError={() => setPreviewError(true)}
                unoptimized={mode === 'file'}
              />
            </div>
          ) : (
            <div className="h-28 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <IconPhoto size={24} className="opacity-30" />
              <p className="text-xs">Gagal memuat pratinjau</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
