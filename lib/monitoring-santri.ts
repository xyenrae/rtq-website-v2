import { createClient } from '@/lib/supabase/client'
import { mlKlasifikasi, mlKlasifikasiBatch, type MLKlasifikasiInput } from '@/lib/mlClient'
import type {
  Santri,
  SantriDenganRekomendasi,
  SantriFormData,
  KlasifikasiResult,
  MonitoringStats,
  AturanCapaian,
} from '@/lib/types'

// ─── Client ───────────────────────────────────────────────────────────────────

function getClient() {
  return createClient()
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function fetchSantriList(): Promise<SantriDenganRekomendasi[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('santri_dengan_rekomendasi')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as SantriDenganRekomendasi[]
}

export async function fetchSantriById(id: string): Promise<SantriDenganRekomendasi | null> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('santri_dengan_rekomendasi')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as SantriDenganRekomendasi
}

export async function fetchRiwayatRekomendasi(santriId: string) {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('rekomendasi')
    .select('*')
    .eq('santri_id', santriId)
    .order('classified_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function fetchMonitoringStats(): Promise<MonitoringStats> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('santri_dengan_rekomendasi')
    .select(
      'status_rekomendasi, durasi_jilid_0, durasi_jilid_1, durasi_jilid_2, durasi_jilid_3, durasi_jilid_4, durasi_jilid_5, durasi_jilid_6'
    )

  if (error) throw error

  const list = data ?? []
  const bbk = list.filter((s) => s.status_rekomendasi === 'BBK').length
  const tbbk = list.filter((s) => s.status_rekomendasi === 'TBBK').length
  const belum = list.filter((s) => !s.status_rekomendasi).length

  let totalDurasi = 0
  let countDurasi = 0
  for (const s of list as Record<string, number | null>[]) {
    for (let i = 0; i <= 6; i++) {
      const d = s[`durasi_jilid_${i}`]
      if (d !== null && d !== undefined) {
        totalDurasi += d
        countDurasi++
      }
    }
  }

  return {
    total_santri: list.length,
    bbk_count: bbk,
    tbbk_count: tbbk,
    belum_diklasifikasi: belum,
    rata_rata_durasi: countDurasi > 0 ? parseFloat((totalDurasi / countDurasi).toFixed(1)) : 0,
  }
}

// ─── Helper: ambil aturan aktif ───────────────────────────────────────────────

async function fetchAturanAktif(): Promise<AturanCapaian> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('aturan_capaian')
    .select('*')
    .eq('is_active', true)
    .single()

  if (error) throw new Error('Aturan capaian aktif tidak ditemukan')
  return data as AturanCapaian
}

// ─── Helper: panggil ML Service untuk klasifikasi ────────────────────────────

async function klasifikasiViaMlService(santri: Santri): Promise<KlasifikasiResult> {
  const input: MLKlasifikasiInput = {
    jilid_saat_ini: santri.jilid_saat_ini,
    total_pengulangan_taskih: santri.total_pengulangan_taskih,
    durasi_jilid_0: santri.durasi_jilid_0 ?? null,
    durasi_jilid_1: santri.durasi_jilid_1 ?? null,
    durasi_jilid_2: santri.durasi_jilid_2 ?? null,
    durasi_jilid_3: santri.durasi_jilid_3 ?? null,
    durasi_jilid_4: santri.durasi_jilid_4 ?? null,
    durasi_jilid_5: santri.durasi_jilid_5 ?? null,
    durasi_jilid_6: santri.durasi_jilid_6 ?? null,
  }

  const hasil = await mlKlasifikasi(input)

  return {
    status: hasil.status,
    alasan: hasil.alasan,
    probabilitas: hasil.probabilitas,
    fitur_snapshot: hasil.fitur_snapshot,
    model_versi: hasil.model_versi,
  }
}

// ─── Helper: simpan rekomendasi ke Supabase ───────────────────────────────────

async function simpanRekomendasi(santriId: string, hasil: KlasifikasiResult): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('rekomendasi').insert({
    santri_id: santriId,
    status: hasil.status,
    alasan: hasil.alasan,
    fitur_snapshot: hasil.fitur_snapshot,
    probabilitas: hasil.probabilitas,
    sumber: 'decision-tree', // ← berubah dari rule-based ke decision-tree
    model_versi: hasil.model_versi,
  })
  if (error) throw error
}

