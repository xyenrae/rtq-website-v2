/**
 * Aturan Capaian Service
 */

import { createClient } from '@/lib/supabase/client'
import { mlFeatureImportance, mlLatih, type MLEvaluasiResult } from '@/lib/ml-services/mlClient'
import type { AturanCapaian, AturanCapaianFormData } from '@/lib/types'

function getClient() {
  return createClient()
}

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

export async function fetchFeatureImportance(): Promise<FeatureImportanceItem[]> {
  const result = await mlFeatureImportance()
  return result.features
}

export async function simpanAturan(formData: AturanCapaianFormData): Promise<AturanCapaian> {
  const supabase = getClient()

  // Nonaktifkan aturan lama
  await supabase.from('aturan_capaian').update({ is_active: false }).eq('is_active', true)

  // Simpan aturan baru — trigger di DB akan otomatis generate training_master
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
  const supabase = getClient()

  const { data: existingDefault, error } = await supabase
    .from('aturan_capaian')
    .select('*')
    .eq('batas_durasi_jilid_0_4', 3)
    .eq('batas_durasi_jilid_5_6', 4)
    .eq('batas_pengulangan_taskih', 2)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (existingDefault) {
    return await setAturanAktif(existingDefault.id)
  }

  return await simpanAturan({
    batas_durasi_jilid_0_4: 3,
    batas_durasi_jilid_5_6: 4,
    batas_pengulangan_taskih: 2,
  })
}

/**
 * Hapus aturan/model
 */
export async function deleteAturan(id: string): Promise<void> {
  const supabase = getClient()

  // Cek aturan
  const { data: aturan, error: checkError } = await supabase
    .from('aturan_capaian')
    .select('id, is_active')
    .eq('id', id)
    .single()

  if (checkError || !aturan) {
    throw new Error('Model tidak ditemukan')
  }

  // Jangan hapus model aktif
  if (aturan.is_active) {
    throw new Error('Model aktif tidak dapat dihapus')
  }

  // Hapus data training terkait dulu
  const { error: trainingError } = await supabase
    .from('training_master')
    .delete()
    .eq('aturan_id', id)

  if (trainingError) {
    throw trainingError
  }

  // Hapus aturan
  const { error } = await supabase.from('aturan_capaian').delete().eq('id', id)

  if (error) {
    throw error
  }
}

/**
 * Jadikan aturan/model sebagai aktif
 */
export async function setAturanAktif(id: string): Promise<AturanCapaian> {
  const supabase = getClient()

  // Ambil data aturan target
  const { data: aturan, error: checkError } = await supabase
    .from('aturan_capaian')
    .select('*')
    .eq('id', id)
    .single()

  if (checkError || !aturan) {
    throw new Error('Model tidak ditemukan')
  }

  // Nonaktifkan semua model aktif
  const { error: disableError } = await supabase
    .from('aturan_capaian')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('is_active', true)

  if (disableError) {
    throw disableError
  }

  // Aktifkan model terpilih
  const { data, error } = await supabase
    .from('aturan_capaian')
    .update({
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as AturanCapaian
}

/**
 * Latih ulang Decision Tree.
 *
 * Sumber data: tabel training_master yang sudah digenerate otomatis
 * oleh trigger saat aturan disimpan.
 */
export async function latihUlangModel(aturanId: string): Promise<EvaluasiResult> {
  const supabase = getClient()

  // Ambil aturan
  const { data: aturan, error: aErr } = await supabase
    .from('aturan_capaian')
    .select('*')
    .eq('id', aturanId)
    .single()

  if (aErr) throw new Error('Aturan tidak ditemukan')

  // Ambil data training dari tabel master
  const { data: trainingData, error: tErr } = await supabase
    .from('training_master')
    .select('jilid, durasi_bulan, pengulangan_taskih, label')
    .eq('aturan_id', aturanId)

  if (tErr) throw tErr

  if (!trainingData || trainingData.length === 0) {
    throw new Error('Data training belum tersedia. Coba simpan ulang aturan capaian.')
  }

  // Bangun data latih untuk ML Service
  const dataLatih = (
    trainingData as Array<{
      jilid: number
      durasi_bulan: number
      pengulangan_taskih: number
      label: 'BBK' | 'TBBK'
    }>
  ).map((row) => ({
    jilid_saat_ini: row.jilid,
    total_pengulangan_taskih: row.pengulangan_taskih,
    durasi_jilid_0: row.jilid === 0 ? row.durasi_bulan : null,
    durasi_jilid_1: row.jilid === 1 ? row.durasi_bulan : null,
    durasi_jilid_2: row.jilid === 2 ? row.durasi_bulan : null,
    durasi_jilid_3: row.jilid === 3 ? row.durasi_bulan : null,
    durasi_jilid_4: row.jilid === 4 ? row.durasi_bulan : null,
    durasi_jilid_5: row.jilid === 5 ? row.durasi_bulan : null,
    durasi_jilid_6: row.jilid === 6 ? row.durasi_bulan : null,
    label: row.label,
  }))

  const evaluasi: MLEvaluasiResult = await mlLatih({
    aturan: {
      batas_durasi_jilid_0_4: aturan.batas_durasi_jilid_0_4 as number,
      batas_durasi_jilid_5_6: aturan.batas_durasi_jilid_5_6 as number,
      batas_pengulangan_taskih: aturan.batas_pengulangan_taskih as number,
    },
    data_latih: dataLatih,
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
