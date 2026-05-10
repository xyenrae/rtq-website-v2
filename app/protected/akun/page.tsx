'use client'

import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import {
  UserCircle,
  KeyRound,
  Save,
  Loader2,
  Upload,
  Trash2,
  Image as ImageIcon,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import {
  getPengaturanAkun,
  savePengaturanAkun,
  updatePassword,
  uploadGambar,
  deleteGambar,
  type PengaturanAkun,
} from '@/lib/pengaturan'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

// ============================================================
// HELPER: Avatar Uploader
// ============================================================

function AvatarUploader({
  value,
  onChange,
}: {
  value?: string | null
  onChange: (url: string | null) => void
}) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB')
      return
    }
    setUploading(true)
    const { data, error } = await uploadGambar(file, 'avatar')
    setUploading(false)
    if (error) {
      toast.error(`Gagal upload: ${error}`)
      return
    }
    onChange(data)
    toast.success('Foto profil diperbarui')
  }

  const handleDelete = async () => {
    if (!value) return
    const { error } = await deleteGambar(value)
    if (error) {
      toast.error(`Gagal hapus: ${error}`)
      return
    }
    onChange(null)
    toast.success('Foto profil dihapus')
  }

  return (
    <div className="flex items-center gap-5">
      {/* Avatar Preview */}
      <div className="relative group shrink-0">
        <button
          type="button"
          onClick={() => !uploading && inputRef.current?.click()}
          disabled={uploading}
          className="w-20 h-20 rounded-full border-2 border-dashed border-border bg-muted
            flex items-center justify-center overflow-hidden
            hover:border-primary hover:bg-muted/60 transition-all cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed relative"
        >
          {value ? (
            <Image src={value} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <UserCircle className="w-10 h-10 text-muted-foreground/50" />
          )}
          {/* Hover overlay */}
          <div
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
            transition-opacity flex items-center justify-center rounded-full"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Upload className="w-5 h-5 text-white" />
            )}
          </div>
        </button>
        {/* Delete button */}
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete()
            }}
            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground
              p-1 rounded-full shadow-md hover:bg-destructive/90 transition-colors
              opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        disabled={uploading}
      />

      {/* Info */}
      <div className="space-y-1">
        <p className="text-sm font-medium">Foto Profil</p>
        <p className="text-xs text-muted-foreground">JPG, PNG, GIF • Maks. 2MB</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 h-7 text-xs mt-1"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!uploading) inputRef.current?.click()
          }}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Upload className="w-3 h-3" />
          )}
          {uploading ? 'Mengupload...' : 'Ganti Foto'}
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// HELPER: Password Strength
// ============================================================

function getPasswordStrength(password: string): {
  level: 0 | 1 | 2 | 3 | 4
  label: string
  color: string
} {
  if (!password) return { level: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { level: 1, label: 'Sangat lemah', color: 'bg-red-500' }
  if (score === 2) return { level: 2, label: 'Lemah', color: 'bg-orange-500' }
  if (score === 3) return { level: 3, label: 'Cukup kuat', color: 'bg-yellow-500' }
  return { level: 4, label: 'Kuat', color: 'bg-green-500' }
}

function PasswordStrengthBar({ password }: { password: string }) {
  const { level, label, color } = getPasswordStrength(password)
  if (!password) return null

  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= level ? color : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <p
        className={`text-xs font-medium ${level <= 2 ? 'text-red-500' : level === 3 ? 'text-yellow-600' : 'text-green-600'}`}
      >
        {label}
      </p>
    </div>
  )
}

// ============================================================
// DIALOG: Ubah Password (Fixed: prevent form interference)
// ============================================================

