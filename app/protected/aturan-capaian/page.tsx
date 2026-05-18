'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import {
  IconSettings,
  IconRefresh,
  IconCheck,
  IconAlertTriangle,
  IconBrain,
  IconHistory,
  IconRotateClockwise,
  IconInfoCircle,
  IconChartPie,
  IconTrash,
  IconEye,
  IconPlayerPlay,
  IconX,
} from '@tabler/icons-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  EvaluasiResult,
  fetchAturanAktif,
  fetchRiwayatAturan,
  simpanAturan,
  resetAturanDefault,
  latihUlangModel,
  deleteAturan,
  setAturanAktif,
} from '@/lib/ml-services/aturan-capaian'
import { AturanCapaian } from '@/lib/types'
import { reklasifikasiSemua } from '@/lib/ml-services/hasil-rekomendasi'

// ─── Types ────────────────────────────────────────────────────────────────────

type FormValues = {
  batas_durasi_jilid_0_4: number
  batas_durasi_jilid_5_6: number
  batas_pengulangan_taskih: number
}

type ModalType =
  | 'simpan'
  | 'reset'
  | 'post-simpan'
  | 'latih'
  | 'detail'
  | 'delete'
  | 'set-aktif'
  | null

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Nama model dari nilai aturan: decision_tree_342 */
function namaModel(jilid04: number, jilid56: number, taskih: number): string {
  const gabung = [jilid04, jilid56, taskih].map((v) => String(Math.round(v))).join('')
  return `decision_tree_${gabung}`
}

/** Cek apakah nilai form persis sama dengan salah satu entry riwayat */
function isDuplikat(formValues: FormValues, riwayat: AturanCapaian[], activeId?: string): boolean {
  return riwayat.some(
    (r) =>
      r.id !== activeId &&
      r.batas_durasi_jilid_0_4 === formValues.batas_durasi_jilid_0_4 &&
      r.batas_durasi_jilid_5_6 === formValues.batas_durasi_jilid_5_6 &&
      r.batas_pengulangan_taskih === formValues.batas_pengulangan_taskih
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.round(value * 100)
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className={`text-lg font-bold ${color}`}>{pct}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color.replace('text-', 'bg-')}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function SliderInput({
  label,
  name,
  value,
  min,
  max,
  step,
  unit,
  description,
  onChange,
}: {
  label: string
  name: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  description: string
  onChange: (name: string, value: number) => void
}) {
  return (
    <div className="p-4 bg-card rounded-xl border border-border space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary">{value}</span>
          <span className="text-xs text-muted-foreground ml-1">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(name, Number(e.target.value))}
        className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer accent-primary"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>
          {min} {unit}
        </span>
        <span>
          {max} {unit}
        </span>
      </div>
    </div>
  )
}

function DiffRow({
  label,
  before,
  after,
  changed,
}: {
  label: string
  before: string
  after: string
  changed: boolean
}) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-muted-foreground text-xs w-44">{label}</span>
      <div className="flex items-center gap-2">
        {changed ? (
          <>
            <span className="line-through text-muted-foreground text-xs">{before}</span>
            <span className="text-xs text-muted-foreground">→</span>
            <span className="font-semibold text-primary text-xs">{after}</span>
          </>
        ) : (
          <span className="font-medium text-foreground text-xs">{after}</span>
        )}
      </div>
    </div>
  )
}