// ─── Helper: parse form ke payload DB ────────────────────────────────────────

function parseFormToPayload(formData: SantriFormData) {
  return {
    nama: formData.nama.trim(),
    tanggal_lahir: formData.tanggal_lahir || null,
    alamat: formData.alamat?.trim() || null,
    jenis_kelamin: formData.jenis_kelamin || null,
    jilid_saat_ini: Number(formData.jilid_saat_ini),
    total_pengulangan_taskih: Number(formData.total_pengulangan_taskih),
    durasi_jilid_0: formData.durasi_jilid_0 ? Number(formData.durasi_jilid_0) : null,
    durasi_jilid_1: formData.durasi_jilid_1 ? Number(formData.durasi_jilid_1) : null,
    durasi_jilid_2: formData.durasi_jilid_2 ? Number(formData.durasi_jilid_2) : null,
    durasi_jilid_3: formData.durasi_jilid_3 ? Number(formData.durasi_jilid_3) : null,
    durasi_jilid_4: formData.durasi_jilid_4 ? Number(formData.durasi_jilid_4) : null,
    durasi_jilid_5: formData.durasi_jilid_5 ? Number(formData.durasi_jilid_5) : null,
    durasi_jilid_6: formData.durasi_jilid_6 ? Number(formData.durasi_jilid_6) : null,
  }
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function insertSantri(
  formData: SantriFormData
): Promise<{ santri: Santri; klasifikasi: KlasifikasiResult }> {
  const supabase = getClient()
  const payload = parseFormToPayload(formData)

  const { data: santri, error } = await supabase.from('santri').insert(payload).select('*').single()
  if (error) throw error

  // ✅ Gunakan ML Service (Decision Tree)
  const hasil = await klasifikasiViaMlService(santri as Santri)
  await simpanRekomendasi(santri.id, hasil)

  return { santri: santri as Santri, klasifikasi: hasil }
}

export async function updateSantri(
  id: string,
  formData: SantriFormData
): Promise<{ santri: Santri; klasifikasi: KlasifikasiResult }> {
  const supabase = getClient()
  const payload = parseFormToPayload(formData)

  const { data: santri, error } = await supabase
    .from('santri')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error

  // ✅ Gunakan ML Service (Decision Tree)
  const hasil = await klasifikasiViaMlService(santri as Santri)
  await simpanRekomendasi(santri.id, hasil)

  return { santri: santri as Santri, klasifikasi: hasil }
}

export async function deleteSantri(id: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('santri').delete().eq('id', id)
  if (error) throw error
}

export async function reklasifikasiSantri(santriId: string): Promise<KlasifikasiResult> {
  const supabase = getClient()

  const { data: santri, error: sErr } = await supabase
    .from('santri')
    .select('*')
    .eq('id', santriId)
    .single()

  if (sErr) throw sErr

  // ✅ Gunakan ML Service (Decision Tree)
  const hasil = await klasifikasiViaMlService(santri as Santri)
  await simpanRekomendasi(santriId, hasil)

  return hasil
}

/**
 * Reklasifikasi banyak santri sekaligus menggunakan batch API ML Service.
 * Lebih efisien dari reklasifikasi satu-satu.
 */
export async function reklasifikasiBatch(santriIds: string[]): Promise<{
  berhasil: number
  gagal: number
}> {
  const supabase = getClient()

  const { data: semuaSantri, error } = await supabase.from('santri').select('*').in('id', santriIds)

  if (error) throw error

  // Kirim ke ML Service batch endpoint
  const batchResult = await mlKlasifikasiBatch((semuaSantri ?? []).map((s) => ({ id: s.id, ...s })))

  // Simpan hasil ke Supabase
  const insertBatch = batchResult.hasil
    .filter((h) => h.success && h.status)
    .map((h) => ({
      santri_id: h.id,
      status: h.status!,
      alasan: h.alasan ?? '',
      fitur_snapshot: h.fitur_snapshot ?? {},
      probabilitas: h.probabilitas ?? null,
      sumber: 'decision-tree',
      model_versi: h.model_versi ?? '',
    }))

  if (insertBatch.length > 0) {
    const { error: insertErr } = await supabase.from('rekomendasi').insert(insertBatch)
    if (insertErr) throw insertErr
  }

  return {
    berhasil: batchResult.berhasil,
    gagal: batchResult.gagal,
  }
}
