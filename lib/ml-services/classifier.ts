/**
 * Classifier Rule-Based (TypeScript murni)
 *
 * Fallback jika ML Service tidak tersedia.
 * Input: SantriProgress (jilid aktif) + AturanCapaian
 *
 * Aturan:
 *   TBBK → durasi jilid aktif ≤ batas DAN taskih < batas
 *   BBK  → durasi jilid aktif > batas ATAU taskih ≥ batas
 */

import type { AturanCapaian, KlasifikasiResult, SantriProgress } from '@/lib/types'

type ProgressInput = Pick<SantriProgress, 'jilid' | 'durasi_bulan' | 'pengulangan_taskih'>

type AturanInput = Pick<
  AturanCapaian,
  | 'batas_durasi_jilid_0_4'
  | 'batas_durasi_jilid_5_6'
  | 'batas_pengulangan_taskih'
  | 'model_versi'
>

export function klasifikasiSantri(
  progress: ProgressInput,
  aturan: AturanInput
): KlasifikasiResult {
  const { batas_durasi_jilid_0_4: b04, batas_durasi_jilid_5_6: b56, batas_pengulangan_taskih: bTaskih } = aturan
  const { jilid, durasi_bulan, pengulangan_taskih } = progress

  const batasDurasi = jilid <= 4 ? b04 : b56
  const jilidLabel = jilid === 7 ? 'Al-Quran' : `Jilid ${jilid}`

  const detailParts: string[] = []
  let bbkScore = 0
  let totalCek = 0

  // Cek durasi jilid aktif
  if (durasi_bulan !== null && durasi_bulan !== undefined) {
    totalCek++
    const durasiMelebihi = durasi_bulan > batasDurasi
    if (durasiMelebihi) bbkScore++
    detailParts.push(
      `${jilidLabel}: ${durasi_bulan} bln ${durasiMelebihi ? '>' : '≤'} batas ${batasDurasi} bln ${durasiMelebihi ? '❌' : '✓'}`
    )
  } else {
    detailParts.push(`${jilidLabel}: durasi belum tercatat`)
  }

  // Cek pengulangan taskih
  totalCek++
  const taskihMelebihi = pengulangan_taskih >= bTaskih
  if (taskihMelebihi) bbkScore++
  detailParts.push(
    `Taskih: ${pengulangan_taskih}x ${taskihMelebihi ? '≥' : '<'} batas ${bTaskih}x ${taskihMelebihi ? '❌' : '✓'}`
  )

  const isBBK = bbkScore > 0

  const probabilitas =
    totalCek > 0
      ? parseFloat(
          (
            isBBK
              ? Math.min(0.95, 0.5 + (bbkScore / totalCek) * 0.45)
              : Math.min(0.95, 0.5 + ((totalCek - bbkScore) / totalCek) * 0.45)
          ).toFixed(4)
        )
      : 0.5

  const ringkasan = isBBK
    ? `BBK: ${bbkScore} dari ${totalCek} kriteria melampaui batas`
    : `TBBK: semua ${totalCek} kriteria memenuhi batas`

  const alasan = [ringkasan, '', 'Detail:', ...detailParts].join('\n')

  return {
    status: isBBK ? 'BBK' : 'TBBK',
    alasan,
    probabilitas,
    model_versi: aturan.model_versi ?? 'rule-based-v1',
    fitur_snapshot: {
      jilid,
      durasi_bulan: durasi_bulan ?? null,
      pengulangan_taskih,
      batas_durasi: batasDurasi,
      batas_taskih: bTaskih,
    },
  }
}
