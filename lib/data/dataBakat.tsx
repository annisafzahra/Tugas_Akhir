import { BakatType } from '@/type/bakatType';

export const soalBakat: BakatType[] = [
  // ===== LOGIKA (5 soal) =====
  {
    id: 1,
    kategori: 'logika',
    pertanyaan: '2, 4, 8, 16, ... ?',
    opsi: ['18', '24', '32', '20'],
    jawaban: '32',
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
    pertanyaan: '3, 6, 12, 24, ... ?',
    opsi: ['30', '36', '48', '52'],
    jawaban: '48',
  },
  {
    id: 4,
    kategori: 'logika',
    pertanyaan: 'Mana yang tidak termasuk dalam kelompok?',
    opsi: ['Meja', 'Kursi', 'Lemari', 'Piring'],
    jawaban: 'Piring',
  },
  {
    id: 5,
    kategori: 'logika',
    pertanyaan: '1, 4, 9, 16, 25, ... ?',
    opsi: ['30', '36', '49', '64'],
    jawaban: '36',
  },

  // ===== VERBAL (5 soal) =====
  {
    id: 6,
    kategori: 'verbal',
    pertanyaan: 'Sinonim dari "cerdas" adalah?',
    opsi: ['Bodoh', 'Pintar', 'Lambat', 'Malas'],
    jawaban: 'Pintar',
  },
  {
    id: 7,
    kategori: 'verbal',
    pertanyaan: 'Antonim dari "rajin" adalah?',
    opsi: ['Giat', 'Tekun', 'Malas', 'Ulet'],
    jawaban: 'Malas',
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
    pertanyaan: 'Kata yang memiliki arti "tidak jelas" adalah?',
    opsi: ['Gamblang', 'Samar', 'Terang', 'Jelas'],
    jawaban: 'Samar',
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
    pertanyaan: 'Fungsi utama sekring dalam rangkaian listrik adalah?',
    opsi: [
      'Mengalirkan listrik',
      'Memutus arus jika kelebihan beban',
      'Menambah daya',
      'Mengurangi tegangan',
    ],
    jawaban: 'Memutus arus jika kelebihan beban',
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