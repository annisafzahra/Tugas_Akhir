'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

type HasilType = {
  akademik: string;
  riasec: string;
  bakat: string;
  gabungan: string;
};

type HasilPageProps = {
  data: HasilType;
  mode?: 'siswa' | 'admin';
  namaSiswa?: string;
  kelasSiswa?: string;
  onKembali?: () => void;
};

// ==========================================
// DATABASE DESKRIPSI JURUSAN (6 jurusan)
// ==========================================

const deskripsiJurusan: Record<string, string> = {
  IPA: 'Jurusan ini sesuai bagi siswa yang menyukai sains, logika, dan pemecahan masalah secara sistematis.',
  IPS: 'Jurusan ini sesuai bagi siswa yang tertarik mempelajari ekonomi, masyarakat, dan berbagai fenomena sosial.',
  Bahasa: 'Jurusan ini sesuai bagi siswa yang menyukai komunikasi, literasi, serta pembelajaran bahasa dan budaya.',
  AKL: 'Jurusan ini sesuai bagi siswa yang teliti dan tertarik pada bidang keuangan, administrasi, serta pengelolaan data.',
  TKJ: 'Jurusan ini sesuai bagi siswa yang tertarik pada komputer, teknologi informasi, dan jaringan.',
  TKRO: 'Jurusan ini sesuai bagi siswa yang menyukai dunia otomotif, mesin, dan teknologi kendaraan.',
};

// ==========================================
// FUNGSI AMBIL DESKRIPSI LENGKAP
// Prefix dinamis + deskripsi jurusan tetap
// ==========================================

const getDeskripsiJurusan = (jurusan: string, sumber: 'akademik' | 'minat' | 'bakat'): string => {
  const deskripsi = deskripsiJurusan[jurusan];
  if (!deskripsi) return `Berdasarkan hasil tes, kamu memiliki kecocokan pada jurusan ${jurusan}.`;

  const prefixMap: Record<string, string> = {
    akademik: `Berdasarkan hasil tes akademik, kamu memiliki kecocokan yang tinggi pada jurusan ${jurusan}.`,
    minat: `Berdasarkan hasil tes minat RIASEC, kamu memiliki kecocokan yang tinggi pada jurusan ${jurusan}.`,
    bakat: `Berdasarkan hasil tes bakat, kamu memiliki kecocokan yang tinggi pada jurusan ${jurusan}.`,
  };

  const prefix = prefixMap[sumber] || prefixMap.akademik;
  return `${prefix} ${deskripsi}`;
};