function RiwayatCard({
  r,
  index,
  onDetail,
  onDelete,
  onSetAktif,
}: {
  r: AturanCapaian
  index: number
  onDetail: (r: AturanCapaian) => void
  onDelete: (r: AturanCapaian) => void
  onSetAktif: (r: AturanCapaian) => void
}) {
  const isAktif = r.is_active
  const nama = namaModel(
    r.batas_durasi_jilid_0_4,
    r.batas_durasi_jilid_5_6,
    r.batas_pengulangan_taskih
  )

  return (
    <div
      className={`rounded-xl border p-3 space-y-2 transition-colors ${
        isAktif ? 'border-primary/40 bg-primary/5' : 'border-border bg-card hover:bg-muted/30'
      }`}
    >
      {/* Nama + badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-mono font-semibold text-foreground truncate">{nama}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {new Date(r.created_at).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
        {isAktif ? (
          <Badge className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary border-primary/20 shrink-0">
            Aktif
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0.5 text-muted-foreground shrink-0"
          >
            #{index + 1}
          </Badge>
        )}
      </div>

      {/* Parameter ringkas */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
        <span>
          J0–4: <strong className="text-foreground">{r.batas_durasi_jilid_0_4} bln</strong>
        </span>
        <span>
          J5–6: <strong className="text-foreground">{r.batas_durasi_jilid_5_6} bln</strong>
        </span>
        <span>
          Taskih: <strong className="text-foreground">{r.batas_pengulangan_taskih}×</strong>
        </span>
      </div>

      {/* Metrik jika ada */}
      {r.model_f1 != null && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px]">
          <span className="text-muted-foreground">
            F1:{' '}
            <span className="font-semibold text-amber-600">{Math.round(r.model_f1 * 100)}%</span>
          </span>
          {r.model_akurasi != null && (
            <span className="text-muted-foreground">
              Akurasi:{' '}
              <span className="font-semibold text-emerald-600">
                {Math.round(r.model_akurasi * 100)}%
              </span>
            </span>
          )}
        </div>
      )}

      {/* Tombol aksi */}
      <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
        <button
          onClick={() => onDetail(r)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-border bg-background hover:bg-muted transition-colors"
        >
          <IconEye size={12} />
          Detail
        </button>
        {!isAktif && (
          <button
            onClick={() => onSetAktif(r)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
          >
            <IconPlayerPlay size={12} />
            Aktifkan
          </button>
        )}
        {!isAktif && (
          <button
            onClick={() => onDelete(r)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors ml-auto"
          >
            <IconTrash size={12} />
            Hapus
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AturanCapaianPage() {
  const [aturan, setAturan] = useState<AturanCapaian | null>(null)
  const [riwayat, setRiwayat] = useState<AturanCapaian[]>([])
  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [trainLoading, setTrainLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [evaluasi, setEvaluasi] = useState<EvaluasiResult | null>(null)
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [selectedRiwayat, setSelectedRiwayat] = useState<AturanCapaian | null>(null)
  const [savedAturanId, setSavedAturanId] = useState<string | null>(null)
  const [needsRetrain, setNeedsRetrain] = useState(false)

  const sortedRiwayat = useMemo(() => {
    return [...riwayat].sort((a, b) => {
      if (a.is_active && !b.is_active) return -1
      if (!a.is_active && b.is_active) return 1

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [riwayat])

  const [formValues, setFormValues] = useState<FormValues>({
    batas_durasi_jilid_0_4: 3,
    batas_durasi_jilid_5_6: 4,
    batas_pengulangan_taskih: 2,
  })
  const [hasChanges, setHasChanges] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [aktif, riwayatData] = await Promise.all([fetchAturanAktif(), fetchRiwayatAturan()])
      if (aktif) {
        setAturan(aktif)
        setFormValues({
          batas_durasi_jilid_0_4: aktif.batas_durasi_jilid_0_4,
          batas_durasi_jilid_5_6: aktif.batas_durasi_jilid_5_6,
          batas_pengulangan_taskih: aktif.batas_pengulangan_taskih,
        })
      }
      setRiwayat(riwayatData)
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Gagal memuat aturan')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const formIsDuplikat = useMemo(
    () => isDuplikat(formValues, riwayat, aturan?.id),
    [formValues, riwayat, aturan]
  )

  const formBerbedaDariAktif = useMemo(() => {
    if (!aturan) return true
    return (
      aturan.batas_durasi_jilid_0_4 !== formValues.batas_durasi_jilid_0_4 ||
      aturan.batas_durasi_jilid_5_6 !== formValues.batas_durasi_jilid_5_6 ||
      aturan.batas_pengulangan_taskih !== formValues.batas_pengulangan_taskih
    )
  }, [aturan, formValues])

  const isDefaultConfig = useMemo(() => {
    return (
      aturan?.batas_durasi_jilid_0_4 === 3 &&
      aturan?.batas_durasi_jilid_5_6 === 4 &&
      aturan?.batas_pengulangan_taskih === 2
    )
  }, [aturan])

  const canSimpan = hasChanges && !formIsDuplikat && formBerbedaDariAktif

  function handleSliderChange(name: string, value: number) {
    setFormValues((prev) => ({ ...prev, [name]: value }))
    setHasChanges(true)
  }

  // ── Simpan ──────────────────────────────────────────────────────────────────
  async function eksekusiSimpan() {
    setActiveModal(null)
    setSaveLoading(true)
    try {
      const newAturan = await simpanAturan(formValues)
      setAturan(newAturan)
      setSavedAturanId(newAturan.id)
      setHasChanges(false)
      setNeedsRetrain(true)
      toast.success('Aturan capaian berhasil disimpan')
      await loadData()
      setActiveModal('post-simpan')
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Gagal menyimpan aturan')
    } finally {
      setSaveLoading(false)
    }
  }

  // ── Reset ───────────────────────────────────────────────────────────────────
  async function eksekusiReset() {
    setActiveModal(null)
    setSaveLoading(true)

    try {
      const newAturan = await resetAturanDefault()

      setAturan(newAturan)

      setSavedAturanId(newAturan.id)

      setFormValues({
        batas_durasi_jilid_0_4: 3,
        batas_durasi_jilid_5_6: 4,
        batas_pengulangan_taskih: 2,
      })

      setHasChanges(false)

      const sudahDilatih = !!newAturan.model_versi

      setNeedsRetrain(!sudahDilatih)

      toast.success(
        sudahDilatih
          ? 'Aturan berhasil dikembalikan ke default'
          : 'Aturan default berhasil dipulihkan'
      )

      await loadData()

      if (!sudahDilatih) {
        setActiveModal('post-simpan')
      }
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Gagal reset aturan')
    } finally {
      setSaveLoading(false)
    }
  }

  // ── Latih ulang ─────────────────────────────────────────────────────────────
  async function eksekusiLatihUlang() {
    setActiveModal(null)
    setTrainLoading(true)
    setEvaluasi(null)
    try {
      const targetId = savedAturanId ?? aturan?.id
      if (!targetId) throw new Error('Tidak ada aturan aktif')
      const hasil = await latihUlangModel(targetId)

      setEvaluasi(hasil)
      setNeedsRetrain(false)
      setSavedAturanId(null)

      await reklasifikasiSemua()
      toast.success(`Model berhasil dilatih! Akurasi: ${Math.round(hasil.akurasi * 100)}%`, {
        description: `${hasil.berhasil} santri berhasil diklasifikasi ulang`,
      })
      await loadData()
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Gagal melatih model')
    } finally {
      setTrainLoading(false)
    }
  }

  // ── Hapus ────────────────────────────────────────────────────────────────────
  async function eksekusiDelete() {
    if (!selectedRiwayat) return
    setActiveModal(null)
    setActionLoading(true)
    try {
      await deleteAturan(selectedRiwayat.id)
      toast.success('Model berhasil dihapus')
      setSelectedRiwayat(null)
      await loadData()
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Gagal menghapus model')
    } finally {
      setActionLoading(false)
    }
  }

  // ── Set aktif ────────────────────────────────────────────────────────────────
  async function eksekusiSetAktif() {
    if (!selectedRiwayat) return

    setActiveModal(null)
    setActionLoading(true)

    try {
      await setAturanAktif(selectedRiwayat.id)

      const nama = namaModel(
        selectedRiwayat.batas_durasi_jilid_0_4,
        selectedRiwayat.batas_durasi_jilid_5_6,
        selectedRiwayat.batas_pengulangan_taskih
      )

      const sudahDilatih = !!selectedRiwayat.model_versi

      if (sudahDilatih) {
        await reklasifikasiSemua()
      }

      toast.success(
        sudahDilatih ? `${nama} berhasil diaktifkan & data diperbarui` : `${nama} kini aktif`
      )

      setSavedAturanId(selectedRiwayat.id)
      setNeedsRetrain(!sudahDilatih)
      setSelectedRiwayat(null)

      await loadData()

      if (!sudahDilatih) {
        setActiveModal('post-simpan')
      }
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Gagal mengaktifkan model')
    } finally {
      setActionLoading(false)
    }
  }

  // ── Diff helpers ─────────────────────────────────────────────────────────────
  const diffJilid04 =
    aturan != null && aturan.batas_durasi_jilid_0_4 !== formValues.batas_durasi_jilid_0_4
  const diffJilid56 =
    aturan != null && aturan.batas_durasi_jilid_5_6 !== formValues.batas_durasi_jilid_5_6
  const diffTaskih =
    aturan != null && aturan.batas_pengulangan_taskih !== formValues.batas_pengulangan_taskih

  const namaModelBaru = namaModel(
    formValues.batas_durasi_jilid_0_4,
    formValues.batas_durasi_jilid_5_6,
    formValues.batas_pengulangan_taskih
  )

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <IconSettings size={24} className="text-primary" />
            Aturan Capaian
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Konfigurasi parameter batas yang digunakan model Decision Tree untuk klasifikasi
            BBK/TBBK
          </p>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl text-sm">
          <IconInfoCircle size={18} className="text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Cara Kerja Aturan</p>
            <p className="text-muted-foreground text-xs mt-1">
              Santri diklasifikasikan sebagai <strong>BBK</strong> apabila durasi penyelesaian pada
              jilid manapun melebihi batas, atau total pengulangan taskih melebihi batas. Sebaliknya
              diklasifikasikan sebagai <strong>TBBK</strong>.
            </p>
          </div>
        </div>

        {/* Peringatan duplikat */}
        {hasChanges && formIsDuplikat && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
            <IconX size={18} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                Konfigurasi Ini Sudah Pernah Digunakan
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                Nilai yang Anda masukkan sudah ada di riwayat. Ubah minimal satu parameter untuk
                dapat menyimpan aturan baru.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ────────────── Form ────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Parameter Batas</h2>
              {hasChanges && !formIsDuplikat && (
                <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  Ada perubahan belum disimpan
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <SliderInput
                  label="Batas Durasi Jilid 0–4"
                  name="batas_durasi_jilid_0_4"
                  value={formValues.batas_durasi_jilid_0_4}
                  min={1}
                  max={12}
                  step={0.5}
                  unit="bulan"
                  description="Batas maksimal waktu penyelesaian untuk Jilid 0 sampai 4"
                  onChange={handleSliderChange}
                />
                <SliderInput
                  label="Batas Durasi Jilid 5–6"
                  name="batas_durasi_jilid_5_6"
                  value={formValues.batas_durasi_jilid_5_6}
                  min={1}
                  max={12}
                  step={0.5}
                  unit="bulan"
                  description="Batas maksimal untuk Jilid 5 dan 6 (lebih tinggi karena lebih sulit)"
                  onChange={handleSliderChange}
                />
                <SliderInput
                  label="Batas Pengulangan Taskih"
                  name="batas_pengulangan_taskih"
                  value={formValues.batas_pengulangan_taskih}
                  min={1}
                  max={10}
                  step={1}
                  unit="kali"
                  description="Batas maksimal pengulangan ujian taskih"
                  onChange={handleSliderChange}
                />
              </div>
            )}

            {/* Preview nama model baru */}
            {hasChanges && !formIsDuplikat && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/50 rounded-xl border border-border">
                <IconBrain size={14} className="text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground">Nama model baru:</span>
                <span className="text-xs font-mono font-semibold text-primary">
                  {namaModelBaru}
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Reset */}
              <button
                onClick={() => setActiveModal('reset')}
                disabled={saveLoading || loading || isDefaultConfig}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IconRotateClockwise size={15} />
                Reset Default
              </button>

              {/* Latih Ulang — hanya muncul jika needsRetrain atau model belum pernah dilatih */}
              {(needsRetrain || (aturan && !aturan.model_versi)) && (
                <button
                  onClick={() => setActiveModal('latih')}
                  disabled={trainLoading || loading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-sm font-semibold hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors disabled:opacity-50"
                >
                  {trainLoading ? (
                    <IconRefresh size={15} className="animate-spin" />
                  ) : (
                    <IconBrain size={15} />
                  )}
                  {trainLoading ? 'Melatih...' : 'Latih Ulang Model'}
                </button>
              )}

              {/* Simpan — paling kanan */}
              <button
                onClick={() => setActiveModal('simpan')}
                disabled={saveLoading || loading || !canSimpan}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm ml-auto"
              >
                {saveLoading ? (
                  <IconRefresh size={15} className="animate-spin" />
                ) : (
                  <IconCheck size={15} />
                )}
                Simpan Pengaturan
              </button>
            </div>

            {/* Hasil evaluasi setelah latih */}
            {evaluasi && (
              <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <IconChartPie size={16} className="text-emerald-600" />
                  <h3 className="text-sm font-semibold text-foreground">Hasil Evaluasi Model</h3>
                  <span className="text-xs font-mono text-muted-foreground ml-auto">
                    {evaluasi.versi}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard label="Akurasi" value={evaluasi.akurasi} color="text-emerald-600" />
                  <MetricCard label="Precision" value={evaluasi.precision} color="text-blue-600" />
                  <MetricCard label="Recall" value={evaluasi.recall} color="text-purple-600" />
                  <MetricCard label="F1-Score" value={evaluasi.f1} color="text-amber-600" />
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  {evaluasi.berhasil} santri berhasil diklasifikasi ulang
                </p>
              </div>
            )}
          </div>

          {/* ────────────── Sidebar ────────────── */}
          <div className="space-y-4">
            {/* Model aktif */}
            {aturan && (
              <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Model Aktif
                  </h3>
                  <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">
                    Sedang Digunakan
                  </Badge>
                </div>

                <p className="text-xs font-mono font-semibold text-foreground break-all">
                  {namaModel(
                    aturan.batas_durasi_jilid_0_4,
                    aturan.batas_durasi_jilid_5_6,
                    aturan.batas_pengulangan_taskih
                  )}
                </p>

                <div className="space-y-1.5 pt-1">
                  {[
                    { label: 'Batas Jilid 0–4', value: `${aturan.batas_durasi_jilid_0_4} bulan` },
                    { label: 'Batas Jilid 5–6', value: `${aturan.batas_durasi_jilid_5_6} bulan` },
                    { label: 'Batas Taskih', value: `${aturan.batas_pengulangan_taskih}×` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className="text-xs font-semibold text-foreground">{value}</span>
                    </div>
                  ))}
                </div>

                {aturan.model_versi ? (
                  <div className="border-t border-border pt-3 space-y-1.5">
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                      Performa Model
                    </h4>
                    {[
                      { label: 'Akurasi', value: aturan.model_akurasi, color: 'text-emerald-600' },
                      { label: 'Precision', value: aturan.model_precision, color: 'text-blue-600' },
                      { label: 'Recall', value: aturan.model_recall, color: 'text-purple-600' },
                      { label: 'F1-Score', value: aturan.model_f1, color: 'text-amber-600' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <span className={`text-xs font-semibold ${color}`}>
                          {value != null ? `${Math.round(value * 100)}%` : '—'}
                        </span>
                      </div>
                    ))}
                    <p className="text-[10px] text-muted-foreground pt-1">
                      Dilatih:{' '}
                      {aturan.model_trained_at
                        ? new Date(aturan.model_trained_at).toLocaleDateString('id-ID')
                        : '—'}
                    </p>
                  </div>
                ) : (
                  <div className="border-t border-border pt-3">
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <IconAlertTriangle size={12} />
                      Model ini belum pernah dilatih
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Daftar semua model */}
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <IconHistory size={13} />
                Semua Model ({sortedRiwayat.length})
              </h3>
              {riwayat.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Belum ada riwayat</p>
              ) : (
                <div className="space-y-2 max-h-120 overflow-y-auto">
                  {sortedRiwayat.map((r, i) => (
                    <RiwayatCard
                      key={r.id}
                      r={r}
                      index={i}
                      onDetail={(item) => {
                        setSelectedRiwayat(item)
                        setActiveModal('detail')
                      }}
                      onDelete={(item) => {
                        setSelectedRiwayat(item)
                        setActiveModal('delete')
                      }}
                      onSetAktif={(item) => {
                        setSelectedRiwayat(item)
                        setActiveModal('set-aktif')
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Catatan */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <IconAlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Setiap aturan menghasilkan model baru. Pastikan melakukan{' '}
                <strong>Latih Ulang Model</strong> setelah menyimpan atau mengganti aturan aktif.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          MODAL — Konfirmasi Simpan
      ══════════════════════════════════════════════ */}
      <Dialog open={activeModal === 'simpan'} onOpenChange={(o) => !o && setActiveModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconCheck size={18} className="text-primary" />
              Konfirmasi Simpan Aturan
            </DialogTitle>
            <DialogDescription>
              Periksa perubahan berikut. Aturan lama akan dinonaktifkan dan model baru akan dibuat.
            </DialogDescription>
          </DialogHeader>

          <div className="divide-y divide-border rounded-xl border border-border px-4 py-1 my-1">
            <DiffRow
              label="Batas Jilid 0–4"
              before={`${aturan?.batas_durasi_jilid_0_4 ?? '—'} bulan`}
              after={`${formValues.batas_durasi_jilid_0_4} bulan`}
              changed={diffJilid04}
            />
            <DiffRow
              label="Batas Jilid 5–6"
              before={`${aturan?.batas_durasi_jilid_5_6 ?? '—'} bulan`}
              after={`${formValues.batas_durasi_jilid_5_6} bulan`}
              changed={diffJilid56}
            />
            <DiffRow
              label="Batas Taskih"
              before={`${aturan?.batas_pengulangan_taskih ?? '—'}×`}
              after={`${formValues.batas_pengulangan_taskih}×`}
              changed={diffTaskih}
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/50 rounded-xl border border-border">
            <IconBrain size={13} className="text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">Nama model baru:</span>
            <span className="text-xs font-mono font-semibold text-primary">{namaModelBaru}</span>
          </div>

          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-400">
            <IconAlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>
              Setelah disimpan, Anda akan diminta untuk <strong>Latih Ulang Model</strong> agar
              semua santri diklasifikasi ulang menggunakan aturan baru.
            </span>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setActiveModal(null)}>
              Batal
            </Button>
            <Button onClick={eksekusiSimpan} disabled={saveLoading}>
              {saveLoading && <IconRefresh size={14} className="animate-spin mr-1.5" />}
              Ya, Simpan Aturan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════
          MODAL — Konfirmasi Reset
      ══════════════════════════════════════════════ */}
      <Dialog open={activeModal === 'reset'} onOpenChange={(o) => !o && setActiveModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconRotateClockwise size={18} className="text-amber-600" />
              Konfirmasi Reset ke Default
            </DialogTitle>
            <DialogDescription>
              Semua parameter akan dikembalikan ke nilai bawaan sistem. Tindakan ini tidak dapat
              dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <div className="divide-y divide-border rounded-xl border border-border px-4 py-1 my-1">
            <DiffRow
              label="Batas Jilid 0–4"
              before={`${aturan?.batas_durasi_jilid_0_4 ?? '—'} bulan`}
              after="3 bulan"
              changed={aturan?.batas_durasi_jilid_0_4 !== 3}
            />
            <DiffRow
              label="Batas Jilid 5–6"
              before={`${aturan?.batas_durasi_jilid_5_6 ?? '—'} bulan`}
              after="4 bulan"
              changed={aturan?.batas_durasi_jilid_5_6 !== 4}
            />
            <DiffRow
              label="Batas Taskih"
              before={`${aturan?.batas_pengulangan_taskih ?? '—'}×`}
              after="2×"
              changed={aturan?.batas_pengulangan_taskih !== 2}
            />
          </div>

          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-400">
            <IconAlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>
              Setelah direset, lakukan <strong>Latih Ulang Model</strong> agar klasifikasi santri
              diperbarui.
            </span>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setActiveModal(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={eksekusiReset} disabled={saveLoading}>
              {saveLoading && <IconRefresh size={14} className="animate-spin mr-1.5" />}
              Ya, Reset ke Default
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════
          MODAL — Post-Simpan: Ajakan Latih Ulang
      ══════════════════════════════════════════════ */}
      <Dialog
        open={activeModal === 'post-simpan'}
        onOpenChange={(o) => {
          if (!o) setActiveModal(null)
          // needsRetrain tetap true → tombol tetap muncul di halaman
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconAlertTriangle size={18} className="text-amber-500" />
              Aturan Berhasil Disimpan
            </DialogTitle>
            <DialogDescription>
              Model Decision Tree saat ini <strong>masih menggunakan aturan lama</strong>. Latih
              ulang agar klasifikasi santri diperbarui.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4 space-y-2">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              Jika tidak segera dilatih ulang:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-amber-700 dark:text-amber-400">
              <li>Klasifikasi BBK/TBBK santri tidak akan berubah</li>
              <li>Hasil prediksi tidak mencerminkan aturan baru</li>
              <li>
                Tombol <strong>Latih Ulang Model</strong> akan tetap tersedia di halaman
              </li>
            </ul>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setActiveModal(null)} className="sm:flex-none">
              Nanti Saja
            </Button>
            <Button
              onClick={eksekusiLatihUlang}
              disabled={trainLoading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2"
            >
              {trainLoading ? (
                <>
                  <IconRefresh size={14} className="animate-spin" />
                  Melatih...
                </>
              ) : (
                <>
                  <IconBrain size={14} />
                  Latih Ulang Sekarang
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════
          MODAL — Konfirmasi Latih Ulang (standalone)
      ══════════════════════════════════════════════ */}
      <Dialog open={activeModal === 'latih'} onOpenChange={(o) => !o && setActiveModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconBrain size={18} className="text-primary" />
              Konfirmasi Latih Ulang Model
            </DialogTitle>
            <DialogDescription>
              Model akan dilatih ulang menggunakan aturan aktif saat ini. Proses ini mungkin
              memerlukan beberapa saat.
            </DialogDescription>
          </DialogHeader>

          {aturan && (
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
              <p className="text-xs font-mono font-semibold text-foreground break-all">
                {namaModel(
                  aturan.batas_durasi_jilid_0_4,
                  aturan.batas_durasi_jilid_5_6,
                  aturan.batas_pengulangan_taskih
                )}
              </p>
              {[
                { label: 'Batas Jilid 0–4', value: `${aturan.batas_durasi_jilid_0_4} bulan` },
                { label: 'Batas Jilid 5–6', value: `${aturan.batas_durasi_jilid_5_6} bulan` },
                { label: 'Batas Taskih', value: `${aturan.batas_pengulangan_taskih}×` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-semibold">{value}</span>
                </div>
              ))}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setActiveModal(null)}>
              Batal
            </Button>
            <Button onClick={eksekusiLatihUlang} disabled={trainLoading}>
              {trainLoading ? (
                <>
                  <IconRefresh size={14} className="animate-spin mr-1.5" />
                  Melatih...
                </>
              ) : (
                <>
                  <IconBrain size={14} className="mr-1.5" />
                  Mulai Latih Ulang
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════
          MODAL — Detail Aturan
      ══════════════════════════════════════════════ */}
      <Dialog
        open={activeModal === 'detail' && selectedRiwayat != null}
        onOpenChange={(o) => {
          if (!o) {
            setActiveModal(null)
            setSelectedRiwayat(null)
          }
        }}
      >
        <DialogContent className="max-w-md">
          {selectedRiwayat && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <IconEye size={18} className="text-primary" />
                  Detail Model
                </DialogTitle>
                <DialogDescription>
                  Informasi lengkap aturan dan performa model Decision Tree ini.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Nama & status */}
                <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border gap-2">
                  <span className="text-xs font-mono font-semibold text-foreground break-all">
                    {namaModel(
                      selectedRiwayat.batas_durasi_jilid_0_4,
                      selectedRiwayat.batas_durasi_jilid_5_6,
                      selectedRiwayat.batas_pengulangan_taskih
                    )}
                  </span>
                  {selectedRiwayat.is_active ? (
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 shrink-0">
                      Aktif
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground shrink-0">
                      Nonaktif
                    </Badge>
                  )}
                </div>

                {/* Parameter */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Parameter Aturan
                  </p>
                  <div className="divide-y divide-border rounded-xl border border-border px-4 py-1">
                    {[
                      {
                        label: 'Batas Jilid 0–4',
                        value: `${selectedRiwayat.batas_durasi_jilid_0_4} bulan`,
                      },
                      {
                        label: 'Batas Jilid 5–6',
                        value: `${selectedRiwayat.batas_durasi_jilid_5_6} bulan`,
                      },
                      {
                        label: 'Batas Pengulangan Taskih',
                        value: `${selectedRiwayat.batas_pengulangan_taskih}×`,
                      },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between py-2">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <span className="text-xs font-semibold text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performa */}
                {selectedRiwayat.model_versi ? (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Performa Model
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          label: 'Akurasi',
                          value: selectedRiwayat.model_akurasi,
                          color: 'text-emerald-600',
                        },
                        {
                          label: 'Precision',
                          value: selectedRiwayat.model_precision,
                          color: 'text-blue-600',
                        },
                        {
                          label: 'Recall',
                          value: selectedRiwayat.model_recall,
                          color: 'text-purple-600',
                        },
                        {
                          label: 'F1-Score',
                          value: selectedRiwayat.model_f1,
                          color: 'text-amber-600',
                        },
                      ].map(({ label, value, color }) => (
                        <div
                          key={label}
                          className="p-3 bg-muted/30 rounded-xl border border-border"
                        >
                          <p className="text-[10px] text-muted-foreground">{label}</p>
                          <p className={`text-xl font-bold mt-0.5 ${color}`}>
                            {value != null ? `${Math.round(value * 100)}%` : '—'}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      Versi: <span className="font-mono">{selectedRiwayat.model_versi}</span>
                      {selectedRiwayat.model_trained_at && (
                        <>
                          {' · '}Dilatih:{' '}
                          {new Date(selectedRiwayat.model_trained_at).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <IconAlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Model ini belum pernah dilatih. Aktifkan dan latih ulang untuk mendapatkan
                      data performa.
                    </p>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground">
                  Dibuat:{' '}
                  {new Date(selectedRiwayat.created_at).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <DialogFooter>
                <Button
                  onClick={async () => {
                    try {
                      setTrainLoading(true)
                      setActiveModal(null)

                      if (!selectedRiwayat.is_active) {
                        await setAturanAktif(selectedRiwayat.id)
                      }

                      const hasil = await latihUlangModel(selectedRiwayat.id)

                      setEvaluasi(hasil)
                      setNeedsRetrain(false)

                      await reklasifikasiSemua()

                      toast.success(
                        `Model berhasil dilatih ulang! Akurasi: ${Math.round(hasil.akurasi * 100)}%`,
                        {
                          description: `${hasil.berhasil} santri berhasil diklasifikasi ulang`,
                        }
                      )

                      await loadData()
                    } catch (err: unknown) {
                      toast.error((err as Error).message ?? 'Gagal melatih ulang model')
                    } finally {
                      setTrainLoading(false)
                      setSelectedRiwayat(null)
                    }
                  }}
                  disabled={trainLoading}
                  className="mr-auto"
                >
                  {trainLoading ? (
                    <>
                      <IconRefresh size={14} className="animate-spin" />
                      Melatih...
                    </>
                  ) : (
                    <>
                      <IconBrain size={14} />
                      Latih Ulang Model Ini
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveModal(null)
                    setSelectedRiwayat(null)
                  }}
                >
                  Tutup
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════
          MODAL — Konfirmasi Hapus
      ══════════════════════════════════════════════ */}
      <Dialog
        open={activeModal === 'delete' && selectedRiwayat != null}
        onOpenChange={(o) => {
          if (!o) {
            setActiveModal(null)
            setSelectedRiwayat(null)
          }
        }}
      >
        <DialogContent className="max-w-md">
          {selectedRiwayat && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <IconTrash size={18} />
                  Hapus Model
                </DialogTitle>
                <DialogDescription>
                  Tindakan ini tidak dapat dibatalkan. Data model berikut akan dihapus secara
                  permanen.
                </DialogDescription>
              </DialogHeader>

              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl space-y-2">
                <p className="text-xs font-mono font-semibold text-foreground break-all">
                  {namaModel(
                    selectedRiwayat.batas_durasi_jilid_0_4,
                    selectedRiwayat.batas_durasi_jilid_5_6,
                    selectedRiwayat.batas_pengulangan_taskih
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Jilid 0–4: <strong>{selectedRiwayat.batas_durasi_jilid_0_4} bln</strong> · Jilid
                  5–6: <strong>{selectedRiwayat.batas_durasi_jilid_5_6} bln</strong> · Taskih:{' '}
                  <strong>{selectedRiwayat.batas_pengulangan_taskih}×</strong>
                </p>
                {selectedRiwayat.model_f1 != null && (
                  <p className="text-xs text-muted-foreground">
                    F1-Score:{' '}
                    <strong className="text-amber-600">
                      {Math.round(selectedRiwayat.model_f1 * 100)}%
                    </strong>{' '}
                    · Akurasi:{' '}
                    <strong className="text-emerald-600">
                      {Math.round((selectedRiwayat.model_akurasi ?? 0) * 100)}%
                    </strong>
                  </p>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveModal(null)
                    setSelectedRiwayat(null)
                  }}
                >
                  Batal
                </Button>
                <Button variant="destructive" onClick={eksekusiDelete} disabled={actionLoading}>
                  {actionLoading && <IconRefresh size={14} className="animate-spin mr-1.5" />}
                  Ya, Hapus Model
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════
          MODAL — Konfirmasi Set Aktif
      ══════════════════════════════════════════════ */}
      <Dialog
        open={activeModal === 'set-aktif' && selectedRiwayat != null}
        onOpenChange={(o) => {
          if (!o) {
            setActiveModal(null)
            setSelectedRiwayat(null)
          }
        }}
      >
        <DialogContent className="max-w-md">
          {selectedRiwayat && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <IconPlayerPlay size={18} className="text-primary" />
                  Aktifkan Model Ini?
                </DialogTitle>
                <DialogDescription>
                  Model berikut akan dijadikan aktif. Model aktif saat ini akan dinonaktifkan.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                {/* Model yang akan diaktifkan */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Model yang akan diaktifkan:
                  </p>
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                    <p className="text-xs font-mono font-semibold text-primary break-all">
                      {namaModel(
                        selectedRiwayat.batas_durasi_jilid_0_4,
                        selectedRiwayat.batas_durasi_jilid_5_6,
                        selectedRiwayat.batas_pengulangan_taskih
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Jilid 0–4: <strong>{selectedRiwayat.batas_durasi_jilid_0_4} bln</strong> ·
                      Jilid 5–6: <strong>{selectedRiwayat.batas_durasi_jilid_5_6} bln</strong> ·
                      Taskih: <strong>{selectedRiwayat.batas_pengulangan_taskih}×</strong>
                    </p>
                    {selectedRiwayat.model_f1 != null ? (
                      <div className="flex flex-wrap gap-x-3 text-xs">
                        <span>
                          F1:{' '}
                          <strong className="text-amber-600">
                            {Math.round(selectedRiwayat.model_f1 * 100)}%
                          </strong>
                        </span>
                        {selectedRiwayat.model_akurasi != null && (
                          <span>
                            Akurasi:{' '}
                            <strong className="text-emerald-600">
                              {Math.round(selectedRiwayat.model_akurasi * 100)}%
                            </strong>
                          </span>
                        )}
                        {selectedRiwayat.model_precision != null && (
                          <span>
                            Precision:{' '}
                            <strong className="text-blue-600">
                              {Math.round(selectedRiwayat.model_precision * 100)}%
                            </strong>
                          </span>
                        )}
                        {selectedRiwayat.model_recall != null && (
                          <span>
                            Recall:{' '}
                            <strong className="text-purple-600">
                              {Math.round(selectedRiwayat.model_recall * 100)}%
                            </strong>
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-amber-600 flex items-center gap-1">
                        <IconAlertTriangle size={11} />
                        Belum pernah dilatih — performa belum diketahui
                      </p>
                    )}
                  </div>
                </div>

                {/* Model aktif sekarang */}
                {aturan && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      Menggantikan model aktif:
                    </p>
                    <div className="p-3 bg-muted/30 border border-border rounded-xl">
                      <p className="text-xs font-mono text-muted-foreground break-all">
                        {namaModel(
                          aturan.batas_durasi_jilid_0_4,
                          aturan.batas_durasi_jilid_5_6,
                          aturan.batas_pengulangan_taskih
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-400">
                  <IconAlertTriangle size={13} className="shrink-0 mt-0.5" />
                  <span>
                    Setelah diaktifkan, lakukan <strong>Latih Ulang Model</strong> agar semua santri
                    diklasifikasi ulang dengan aturan ini.
                  </span>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveModal(null)
                    setSelectedRiwayat(null)
                  }}
                >
                  Batal
                </Button>
                <Button onClick={eksekusiSetAktif} disabled={actionLoading}>
                  {actionLoading ? (
                    <IconRefresh size={14} className="animate-spin mr-1.5" />
                  ) : (
                    <IconPlayerPlay size={14} className="mr-1.5" />
                  )}
                  Aktifkan Model
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
