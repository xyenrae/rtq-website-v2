import { createClient } from '@/lib/supabase/client'
import { mlKlasifikasiBatch } from '@/lib/mlClient'
import type { StatusRekomendasi } from '@/lib/types'

// ─── Client ───────────────────────────────────────────────────────────────────

function getClient() {
  return createClient()
}

// ─── Types lokal ──────────────────────────────────────────────────────────────

export interface RekomendasiRow {
  id: string
  nama: string
  jenis_kelamin: string | null
  jilid_saat_ini: number
  total_pengulangan_taskih: number
  status_rekomendasi: StatusRekomendasi | null
  alasan_rekomendasi: string | null
  probabilitas: number | null
  classified_at: string | null
  sumber_rekomendasi: string | null
  durasi_jilid_0: number | null
  durasi_jilid_1: number | null
  durasi_jilid_2: number | null
  durasi_jilid_3: number | null
  durasi_jilid_4: number | null
  durasi_jilid_5: number | null
  durasi_jilid_6: number | null
}

export interface StatistikRekomendasi {
  total: number
  bbk: number
  tbbk: number
  perJilid: { jilid: string; bbk: number; tbbk: number; total: number }[]
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function fetchHasilRekomendasiList(filters?: {
  status?: StatusRekomendasi | ''
  search?: string
}): Promise<RekomendasiRow[]> {
  const supabase = getClient()

  let query = supabase
    .from('santri_dengan_rekomendasi')
    .select('*')
    .not('status_rekomendasi', 'is', null)
    .order('classified_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status_rekomendasi', filters.status)
  }

  if (filters?.search) {
    query = query.ilike('nama', `%${filters.search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as RekomendasiRow[]
}

export async function fetchStatistikRekomendasi(): Promise<StatistikRekomendasi> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('santri_dengan_rekomendasi')
    .select('status_rekomendasi, jilid_saat_ini')

  if (error) throw error

  const list = (data ?? []) as { status_rekomendasi: string | null; jilid_saat_ini: number }[]

  const perJilid: Record<number, { bbk: number; tbbk: number; total: number }> = {}
  for (const item of list) {
    const j = item.jilid_saat_ini
    if (!perJilid[j]) perJilid[j] = { bbk: 0, tbbk: 0, total: 0 }
    perJilid[j].total++
    if (item.status_rekomendasi === 'BBK') perJilid[j].bbk++
    else if (item.status_rekomendasi === 'TBBK') perJilid[j].tbbk++
  }

  return {
    total: list.length,
    bbk: list.filter((s) => s.status_rekomendasi === 'BBK').length,
    tbbk: list.filter((s) => s.status_rekomendasi === 'TBBK').length,
    perJilid: Object.entries(perJilid)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([jilid, stat]) => ({
        jilid: Number(jilid) === 7 ? 'Al-Quran' : `Jilid ${jilid}`,
        ...stat,
      })),
  }
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Reklasifikasi SEMUA santri menggunakan Decision Tree via ML Service.
 *
 * Alur:
 * 1. Ambil semua santri dari Supabase
 * 2. Kirim ke ML Service (batch endpoint) untuk diklasifikasi
 * 3. Simpan hasil rekomendasi ke tabel rekomendasi
 */
export async function reklasifikasiSemua(): Promise<{ berhasil: number; gagal: number }> {
  const supabase = getClient()

  // Ambil semua santri
  const { data: semuaSantri, error: sErr } = await supabase.from('santri').select('*')
  if (sErr) throw sErr

  if (!semuaSantri || semuaSantri.length === 0) {
    return { berhasil: 0, gagal: 0 }
  }

  // ✅ Kirim ke ML Service batch — lebih efisien dari panggil satu per satu
  const batchResult = await mlKlasifikasiBatch(semuaSantri.map((s) => ({ id: s.id, ...s })))

  // Format hasil untuk disimpan ke Supabase
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
