/**
 * HTTP Client untuk berkomunikasi dengan ML Service (Flask)
 *
 * Set environment variable di .env.local:
 *   ML_SERVICE_URL=http://localhost:5000
 */

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:5000'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MLKlasifikasiInput {
  jilid_saat_ini: number
  total_pengulangan_taskih: number
  durasi_jilid_0?: number | null
  durasi_jilid_1?: number | null
  durasi_jilid_2?: number | null
  durasi_jilid_3?: number | null
  durasi_jilid_4?: number | null
  durasi_jilid_5?: number | null
  durasi_jilid_6?: number | null
}

export interface MLKlasifikasiResult {
  status: 'BBK' | 'TBBK'
  probabilitas: number
  alasan: string
  fitur_snapshot: Record<string, number>
  model_versi: string
}

export interface MLBatchInput {
  id: string
  jilid_saat_ini: number
  total_pengulangan_taskih: number
  durasi_jilid_0?: number | null
  durasi_jilid_1?: number | null
  durasi_jilid_2?: number | null
  durasi_jilid_3?: number | null
  durasi_jilid_4?: number | null
  durasi_jilid_5?: number | null
  durasi_jilid_6?: number | null
}

export interface MLBatchResult {
  hasil: Array<{ id: string; success: boolean } & Partial<MLKlasifikasiResult> & { error?: string }>
  berhasil: number
  gagal: number
}

export interface MLLatihInput {
  aturan: {
    batas_durasi_jilid_0_4: number
    batas_durasi_jilid_5_6: number
    batas_pengulangan_taskih: number
  }
  data_latih?: Array<MLKlasifikasiInput & { label: 'BBK' | 'TBBK' }>
}

export interface MLEvaluasiResult {
  versi: string
  akurasi: number
  precision: number
  recall: number
  f1: number
  berhasil: number
  total_data_latih: number
  total_data_test: number
}

export interface MLHealthResult {
  status: string
  model_trained: boolean
  model_versi: string
  total_data_latih: number
}

export interface MLFeatureImportance {
  features: Array<{ nama: string; importance: number }>
}

// ─── Helper fetch ─────────────────────────────────────────────────────────────

async function mlFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${ML_SERVICE_URL}${path}`

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error || `ML Service error: ${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<T>
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Cek apakah ML Service aktif dan model sudah dilatih
 */
export async function mlHealth(): Promise<MLHealthResult> {
  return mlFetch<MLHealthResult>('/health')
}

/**
 * Klasifikasi satu santri menggunakan Decision Tree
 */
export async function mlKlasifikasi(input: MLKlasifikasiInput): Promise<MLKlasifikasiResult> {
  return mlFetch<MLKlasifikasiResult>('/klasifikasi', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

/**
 * Klasifikasi banyak santri sekaligus (lebih efisien)
 */
export async function mlKlasifikasiBatch(santriList: MLBatchInput[]): Promise<MLBatchResult> {
  return mlFetch<MLBatchResult>('/klasifikasi/batch', {
    method: 'POST',
    body: JSON.stringify({ santri_list: santriList }),
  })
}

/**
 * Latih ulang model dengan aturan baru (opsional: dengan data real)
 */
export async function mlLatih(input: MLLatihInput): Promise<MLEvaluasiResult> {
  return mlFetch<MLEvaluasiResult>('/latih', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

/**
 * Ambil info model yang aktif
 */
export async function mlModelInfo(): Promise<Record<string, unknown>> {
  return mlFetch('/model/info')
}

/**
 * Ambil feature importance dari Decision Tree
 */
export async function mlFeatureImportance(): Promise<MLFeatureImportance> {
  return mlFetch<MLFeatureImportance>('/model/feature-importance')
}
