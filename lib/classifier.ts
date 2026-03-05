// ============================================================
// CLASSIFIER: Decision Tree Logic (Rule-Based Implementation)
// Menggantikan Python/Flask API dengan logika TypeScript murni
// Sesuai dengan aturan yang dikonfigurasi di AturanCapaian
// ============================================================

import type { Santri, KlasifikasiResult, AturanCapaian } from '@/lib/types'

interface FiturSantri {
  durasi_jilid_0: number | null
  durasi_jilid_1: number | null
  durasi_jilid_2: number | null
  durasi_jilid_3: number | null
  durasi_jilid_4: number | null
  durasi_jilid_5: number | null
  durasi_jilid_6: number | null
  total_pengulangan_taskih: number
  jilid_saat_ini: number
  rata_rata_durasi?: number
  total_durasi?: number
}

function hitungRataDurasi(fitur: FiturSantri): number {
  const durasis = [
    fitur.durasi_jilid_0,
    fitur.durasi_jilid_1,
    fitur.durasi_jilid_2,
    fitur.durasi_jilid_3,
    fitur.durasi_jilid_4,
    fitur.durasi_jilid_5,
    fitur.durasi_jilid_6,
  ].filter((d): d is number => d !== null && d !== undefined)

  if (durasis.length === 0) return 0
  return durasis.reduce((a, b) => a + b, 0) / durasis.length
}

function hitungTotalDurasi(fitur: FiturSantri): number {
  return [
    fitur.durasi_jilid_0,
    fitur.durasi_jilid_1,
    fitur.durasi_jilid_2,
    fitur.durasi_jilid_3,
    fitur.durasi_jilid_4,
    fitur.durasi_jilid_5,
    fitur.durasi_jilid_6,
  ]
    .filter((d): d is number => d !== null && d !== undefined)
    .reduce((a, b) => a + b, 0)
}

export function klasifikasiSantri(
  santri: Pick<
    Santri,
    | 'jilid_saat_ini'
    | 'total_pengulangan_taskih'
    | 'durasi_jilid_0'
    | 'durasi_jilid_1'
    | 'durasi_jilid_2'
    | 'durasi_jilid_3'
    | 'durasi_jilid_4'
    | 'durasi_jilid_5'
    | 'durasi_jilid_6'
  >,
  aturan: Pick<
    AturanCapaian,
    'batas_durasi_jilid_0_4' | 'batas_durasi_jilid_5_6' | 'batas_pengulangan_taskih' | 'model_versi'
  >
): KlasifikasiResult {
  const fitur: FiturSantri = {
    durasi_jilid_0: santri.durasi_jilid_0,
    durasi_jilid_1: santri.durasi_jilid_1,
    durasi_jilid_2: santri.durasi_jilid_2,
    durasi_jilid_3: santri.durasi_jilid_3,
    durasi_jilid_4: santri.durasi_jilid_4,
    durasi_jilid_5: santri.durasi_jilid_5,
    durasi_jilid_6: santri.durasi_jilid_6,
    total_pengulangan_taskih: santri.total_pengulangan_taskih,
    jilid_saat_ini: santri.jilid_saat_ini,
  }

  const rata = hitungRataDurasi(fitur)
  const total = hitungTotalDurasi(fitur)
  const alasanParts: string[] = []
  let bbkScore = 0
  let totalCek = 0

  // Cek jilid 0-4 terhadap batas_durasi_jilid_0_4
  const batas04 = aturan.batas_durasi_jilid_0_4
  const jilidRendah = [
    { key: 'durasi_jilid_0', val: santri.durasi_jilid_0, label: 'Jilid 0' },
    { key: 'durasi_jilid_1', val: santri.durasi_jilid_1, label: 'Jilid 1' },
    { key: 'durasi_jilid_2', val: santri.durasi_jilid_2, label: 'Jilid 2' },
    { key: 'durasi_jilid_3', val: santri.durasi_jilid_3, label: 'Jilid 3' },
    { key: 'durasi_jilid_4', val: santri.durasi_jilid_4, label: 'Jilid 4' },
  ]

  for (const { val, label } of jilidRendah) {
    if (val !== null && val !== undefined) {
      totalCek++
      if (val > batas04) {
        bbkScore++
        alasanParts.push(`${label}: ${val} bln > batas ${batas04} bln ❌`)
      } else {
        alasanParts.push(`${label}: ${val} bln ≤ batas ${batas04} bln ✓`)
      }
    }
  }

  // Cek jilid 5-6 terhadap batas_durasi_jilid_5_6
  const batas56 = aturan.batas_durasi_jilid_5_6
  const jilidTinggi = [
    { key: 'durasi_jilid_5', val: santri.durasi_jilid_5, label: 'Jilid 5' },
    { key: 'durasi_jilid_6', val: santri.durasi_jilid_6, label: 'Jilid 6' },
  ]

  for (const { val, label } of jilidTinggi) {
    if (val !== null && val !== undefined) {
      totalCek++
      if (val > batas56) {
        bbkScore++
        alasanParts.push(`${label}: ${val} bln > batas ${batas56} bln ❌`)
      } else {
        alasanParts.push(`${label}: ${val} bln ≤ batas ${batas56} bln ✓`)
      }
    }
  }

  // Cek taskih
  const batasTaskih = aturan.batas_pengulangan_taskih
  totalCek++
  if (santri.total_pengulangan_taskih > batasTaskih) {
    bbkScore++
    alasanParts.push(`Taskih: ${santri.total_pengulangan_taskih}x > batas ${batasTaskih}x ❌`)
  } else {
    alasanParts.push(`Taskih: ${santri.total_pengulangan_taskih}x ≤ batas ${batasTaskih}x ✓`)
  }

  // Keputusan: BBK jika ada SATU ATAU LEBIH kriteria yang melampaui batas
  const isBBK = bbkScore > 0
  const probabilitas = isBBK
    ? Math.min(0.95, 0.5 + (bbkScore / totalCek) * 0.45)
    : Math.min(0.95, 0.5 + ((totalCek - bbkScore) / totalCek) * 0.45)

  const alasanSummary = isBBK
    ? `BBK karena ${bbkScore} dari ${totalCek} kriteria melampaui batas`
    : `TBBK karena semua ${totalCek} kriteria memenuhi batas`

  const alasanFull = `${alasanSummary}\n\nDetail:\n${alasanParts.join('\n')}\n\nRata-rata durasi: ${rata.toFixed(1)} bln | Total durasi: ${total.toFixed(1)} bln`

  return {
    status: isBBK ? 'BBK' : 'TBBK',
    alasan: alasanFull,
    probabilitas: parseFloat(probabilitas.toFixed(4)),
    model_versi: aturan.model_versi ?? 'rule-based-v1',
    fitur_snapshot: {
      durasi_jilid_0: santri.durasi_jilid_0,
      durasi_jilid_1: santri.durasi_jilid_1,
      durasi_jilid_2: santri.durasi_jilid_2,
      durasi_jilid_3: santri.durasi_jilid_3,
      durasi_jilid_4: santri.durasi_jilid_4,
      durasi_jilid_5: santri.durasi_jilid_5,
      durasi_jilid_6: santri.durasi_jilid_6,
      total_pengulangan_taskih: santri.total_pengulangan_taskih,
      rata_rata_durasi: parseFloat(rata.toFixed(2)),
      total_durasi: parseFloat(total.toFixed(2)),
    },
  }
}
