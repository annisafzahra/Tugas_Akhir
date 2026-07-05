export type DataHasilTesType = {
  id: number;
  user: UserType;

  // Akademik
  mtk: number;
  indo: number;
  ipa: number;
  ips: number;

  // RIASEC
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;

  // Bakat
  logika: number;
  verbal: number;
 mekanikal: number;

  // Rekomendasi
  rekomendasi_akademik: string;
  rekomendasi_riasec: string;
  rekomendasi_bakat: string;
  rekomendasi_gabungan: string;

  created_at: string;
}

export type UserType = {
    id: number;
    username: string;
    nama_lengkap: string;
    kelas: string;
    nip?: string;
    usia: number;
    kelamin: string;
    email: string;
    is_staff: boolean;
}