const HasilPage = ({
  data,
  mode = 'siswa',
  namaSiswa = '',
  kelasSiswa = '',
  onKembali,
}: HasilPageProps) => {
  const router = useRouter();
  const isSiswa = mode === 'siswa';
  const isAdmin = mode === 'admin';

  // ==========================================
  // LOGIKA PENGKONDISIAN REKOMENDASI UTAMA
  // ==========================================

  const { akademik, riasec, bakat } = data;

  const semuaSama = akademik === riasec && riasec === bakat;
  const duaSama = !semuaSama && (akademik === riasec || akademik === bakat || riasec === bakat);
  const semuaBeda = !semuaSama && !duaSama;

  let rekomendasiUtama = '';
  if (semuaSama) {
    rekomendasiUtama = akademik;
  } else if (duaSama) {
    if (akademik === riasec) rekomendasiUtama = akademik;
    else if (akademik === bakat) rekomendasiUtama = akademik;
    else rekomendasiUtama = riasec;
  } else {
    rekomendasiUtama = akademik;
  }

  let penjelasanUtama = '';
  let tags: string[] = [];

  if (semuaSama) {
    penjelasanUtama = `Ketiga aspek (akademik, minat, dan bakat) menunjukkan hasil yang sama, yaitu ${rekomendasiUtama}. Ini menandakan keselarasan yang kuat antara kemampuan, minat, dan bakat kamu.`;
    tags = ['Akademik', 'Minat', 'Bakat'];
  } else if (duaSama) {
    const yangSama: string[] = [];
    const yangBeda: string[] = [];

    if (akademik === riasec) {
      yangSama.push('akademik', 'minat');
      yangBeda.push('bakat');
    } else if (akademik === bakat) {
      yangSama.push('akademik', 'bakat');
      yangBeda.push('minat');
    } else {
      yangSama.push('minat', 'bakat');
      yangBeda.push('akademik');
    }

    penjelasanUtama = `Hasil rekomendasi berdasarkan ${yangSama.join(' dan ')} sama-sama menunjuk ke jurusan ${rekomendasiUtama}, sementara hasil ${yangBeda[0]} menunjukkan jurusan berbeda. Karena ada keselarasan di dua aspek, maka ${rekomendasiUtama} menjadi rekomendasi utama.`;
    tags = yangSama.map((t) => t.charAt(0).toUpperCase() + t.slice(1));
  } else {
    penjelasanUtama = `Ketiga aspek (akademik, minat, dan bakat) menunjukkan hasil yang berbeda. Rekomendasi utama diambil dari aspek akademik (${rekomendasiUtama}) karena nilai akademik merupakan data riil dari rapor yang mencerminkan kemampuan aktual siswa di sekolah.`;
    tags = ['Akademik (Acuan Utama)'];
  }

  // ==========================================
  // DATA CARD HASIL (DESKRIPSI DINAMIS)
  // Prefix berubah, deskripsi jurusan tetap
  // ==========================================

  const hasilCards = [
    {
      title: 'Berdasarkan Akademik',
      jurusan: akademik,
      desc: getDeskripsiJurusan(akademik, 'akademik'),
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'blue',
    },
    {
      title: 'Berdasarkan Minat (RIASEC)',
      jurusan: riasec,
      desc: getDeskripsiJurusan(riasec, 'minat'),
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      color: 'purple',
    },
    {
      title: 'Berdasarkan Bakat',
      jurusan: bakat,
      desc: getDeskripsiJurusan(bakat, 'bakat'),
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'green',
    },
  ];

  // Warna dinamis per card
  const getCardStyle = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          border: 'border-blue-100',
          bg: 'bg-white',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'purple':
        return {
          border: 'border-purple-100',
          bg: 'bg-white',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          badge: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'green':
        return {
          border: 'border-green-100',
          bg: 'bg-white',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          badge: 'bg-green-50 text-green-700 border-green-200',
        };
      default:
        return {
          border: 'border-slate-100',
          bg: 'bg-white',
          iconBg: 'bg-slate-100',
          iconColor: 'text-slate-600',
          badge: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  const handleCetak = () => {
    window.print();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100 p-4 relative overflow-hidden">
      {/* Dekorasi Background */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-blue-50 flex flex-col h-[90vh]">
          {/* HEADER */}
          <div className="p-6 pb-2 text-center">
            {isAdmin && namaSiswa && (
              <div className="mb-4 flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {namaSiswa.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-800 text-sm">{namaSiswa}</p>
                  <p className="text-xs text-slate-500">Kelas {kelasSiswa}</p>
                </div>
              </div>
            )}

            <h1 className="text-2xl font-bold text-slate-800 mb-1">
              {isAdmin ? 'Hasil Rekomendasi Siswa' : 'Hasil Rekomendasi'}
            </h1>
            <p className="text-sm text-slate-500">
              {isAdmin
                ? 'Detail hasil rekomendasi jurusan berdasarkan data yang telah diisi'
                : 'Berikut adalah rekomendasi jurusan berdasarkan data yang kamu isi'}
            </p>
          </div>

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {/* Card hasil per kategori */}
            {hasilCards.map((card, index) => {
              const style = getCardStyle(card.color);
              return (
                <div
                  key={index}
                  className={`p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 ${style.border} ${style.bg}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${style.iconBg} ${style.iconColor}`}>
                      {card.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                        {card.title}
                      </p>
                      <div className={`inline-block px-3 py-1.5 rounded-xl border font-bold text-sm mb-3 ${style.badge}`}>
                        {card.jurusan}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Card Rekomendasi Utama */}
            <div className="relative mt-2">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-[2rem] opacity-20 blur-md"></div>

              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <p className="text-xs font-semibold text-blue-100 uppercase tracking-wide">
                    Rekomendasi Utama
                  </p>
                </div>

                <h2 className="text-2xl font-bold mb-3">{rekomendasiUtama}</h2>

                <p className="text-sm text-blue-100 leading-relaxed mb-4">
                  {penjelasanUtama}
                </p>

                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-full text-xs font-medium text-white border
                        ${idx === 0
                          ? 'bg-yellow-400/30 border-yellow-300/30 text-yellow-200'
                          : 'bg-white/20 border-white/20'
                        }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tips tambahan */}
            {isSiswa && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="text-lg">💡</div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">
                      Tips Memilih Jurusan
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Hasil rekomendasi ini bersifat membantu. Kamu tetap bisa
                      memilih jurusan sesuai keinginan dan passion-mu. Diskusikan
                      juga dengan orang tua dan guru BK ya!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="p-6 pt-3 border-t border-slate-100 space-y-3">
            {isSiswa && (
              <button
                onClick={() => router.push('/soal')}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold text-sm hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Ulangi Tes
              </button>
            )}

            {isAdmin && (
              <div className="flex gap-3">
                {onKembali && (
                  <button
                    onClick={onKembali}
                    className="flex-1 py-3.5 px-4 bg-slate-100 text-slate-700 rounded-2xl font-semibold text-sm hover:bg-slate-200 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Kembali
                  </button>
                )}
                <button
                  onClick={handleCetak}
                  className="flex-1 py-3.5 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold text-sm hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Cetak Hasil
                </button>
              </div>
            )}

            <p className="text-center text-xs text-slate-400">
              {isAdmin ? 'Hasil rekomendasi jurusan siswa' : 'Hasil tes akan disimpan oleh guru BK kamu'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HasilPage;