function DialogUbahPassword() {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'verify' | 'change' | 'success'>('verify')

  // Step 1 — verify
  const [currentPassword, setCurrentPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState('')

  // Step 2 — change
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  const resetState = () => {
    setStep('verify')
    setCurrentPassword('')
    setVerifyError('')
    setNewPassword('')
    setConfirmPassword('')
    setShowCurrent(false)
    setShowNew(false)
    setShowConfirm(false)
  }

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) resetState()
  }

  // Verifikasi password lama dengan re-sign-in
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!currentPassword) {
      setVerifyError('Masukkan password saat ini')
      return
    }

    setVerifying(true)
    setVerifyError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user?.email) {
      setVerifyError('Tidak dapat menemukan akun')
      setVerifying(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    setVerifying(false)

    if (error) {
      setVerifyError('Password saat ini salah. Coba lagi.')
      return
    }

    setStep('change')
  }

  // Simpan password baru
  const handleChangePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newPassword) {
      toast.error('Masukkan password baru')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password minimal 8 karakter')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok')
      return
    }
    if (newPassword === currentPassword) {
      toast.error('Password baru tidak boleh sama dengan password lama')
      return
    }

    const strength = getPasswordStrength(newPassword)
    if (strength.level < 2) {
      toast.error('Password terlalu lemah, gunakan kombinasi huruf dan angka')
      return
    }

    setSaving(true)
    const { error } = await updatePassword(newPassword)
    setSaving(false)

    if (error) {
      toast.error('Gagal mengubah password: ' + error)
      return
    }

    setStep('success')
  }

  const passwordMatch = confirmPassword && newPassword === confirmPassword
  const passwordMismatch = confirmPassword && newPassword !== confirmPassword

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {/* FIX: type="button" agar tidak trigger submit form utama */}
        <Button type="button" variant="outline" className="gap-2">
          <KeyRound className="w-4 h-4" />
          Ubah Password
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        {/* Step 1: Verifikasi password lama */}
        {step === 'verify' && (
          <form onSubmit={handleVerify}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Verifikasi Identitas
              </DialogTitle>
              <DialogDescription>
                Masukkan password saat ini untuk melanjutkan perubahan password.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="current_password">Password Saat Ini</Label>
                <div className="relative">
                  <Input
                    id="current_password"
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value)
                      setVerifyError('')
                    }}
                    placeholder="Masukkan password saat ini"
                    className={verifyError ? 'border-destructive pr-10' : 'pr-10'}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {verifyError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {verifyError}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={verifying || !currentPassword} className="gap-2">
                {verifying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                {verifying ? 'Memverifikasi...' : 'Verifikasi'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* Step 2: Input password baru */}
        {step === 'change' && (
          <form onSubmit={handleChangePassword}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                Buat Password Baru
              </DialogTitle>
              <DialogDescription>
                Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol untuk password yang
                kuat.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* New password */}
              <div className="space-y-2">
                <Label htmlFor="new_password">Password Baru</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 karakter"
                    className="pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrengthBar password={newPassword} />
              </div>

              {/* Confirm password */}
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Konfirmasi Password Baru</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    className={`pr-10 ${passwordMismatch ? 'border-destructive' : passwordMatch ? 'border-green-500' : ''}`}
                    onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordMismatch && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Password tidak cocok
                  </p>
                )}
                {passwordMatch && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Password cocok
                  </p>
                )}
              </div>

              {/* Tips */}
              <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Tips password kuat:</p>
                <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
                  <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
                    Minimal 8 karakter
                  </li>
                  <li
                    className={
                      /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? 'text-green-600' : ''
                    }
                  >
                    Kombinasi huruf besar dan kecil
                  </li>
                  <li className={/[0-9]/.test(newPassword) ? 'text-green-600' : ''}>
                    Setidaknya satu angka
                  </li>
                  <li className={/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-600' : ''}>
                    Setidaknya satu simbol (!@#$...)
                  </li>
                </ul>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={saving || !newPassword || !confirmPassword}
                className="gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4" />
                )}
                {saving ? 'Menyimpan...' : 'Simpan Password'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* Step 3: Sukses */}
        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Password Berhasil Diubah
              </DialogTitle>
              <DialogDescription>
                Password akun Anda telah berhasil diperbarui. Gunakan password baru Anda saat login
                berikutnya.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Demi keamanan, simpan password Anda di tempat yang aman.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" onClick={() => handleOpenChange(false)} className="w-full">
                Selesai
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function AkunPage() {
  const supabase = createClient()
  const [akun, setAkun] = useState<Partial<PengaturanAkun>>({})
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setUserEmail(user.email ?? '')

      const { data } = await getPengaturanAkun()
      if (data) setAkun(data)
      setLoading(false)
    }
    load()
  }, [])

  const setField = (field: keyof PengaturanAkun, value: unknown) => {
    setAkun((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    const { error } = await savePengaturanAkun(akun)
    setSaving(false)
    if (error) {
      toast.error('Gagal menyimpan: ' + error)
      return
    }
    toast.success('Profil berhasil disimpan')
    setHasChanges(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">Memuat data akun...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Akun</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola profil dan keamanan akun admin Anda
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving || !hasChanges} className="gap-2 shrink-0">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {hasChanges ? 'Simpan Perubahan' : 'Tersimpan'}
            </>
          )}
        </Button>
      </div>

      {/* Unsaved changes banner */}
      {hasChanges && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
          Ada perubahan profil yang belum disimpan
        </div>
      )}

      <div className="space-y-5">
        {/* ── Profil ── */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                <UserCircle className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base">Profil Admin</CardTitle>
                <CardDescription>
                  Informasi yang ditampilkan sebagai pengelola website
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <AvatarUploader
              value={akun.avatar_url}
              onChange={(url) => setField('avatar_url', url)}
            />

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
                <Input
                  id="nama_lengkap"
                  value={akun.nama_lengkap ?? ''}
                  onChange={(e) => setField('nama_lengkap', e.target.value)}
                  placeholder="Nama Anda"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jabatan">Jabatan</Label>
                <Input
                  id="jabatan"
                  value={akun.jabatan ?? ''}
                  onChange={(e) => setField('jabatan', e.target.value)}
                  placeholder="contoh: Kepala RTQ"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={akun.bio ?? ''}
                onChange={(e) => setField('bio', e.target.value)}
                placeholder="Cerita singkat tentang Anda..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Keamanan ── (Email section removed) ── */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base">Keamanan Akun</CardTitle>
                <CardDescription>Kelola password untuk menjaga keamanan akun</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Email */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Alamat Email</p>
                  <p className="text-sm font-medium truncate">{userEmail || '—'}</p>
                </div>
              </div>
            </div>
            {/* Password Section Only */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Password</p>
                  <p className="text-sm font-medium tracking-widest text-muted-foreground">
                    ••••••••
                  </p>
                </div>
              </div>
              <DialogUbahPassword />
            </div>

            {/* Security note */}
            <div className="flex gap-2.5 text-xs text-muted-foreground bg-muted/30 rounded-lg border border-border px-3.5 py-3">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-green-600" />
              <p>
                Untuk keamanan maksimal, gunakan password yang unik dan berbeda dari akun lain.
                Aktifkan autentikasi dua faktor jika tersedia.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile sticky save bar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border sm:hidden z-50">
          <Button onClick={handleSave} disabled={saving} className="gap-2 w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      )}
    </div>
  )
}
