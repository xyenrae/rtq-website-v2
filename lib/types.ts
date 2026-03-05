// ============================================================
// TYPES: Sistem Rekomendasi Santri
// ============================================================

export type JenisKelamin = 'L' | 'P'
export type StatusRekomendasi = 'BBK' | 'TBBK'
export type SumberKlasifikasi = 'model' | 'manual' | 'rule-based'

export interface Santri {
  id: string
  nama: string
  tanggal_lahir: string | null
  alamat: string | null
  jenis_kelamin: JenisKelamin | null
  jilid_saat_ini: number
  total_pengulangan_taskih: number
  durasi_jilid_0: number | null
  durasi_jilid_1: number | null
  durasi_jilid_2: number | null
  durasi_jilid_3: number | null
  durasi_jilid_4: number | null
  durasi_jilid_5: number | null
  durasi_jilid_6: number | null
  created_at: string
  updated_at: string
}

export interface SantriDenganRekomendasi extends Santri {
  status_rekomendasi: StatusRekomendasi | null
  alasan_rekomendasi: string | null
  probabilitas: number | null
  classified_at: string | null
  sumber_rekomendasi: SumberKlasifikasi | null
}

export interface Rekomendasi {
  id: string
  santri_id: string
  status: StatusRekomendasi
  alasan: string | null
  fitur_snapshot: Record<string, number | null> | null
  probabilitas: number | null
  sumber: SumberKlasifikasi
  model_versi: string | null
  classified_at: string
}

export interface RekomendasiDenganSantri extends Rekomendasi {
  santri: Pick<Santri, 'id' | 'nama' | 'jilid_saat_ini' | 'total_pengulangan_taskih'>
}

export interface AturanCapaian {
  id: string
  batas_durasi_jilid_0_4: number
  batas_durasi_jilid_5_6: number
  batas_pengulangan_taskih: number
  model_versi: string | null
  model_akurasi: number | null
  model_precision: number | null
  model_recall: number | null
  model_f1: number | null
  model_trained_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SantriFormData {
  nama: string
  tanggal_lahir: string
  alamat: string
  jenis_kelamin: JenisKelamin
  jilid_saat_ini: number
  total_pengulangan_taskih: number
  durasi_jilid_0: string
  durasi_jilid_1: string
  durasi_jilid_2: string
  durasi_jilid_3: string
  durasi_jilid_4: string
  durasi_jilid_5: string
  durasi_jilid_6: string
}

export interface KlasifikasiResult {
  status: StatusRekomendasi
  alasan: string
  probabilitas: number
  model_versi: string
  fitur_snapshot: Record<string, number | null>
}

export interface ModelEvaluasi {
  akurasi: number
  precision: number
  recall: number
  f1: number
  versi: string
  trained_at: string
}

export interface AturanCapaianFormData {
  batas_durasi_jilid_0_4: number
  batas_durasi_jilid_5_6: number
  batas_pengulangan_taskih: number
}

// Stats untuk dashboard
export interface MonitoringStats {
  total_santri: number
  bbk_count: number
  tbbk_count: number
  belum_diklasifikasi: number
  rata_rata_durasi: number
}
