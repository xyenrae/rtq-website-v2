import { createClient } from '@/lib/supabase/client'
import { mlLatih, mlFeatureImportance, type MLEvaluasiResult } from '@/lib/mlClient'
import type { AturanCapaian, AturanCapaianFormData } from '@/lib/types'

// ─── Client ───────────────────────────────────────────────────────────────────

function getClient() {
  return createClient()
}

// ─── Types lokal ──────────────────────────────────────────────────────────────

export interface EvaluasiResult {
  akurasi: number
  precision: number
  recall: number
  f1: number
  versi: string
  berhasil: number
}

export interface FeatureImportanceItem {
  nama: string
  importance: number
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function fetchAturanAktif(): Promise<AturanCapaian | null> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('aturan_capaian')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) return null
  return data as AturanCapaian
}

export async function fetchRiwayatAturan(): Promise<AturanCapaian[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('aturan_capaian')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as AturanCapaian[]
}

/**
 * Ambil feature importance dari Decision Tree (fitur mana yang paling berpengaruh)
 */
export async function fetchFeatureImportance(): Promise<FeatureImportanceItem[]> {
  const result = await mlFeatureImportance()
  return result.features
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function simpanAturan(formData: AturanCapaianFormData): Promise<AturanCapaian> {
  const supabase = getClient()

  // Nonaktifkan semua aturan lama
  await supabase.from('aturan_capaian').update({ is_active: false }).eq('is_active', true)

  const { data, error } = await supabase
    .from('aturan_capaian')
    .insert({
      batas_durasi_jilid_0_4: formData.batas_durasi_jilid_0_4,
      batas_durasi_jilid_5_6: formData.batas_durasi_jilid_5_6,
      batas_pengulangan_taskih: formData.batas_pengulangan_taskih,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error
  return data as AturanCapaian
}

export async function resetAturanDefault(): Promise<AturanCapaian> {
  return simpanAturan({
    batas_durasi_jilid_0_4: 3,
    batas_durasi_jilid_5_6: 4,
    batas_pengulangan_taskih: 2,
  })
}

/**
 * Latih ulang Decision Tree dengan aturan baru.
 *
 * Alur:
 * 1. Simpan aturan baru ke Supabase
 * 2. Ambil data santri yang sudah ada labelnya (dari rekomendasi manual guru) sebagai data latih
 * 3. Kirim ke ML Service untuk dilatih ulang
 * 4. Simpan hasil evaluasi kembali ke Supabase
 *
 * @param aturanId - ID aturan yang sudah disimpan di Supabase
 */
export async function latihUlangModel(aturanId: string): Promise<EvaluasiResult> {
  const supabase = getClient()

  // Ambil aturan dari DB
  const { data: aturan, error: aErr } = await supabase
    .from('aturan_capaian')
    .select('*')
    .eq('id', aturanId)
    .single()

  if (aErr) throw new Error('Aturan tidak ditemukan')

  // Ambil data santri beserta label rekomendasi terbaru sebagai data latih
  // (hanya yang sudah pernah diklasifikasi → ada label ground truth)
  const { data: dataSantri, error: sErr } = await supabase
    .from('santri_dengan_rekomendasi')
    .select('*')
    .not('status_rekomendasi', 'is', null)

  if (sErr) throw sErr

  // Format data latih untuk ML Service
  const dataLatih = (dataSantri ?? []).map((s) => ({
    jilid_saat_ini: s.jilid_saat_ini,
    total_pengulangan_taskih: s.total_pengulangan_taskih,
    durasi_jilid_0: s.durasi_jilid_0 ?? null,
    durasi_jilid_1: s.durasi_jilid_1 ?? null,
    durasi_jilid_2: s.durasi_jilid_2 ?? null,
    durasi_jilid_3: s.durasi_jilid_3 ?? null,
    durasi_jilid_4: s.durasi_jilid_4 ?? null,
    durasi_jilid_5: s.durasi_jilid_5 ?? null,
    durasi_jilid_6: s.durasi_jilid_6 ?? null,
    label: s.status_rekomendasi as 'BBK' | 'TBBK',
  }))

  // ✅ Panggil ML Service untuk latih Decision Tree
  const evaluasi: MLEvaluasiResult = await mlLatih({
    aturan: {
      batas_durasi_jilid_0_4: aturan.batas_durasi_jilid_0_4,
      batas_durasi_jilid_5_6: aturan.batas_durasi_jilid_5_6,
      batas_pengulangan_taskih: aturan.batas_pengulangan_taskih,
    },
    data_latih: dataLatih.length >= 10 ? dataLatih : undefined, // min 10 data real
  })

  // Simpan hasil evaluasi ke Supabase
  await supabase
    .from('aturan_capaian')
    .update({
      model_versi: evaluasi.versi,
      model_akurasi: evaluasi.akurasi,
      model_precision: evaluasi.precision,
      model_recall: evaluasi.recall,
      model_f1: evaluasi.f1,
      model_trained_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', aturanId)

  return {
    akurasi: evaluasi.akurasi,
    precision: evaluasi.precision,
    recall: evaluasi.recall,
    f1: evaluasi.f1,
    versi: evaluasi.versi,
    berhasil: evaluasi.berhasil,
  }
}
