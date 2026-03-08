'use client'

import { useState, useEffect, useCallback } from 'react'
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
} from '@tabler/icons-react'
import { EvaluasiResult, fetchAturanAktif, fetchRiwayatAturan, simpanAturan, resetAturanDefault, latihUlangModel } from '@/lib/aturan-capaian';
import { AturanCapaian } from '@/lib/types';

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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AturanCapaianPage() {
  const [aturan, setAturan] = useState<AturanCapaian | null>(null)
  const [riwayat, setRiwayat] = useState<AturanCapaian[]>([])
  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [trainLoading, setTrainLoading] = useState(false)
  const [evaluasi, setEvaluasi] = useState<EvaluasiResult | null>(null)
  const [formValues, setFormValues] = useState({
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

  function handleSliderChange(name: string, value: number) {
    setFormValues((prev) => ({ ...prev, [name]: value }))
    setHasChanges(true)
  }

  async function handleSimpan() {
    setSaveLoading(true)
    try {
      const newAturan = await simpanAturan(formValues)
      setAturan(newAturan)
      setHasChanges(false)
      toast.success('Aturan capaian berhasil disimpan')
      loadData()
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Gagal menyimpan aturan')
    } finally {
      setSaveLoading(false)
    }
  }

  async function handleReset() {
    setSaveLoading(true)
    try {
      const newAturan = await resetAturanDefault()
      setAturan(newAturan)
      setFormValues({
        batas_durasi_jilid_0_4: 3,
        batas_durasi_jilid_5_6: 4,
        batas_pengulangan_taskih: 2,
      })
      setHasChanges(false)
      toast.success('Aturan direset ke nilai default')
      loadData()
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Gagal reset aturan')
    } finally {
      setSaveLoading(false)
    }
  }

  async function handleLatihUlang() {
    setTrainLoading(true)
    setEvaluasi(null)
    try {
      // Simpan dulu jika ada perubahan
      let targetId = aturan?.id
      if (hasChanges || !targetId) {
        const newAturan = await simpanAturan(formValues)
        targetId = newAturan.id
        setHasChanges(false)
      }

      const hasil = await latihUlangModel(targetId!)
      setEvaluasi(hasil)

      toast.success(`Model berhasil dilatih ulang! Akurasi: ${Math.round(hasil.akurasi * 100)}%`, {
        description: `${hasil.berhasil} santri berhasil diklasifikasi ulang`,
      })

      loadData()
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Gagal melatih model')
    } finally {
      setTrainLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
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
          <IconInfoCircle size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Cara Kerja Aturan</p>
            <p className="text-muted-foreground text-xs mt-1">
              Santri diklasifikasikan sebagai <strong>BBK</strong> apabila durasi penyelesaian pada
              jilid manapun melebihi batas, atau total pengulangan taskih melebihi batas. Sebaliknya
              diklasifikasikan sebagai <strong>TBBK</strong>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Parameter Batas</h2>
              {hasChanges && (
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

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleReset}
                disabled={saveLoading || loading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                <IconRotateClockwise size={15} />
                Reset Default
              </button>
              <button
                onClick={handleSimpan}
                disabled={saveLoading || loading || !hasChanges}
                className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-xl text-sm font-semibold hover:bg-secondary/80 transition-colors disabled:opacity-50 border border-border"
              >
                {saveLoading ? (
                  <IconRefresh size={15} className="animate-spin" />
                ) : (
                  <IconCheck size={15} />
                )}
                Simpan Pengaturan
              </button>
              <button
                onClick={handleLatihUlang}
                disabled={trainLoading || loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
              >
                {trainLoading ? (
                  <>
                    <IconRefresh size={15} className="animate-spin" />
                    Melatih Model...
                  </>
                ) : (
                  <>
                    <IconBrain size={15} />
                    Latih Ulang Model
                  </>
                )}
              </button>
            </div>

            {/* Evaluasi */}
            {evaluasi && (
              <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <IconChartPie size={16} className="text-emerald-600" />
                  <h3 className="text-sm font-semibold text-foreground">Hasil Evaluasi Model</h3>
                  <span className="text-xs text-muted-foreground ml-auto">{evaluasi.versi}</span>
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

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Konfigurasi aktif */}
            {aturan && (
              <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Konfigurasi Aktif
                </h3>
                <div className="space-y-2">
                  {[
                    { label: 'Batas Jilid 0-4', value: `${aturan.batas_durasi_jilid_0_4} bulan` },
                    { label: 'Batas Jilid 5-6', value: `${aturan.batas_durasi_jilid_5_6} bulan` },
                    { label: 'Batas Taskih', value: `${aturan.batas_pengulangan_taskih}x` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-1">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className="text-xs font-semibold text-foreground">{value}</span>
                    </div>
                  ))}
                </div>

                {aturan.model_versi && (
                  <>
                    <div className="border-t border-border pt-3 space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground">
                        Performa Model
                      </h4>
                      {[
                        { label: 'Akurasi', value: aturan.model_akurasi },
                        { label: 'Precision', value: aturan.model_precision },
                        { label: 'Recall', value: aturan.model_recall },
                        { label: 'F1-Score', value: aturan.model_f1 },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{label}</span>
                          <span className="text-xs font-semibold text-primary">
                            {value ? `${Math.round(value * 100)}%` : '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Dilatih:{' '}
                      {aturan.model_trained_at
                        ? new Date(aturan.model_trained_at).toLocaleDateString('id-ID')
                        : '—'}
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Riwayat */}
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <IconHistory size={13} />
                Riwayat Aturan
              </h3>
              {riwayat.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Belum ada riwayat</p>
              ) : (
                <div className="space-y-2">
                  {riwayat.slice(0, 5).map((r, i) => (
                    <div
                      key={r.id}
                      className={`p-2.5 rounded-lg text-xs border ${
                        i === 0 ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground">
                          {r.batas_durasi_jilid_0_4} / {r.batas_durasi_jilid_5_6} bln,{' '}
                          {r.batas_pengulangan_taskih}x
                        </span>
                        {i === 0 && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <IconAlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Perubahan aturan akan mempengaruhi semua klasifikasi. Gunakan{' '}
                <strong>Latih Ulang Model</strong> agar semua data santri diklasifikasi ulang.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
