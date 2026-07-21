import { BakatType } from '@/type/bakatType';

export const soalBakat: BakatType[] = [
  // ===== LOGIKA (5 soal) =====
  {
    id: 1,
    kategori: 'logika',
    pertanyaan: 'Perhatikan pola berikut: 4, 7, 13, 25, 49,... Bilangan berikutnya adalah?',
    opsi: ['73', '81', '97', '101'],
    jawaban: '97',
  },
  {
    id: 2,
    kategori: 'logika',
    pertanyaan: 'Jika semua A adalah B, dan semua B adalah C, maka...',
    opsi: [
      'Semua A adalah C',
      'Semua C adalah A',
      'Tidak ada hubungan',
      'A dan C berbeda',
    ],
    jawaban: 'Semua A adalah C',
  },
  {
    id: 3,
    kategori: 'logika',
    pertanyaan: 'Sebuah mesin dapat menghasilkan 240 komponen dalam waktu 6 jam. Jika kecepatan produksi mesin tetap, jumlah komponen yang dihasilkan dalam 9 jam adalah ....',
    opsi: ['320 komponen', '340 komponen', '360 komponen', '400 komponen'],
    jawaban: '360 komponen',
  },
  {
    id: 4,
    kategori: 'logika',
    pertanyaan: 'Manakah yang tidak termasuk kelompok berikut?',
    opsi: ['Segitiga', 'Persegi', 'Lingkaran', 'Pensil'],
    jawaban: 'Pensil',
  },
  {
    id: 5,
    kategori: 'logika',
    pertanyaan: 'Empat siswa yaitu Fara, Bayu, Cici, dan Azam duduk berurutan. Fara duduk di sebelah kanan Bayu, Cici duduk di sebelah kanan Fara, dan Azam duduk di sebelah kanan Cici. Siapakah yang duduk di paling kiri?',
    opsi: ['Fara', 'Bayu', 'Cici', 'Azam'],
    jawaban: 'Bayu',
  },

  // ===== VERBAL (5 soal) =====
  {
    id: 6,
    kategori: 'verbal',
    pertanyaan: 'Hubungan kata yang setara dengan "Arsitek : Rancangan" adalah?',
    opsi: ['Dokter : Pasien', 'Penulis : Naskah', 'Guru : Sekolah', 'Petani : Sawah'],
    jawaban: 'Penulis : Naskah',
  },
  {
    id: 7,
    kategori: 'verbal',
    pertanyaan: 'Kata yang memiliki makna paling dekat dengan "implisit" adalah?',
    opsi: ['Terpisah', 'Terperinci', 'Tersirat', 'Terbuka'],
    jawaban: 'Tersirat',
  },
  {
    id: 8,
    kategori: 'verbal',
    pertanyaan: '"Makan" berhubungan dengan "kenyang", seperti "belajar" berhubungan dengan...',
    opsi: ['Buku', 'Pintar', 'Sekolah', 'Guru'],
    jawaban: 'Pintar',
  },
  {
    id: 9,
    kategori: 'verbal',
    pertanyaan: 'Lawan kata yang paling tepat dari "konvensional" adalah?',
    opsi: ['Tradisional', 'Modern', 'Sederhana', 'Umum'],
    jawaban: 'Modern',
  },
  {
    id: 10,
    kategori: 'verbal',
    pertanyaan: 'Sinonim dari "inovatif" adalah?',
    opsi: ['Kuno', 'Baru', 'Kreatif', 'Biasa'],
    jawaban: 'Kreatif',
  },

  // ===== MEKANIKAL (5 soal) =====
  {
    id: 11,
    kategori: 'mekanikal',
    pertanyaan: 'Alat untuk mengukur suhu adalah?',
    opsi: ['Penggaris', 'Termometer', 'Timbangan', 'Jam'],
    jawaban: 'Termometer',
  },
  {
    id: 12,
    kategori: 'mekanikal',
    pertanyaan: 'Roda gigi besar memutar roda gigi kecil, maka roda kecil akan...',
    opsi: [
      'Berputar lebih lambat',
      'Berputar lebih cepat',
      'Tidak berputar',
      'Berputar sama cepat',
    ],
    jawaban: 'Berputar lebih cepat',
  },
  {
    id: 13,
    kategori: 'mekanikal',
    pertanyaan: 'Mengapa gagang pintu biasanya dibuat lebih panjang daripada titik porosnya?',
    opsi: [
      'Agar lebih berat',
      'Agar mudah menghasilkan gaya putar',
      'Agar lebih aesthetic',
      'Agar tidak rusak',
    ],
    jawaban: 'Agar mudah menghasilkan gaya putar',
  },
  {
    id: 14,
    kategori: 'mekanikal',
    pertanyaan: 'Jika kamu mendorong benda dengan gaya 10N dan benda tidak bergerak, maka gaya geseknya...',
    opsi: [
      'Kurang dari 10N',
      'Sama dengan 10N',
      'Lebih dari 10N',
      'Tidak ada gesekan',
    ],
    jawaban: 'Sama dengan 10N',
  },
  {
    id: 15,
    kategori: 'mekanikal',
    pertanyaan: 'Alat yang menggunakan prinsip tuas adalah?',
    opsi: ['Katrol', 'Lift', 'Gunting', 'Pompa air'],
    jawaban: 'Gunting',
  },
];