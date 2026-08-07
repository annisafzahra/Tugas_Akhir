'use client';

import React, { useEffect, useRef, useState } from 'react';
import { soalList } from '@/lib/data/dataSoal';
import { soalBakat } from '@/lib/data/dataBakat';
import { dataAkademik } from '@/lib/data/dataAkademik';
import { getMe, submitTes } from '@/lib/function/api';
import { useRouter } from 'next/navigation';
import { UserType } from '@/type/dataHasilTestType';

const pilihanRiasec = [
  { label: 'A', nilai: 5, text: 'Sangat Setuju' },
  { label: 'B', nilai: 4, text: 'Setuju' },
  { label: 'C', nilai: 3, text: 'Netral' },
  { label: 'D', nilai: 2, text: 'Tidak Setuju' },
  { label: 'E', nilai: 1, text: 'Sangat Tidak Setuju' },
];

// const me = {
//   nama_lengkap: 'Andi Pratama',
//   username: 'andi123',
//   email: 'andi@sekolah.sch.id',
//   kelas: '9-A',
// };

const SoalPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [jawabanRiasec, setJawabanRiasec] = useState<any[]>([]);
  const [jawabanBakat, setJawabanBakat] = useState<any[]>([]);
  const [akademik, setAkademik] = useState({
    mtk: [0, 0, 0, 0, 0, 0],
    indo: [0, 0, 0, 0, 0, 0],
    ipa: [0, 0, 0, 0, 0, 0],
    ips: [0, 0, 0, 0, 0, 0],
  });

  // Semester yang sedang ditampilkan pada masing-masing mata pelajaran.
  // Nilai 0 = S1, 1 = S2, dst.
  const [semesterAktif, setSemesterAktif] = useState({
    mtk: 0,
    indo: 0,
    ipa: 0,
    ips: 0,
  });
  const [me, setMe] = useState<UserType>({
    id: 0,
    username: '',
    nama_lengkap: '',
    kelas: '',
    usia: 0,
    kelamin: '',
    email: '',
    is_staff: false,
  });

  const [showProfile, setShowProfile] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnswerCheck, setShowAnswerCheck] = useState(false);

  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  const getDraftKey = () => {
    const userId = localStorage.getItem('user_id_jurusan');
    return `draft_soal_jurusan_${userId || 'guest'}`;
  };

  const defaultRiasecAnswers = () =>
    soalList.map((item) => ({
      soal_id: item.id,
      nilai: 0,
    }));

  const defaultBakatAnswers = () =>
    soalBakat.map((item) => ({
      soal_id: item.id,
      jawaban: '',
      nilai: 0,
    }));

  const normalizeAkademikDraft = (savedAkademik: any) => {
    const keys = ['mtk', 'indo', 'ipa', 'ips'] as const;

    return keys.reduce(
      (result, key) => {
        const value = savedAkademik?.[key];

        // Mendukung draft lama yang masih menyimpan satu angka per mapel.
        result[key] = Array.isArray(value)
          ? [...value.slice(0, 6), ...Array(Math.max(0, 6 - value.length)).fill(0)]
          : [Number(value) || 0, 0, 0, 0, 0, 0];

        return result;
      },
      {
        mtk: [0, 0, 0, 0, 0, 0],
        indo: [0, 0, 0, 0, 0, 0],
        ipa: [0, 0, 0, 0, 0, 0],
        ips: [0, 0, 0, 0, 0, 0],
      } as Record<'mtk' | 'indo' | 'ipa' | 'ips', number[]>
    );
  };

  // ===== REFS UNTUK SCROLL =====
  const contentRef = useRef<HTMLDivElement>(null);
  const soalRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const allowLeaveRef = useRef(false);

  useEffect(() => {
    const savedDraft = localStorage.getItem(getDraftKey());
  
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
  
        setStep(draft.step || 1);
  
        setAkademik(
          normalizeAkademikDraft(
            draft.akademik || {
              mtk: [0, 0, 0, 0, 0, 0],
              indo: [0, 0, 0, 0, 0, 0],
              ipa: [0, 0, 0, 0, 0, 0],
              ips: [0, 0, 0, 0, 0, 0],
            }
          )
        );
  
        setJawabanRiasec(
          draft.jawabanRiasec?.length
            ? draft.jawabanRiasec
            : defaultRiasecAnswers()
        );
  
        setJawabanBakat(
          draft.jawabanBakat?.length
            ? draft.jawabanBakat
            : defaultBakatAnswers()
        );
      } catch (error) {
        console.log('Draft rusak, reset ulang:', error);
  
        localStorage.removeItem(getDraftKey());
  
        setJawabanRiasec(defaultRiasecAnswers());
        setJawabanBakat(defaultBakatAnswers());
      }
    } else {
      setJawabanRiasec(defaultRiasecAnswers());
      setJawabanBakat(defaultBakatAnswers());
    }
  
    setIsDraftLoaded(true);
  }, []);

  useEffect(() => {
    if (!isDraftLoaded) return;
  
    const draft = {
      step,
      akademik,
      jawabanRiasec,
      jawabanBakat,
    };
  
    localStorage.setItem(getDraftKey(), JSON.stringify(draft));
  }, [step, akademik, jawabanRiasec, jawabanBakat, isDraftLoaded]);

  useEffect(()=>{
    const fetch = async () => {
      const id = localStorage.getItem('user_id_jurusan');
      const res = await getMe(Number(id))
      if(res.status === 200){
        setMe(res.data);
        alert(`Selamat datang, ${res.data.nama_lengkap.split(' ')[0]}!`);
      }
    }
    fetch()
  }, [])

  useEffect(() => {
    // Tambah history palsu supaya tombol back bisa dicegat
    window.history.pushState({ page: 'soal' }, '', window.location.href);
  
    const handleBrowserBack = () => {
      if (allowLeaveRef.current) return;
  
      // Tahan user tetap di halaman soal
      window.history.pushState({ page: 'soal' }, '', window.location.href);
  
      // Tampilkan popup konfirmasi
      setShowLogout(true);
    };
  
    window.addEventListener('popstate', handleBrowserBack);
  
    return () => {
      window.removeEventListener('popstate', handleBrowserBack);
    };
  }, []);

  // ===== SCROLL TO TOP SAAT PINDAH STEP =====
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  const updateRiasec = (id: number, nilai: number) => {
    setJawabanRiasec((prev) =>
      prev.map((j) => (j.soal_id === id ? { ...j, nilai } : j))
    );
  };

  const updateBakat = (id: number, value: string) => {
    setJawabanBakat((prev) =>
      prev.map((j) => (j.soal_id === id ? { ...j, jawaban: value, nilai: 1 } : j))
    );
  };

  const updateAkademik = (
    key: keyof typeof akademik,
    semesterIndex: number,
    value: number
  ) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    setAkademik((prev) => ({
      ...prev,
      [key]: prev[key].map((nilai, index) =>
        index === semesterIndex ? clampedValue : nilai
      ),
    }));
  };

  const rataRataAkademik = (key: keyof typeof akademik) => {
    const nilaiSemester = akademik[key];
    const total = nilaiSemester.reduce((sum, nilai) => sum + nilai, 0);
    return Math.round(total / nilaiSemester.length);
  };

  const jumlahAkademikTerisi = Object.values(akademik).reduce(
    (total, nilaiMapel) =>
      total + nilaiMapel.filter((nilai) => Number(nilai) > 0).length,
    0
  );

  const hitungBakat = () => {
    const result: any = { logika: 0, verbal: 0, mekanikal: 0 };
    soalBakat.forEach((soal) => {
      const user = jawabanBakat.find((j) => j.soal_id === soal.id)?.jawaban;
      if (user === soal.jawaban) {
        result[soal.kategori] += 1;
      }
    });
    return result;
  };

  const isStep1Complete = () => {
    return Object.values(akademik).every((nilaiMapel) =>
      nilaiMapel.every((nilai) => Number(nilai) > 0)
    );
  };

  const isStep2Complete = () => {
    return jawabanRiasec.every((j) => j.nilai > 0);
  };

  const isStep3Complete = () => {
    return jawabanBakat.every((j) => j.jawaban !== '');
  };

  const akademikItems = [
    { key: 'mtk', label: 'MTK', title: 'Matematika' },
    { key: 'indo', label: 'INDO', title: 'Bahasa Indonesia' },
    { key: 'ipa', label: 'IPA', title: 'Ilmu Pengetahuan Alam' },
    { key: 'ips', label: 'IPS', title: 'Ilmu Pengetahuan Sosial' },
  ] as const;

  const answerTargets = [
    ...akademikItems.flatMap((item) =>
      akademik[item.key].map((nilai, semesterIndex) => ({
        step: 1,
        group: 'Akademik',
        label: `${item.label} S${semesterIndex + 1}`,
        title: `${item.title} Semester ${semesterIndex + 1}`,
        refKey: `akademik-${item.key}-${semesterIndex}`,
        answered: Number(nilai) > 0,
        value: nilai,
        key: item.key,
        semesterIndex,
      }))
    ),
    ...soalList.map((item, index) => {
      const jawaban = jawabanRiasec.find((j) => j.soal_id === item.id);
      return {
        step: 2,
        group: 'RIASEC',
        label: String(index + 1),
        title: `Soal ${index + 1}`,
        refKey: `riasec-${item.id}`,
        answered: Number(jawaban?.nilai || 0) > 0,
        value: jawaban?.nilai || 0,
      };
    }),
    ...soalBakat.map((item: any, index: number) => {
      const jawaban = jawabanBakat.find((j) => j.soal_id === item.id);
      return {
        step: 3,
        group: 'Bakat',
        label: String(index + 1),
        title: `Soal ${index + 1}`,
        refKey: `bakat-${item.id}`,
        answered: Boolean(jawaban?.jawaban),
        value: jawaban?.jawaban || '',
      };
    }),
  ];

  const unansweredTargets = answerTargets.filter((item) => !item.answered);
  const totalAnswered = answerTargets.length - unansweredTargets.length;
  const progressJawaban = answerTargets.length > 0 ? Math.round((totalAnswered / answerTargets.length) * 100) : 0;

  const goToAnswerTarget = (target: any) => {
    setShowAnswerCheck(false);

    if (
      target.step === 1 &&
      target.key &&
      typeof target.semesterIndex === 'number'
    ) {
      setSemesterAktif((prev) => ({
        ...prev,
        [target.key]: target.semesterIndex,
      }));
    }

    setStep(target.step);

    setTimeout(() => {
      const el = soalRefs.current[target.refKey];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-red-300', 'ring-offset-2');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-red-300', 'ring-offset-2');
        }, 2000);
      }
    }, 250);
  };

  // ===== CARI SOAL PERTAMA YANG BELUM TERJAWAB =====
  const getFirstUnansweredIndex = (): number | null => {
    if (step === 1) {
      for (let mapelIndex = 0; mapelIndex < akademikItems.length; mapelIndex++) {
        const item = akademikItems[mapelIndex];
        for (let semesterIndex = 0; semesterIndex < 6; semesterIndex++) {
          if (Number(akademik[item.key][semesterIndex]) === 0) {
            return mapelIndex * 6 + semesterIndex;
          }
        }
      }
      return null;
    }

    if (step === 2) {
      for (let i = 0; i < jawabanRiasec.length; i++) {
        if (jawabanRiasec[i].nilai === 0) return i;
      }
      return null;
    }

    if (step === 3) {
      for (let i = 0; i < jawabanBakat.length; i++) {
        if (jawabanBakat[i].jawaban === '') return i;
      }
      return null;
    }

    return null;
  };

  // ===== SCROLL KE SOAL YANG BELUM TERJAWAB =====
  const scrollToUnanswered = () => {
    const firstUnanswered = getFirstUnansweredIndex();
    if (firstUnanswered === null) return;

    let refKey = '';

    if (step === 1) {
      const mapelIndex = Math.floor(firstUnanswered / 6);
      const semesterIndex = firstUnanswered % 6;
      const item = akademikItems[mapelIndex];

      setSemesterAktif((prev) => ({
        ...prev,
        [item.key]: semesterIndex,
      }));

      refKey = `akademik-${item.key}-${semesterIndex}`;
    } else if (step === 2) {
      refKey = `riasec-${soalList[firstUnanswered].id}`;
    } else if (step === 3) {
      refKey = `bakat-${soalBakat[firstUnanswered].id}`;
    }

    const el = soalRefs.current[refKey];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight sementara
      el.classList.add('ring-2', 'ring-red-300');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-red-300');
      }, 2000);
    }
  };

  const canNextStep = () => {
    if (step === 1) return isStep1Complete();
    if (step === 2) return isStep2Complete();
    return true;
  };

  const getNilaiInfo = (nilai: number) => {
    if (nilai === 0) return { label: '', color: 'text-slate-400', bg: 'bg-slate-100' };
    if (nilai >= 71) return { label: 'Tinggi', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (nilai >= 41) return { label: 'Sedang', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { label: 'Rendah', color: 'text-red-500', bg: 'bg-red-50' };
  };

  const handleLogout = () => {
    allowLeaveRef.current = true;
  
    const userId = localStorage.getItem('user_id_jurusan');
    localStorage.removeItem(`draft_soal_jurusan_${userId || 'guest'}`);
  
    setShowLogout(false);
    router.push('/');
  };

  const handleSubmit = async () => {
    // Cek semua jawaban lengkap
    if (!isStep1Complete() || !isStep2Complete() || !isStep3Complete()) {
      alert('Mohon lengkapi semua jawaban terlebih dahulu.');

      if (!isStep1Complete()) {
        setStep(1);
      } else if (!isStep2Complete()) {
        setStep(2);
      } else {
        setStep(3);
      }

      setTimeout(() => scrollToUnanswered(), 150);
      return;
    }

    setIsSubmitting(true);

    const nilaiBakat = hitungBakat();

    const dimensiScores: any = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    jawabanRiasec.forEach((j: any) => {
      const soal = soalList.find((s) => s.id === j.soal_id);
      if (soal) {
        dimensiScores[soal.dimensi] += j.nilai;
      }
    });

    const dataUntukBackend = {
      // Backend tetap menerima 1 nilai per mapel.
      // Nilai yang dikirim adalah rata-rata dari Semester 1 s.d. Semester 6.
      mtk: rataRataAkademik('mtk'),
      indo: rataRataAkademik('indo'),
      ipa: rataRataAkademik('ipa'),
      ips: rataRataAkademik('ips'),
      realistic: dimensiScores.R,
      investigative: dimensiScores.I,
      artistic: dimensiScores.A,
      social: dimensiScores.S,
      enterprising: dimensiScores.E,
      conventional: dimensiScores.C,
      logika: nilaiBakat.logika,
      verbal: nilaiBakat.verbal,
      mekanikal: nilaiBakat.mekanikal,
    };

    console.log('📦 Data dikirim ke backend:');
    console.table(dataUntukBackend);

    try {
      const response = await submitTes(dataUntukBackend);
    
      if (response.status === 201) {
        const result = response.data;
        console.log('✅ Response dari backend:', result);
      
        localStorage.removeItem(getDraftKey());
      
        const params = new URLSearchParams({
          akademik: result.rekomendasi_akademik || '-',
          riasec: result.rekomendasi_riasec || '-',
          bakat: result.rekomendasi_bakat || '-',
          gabungan: result.rekomendasi_gabungan || '-',
        });
      
        router.push(`/hasil?${params.toString()}`);
      }
    } catch (error: any) {
      console.error('❌ Gagal submit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepIcons = ['📚', '💭', '🧠'];

  

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-blue-100 via-white to-indigo-100 relative overflow-hidden">
      {/* Dekorasi Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* ===== TOP NAVBAR ===== */}
      <div className="relative z-20 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
          <button onClick={()=>{router.push('/landing')}} className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 transition-all duration-300 ease-in-out hover:scale-110">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.25 19.25L3.75 12l6.5-7.25M4.5 12h15"
              />
            </svg>
          </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Tes Penjurusan</h1>
              <p className="text-xs text-slate-500">Hai, {me.nama_lengkap.split(' ')[0]}</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              {me.nama_lengkap.charAt(0)}
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)}></div>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 z-40">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800">{me.nama_lengkap}</p>
                    <p className="text-xs text-slate-500">Kelas {me.kelas}</p>
                  </div>
                  <button
                    onClick={() => { setShowDropdown(false); setShowProfile(true); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 transition-colors"
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </button>
                  <button
                    onClick={() => { setShowDropdown(false); setShowLogout(true); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-2xl">
          <div className="relative bg-white p-6 rounded-3xl shadow-xl border border-slate-200 flex flex-col h-[85vh]">
            
            {/* NUMBER SOAL DESKTOP */}
            <div className="absolute left-full top-0 z-40 ml-5 hidden w-[340px] rounded-[2rem] border border-blue-100 bg-white/95 p-7 shadow-2xl shadow-slate-200/70 backdrop-blur xl:block">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  {/* <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">Peta Jawaban</p> */}
                  <h3 className="mt-1 text-base font-bold text-slate-800">Cek Kelengkapan Tes</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {totalAnswered} dari {answerTargets.length} sudah terisi.
                  </p>
                </div>
                <button
                  onClick={() => setShowAnswerCheck(true)}
                  className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Cek
                </button>
              </div>

              <div className="mb-5 rounded-2xl bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Progress</span>
                  <span className="font-bold text-blue-600">{progressJawaban}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                    style={{ width: `${progressJawaban}%` }}
                  />
                </div>
                <p className={`mt-2 text-xs font-medium ${unansweredTargets.length === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {unansweredTargets.length === 0
                    ? 'Semua jawaban sudah lengkap.'
                    : `${unansweredTargets.length} jawaban belum terisi.`}
                </p>
              </div>

              <div className="max-h-[58vh] space-y-5 overflow-y-auto pr-1">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Step 1 Akademik</p>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                      {jumlahAkademikTerisi}/24
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[0, 1, 2, 3, 4, 5].map((semesterIndex) => {
                      const semesterLengkap = akademikItems.every(
                        (item) => Number(akademik[item.key][semesterIndex]) > 0
                      );

                      return (
                        <div
                          key={semesterIndex}
                          className={`rounded-2xl border p-2 ${
                            semesterLengkap
                              ? 'border-emerald-200 bg-emerald-50/60'
                              : 'border-red-100 bg-red-50/40'
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span
                              className={`text-[10px] font-bold ${
                                semesterLengkap ? 'text-emerald-600' : 'text-red-500'
                              }`}
                            >
                              Semester {semesterIndex + 1}
                            </span>

                            <span
                              className={`text-[9px] font-semibold ${
                                semesterLengkap ? 'text-emerald-600' : 'text-red-400'
                              }`}
                            >
                              {semesterLengkap ? 'Lengkap' : 'Belum lengkap'}
                            </span>
                          </div>

                          <div className="grid grid-cols-4 gap-1.5">
                            {akademikItems.map((item) => {
                              const answered =
                                Number(akademik[item.key][semesterIndex]) > 0;

                              return (
                                <button
                                  key={`${item.key}-${semesterIndex}`}
                                  onClick={() => {
                                    setSemesterAktif((prev) => ({
                                      ...prev,
                                      [item.key]: semesterIndex,
                                    }));

                                    goToAnswerTarget({
                                      step: 1,
                                      refKey: `akademik-${item.key}-${semesterIndex}`,
                                    });
                                  }}
                                  className={`flex h-9 items-center justify-center rounded-xl border text-[10px] font-bold transition hover:-translate-y-0.5
                                    ${
                                      answered
                                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-100'
                                        : 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100'
                                    }`}
                                >
                                  {item.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Step 2 RIASEC</p>
                    <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-600">
                      {jawabanRiasec.filter((item) => Number(item.nilai) > 0).length}/{jawabanRiasec.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {jawabanRiasec.map((item, index) => {
                      const answered = Number(item.nilai) > 0;
                      return (
                        <button
                          key={index}
                          onClick={() => goToAnswerTarget({ step: 2, refKey: `riasec-${item.soal_id}` })}
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-xs font-bold transition hover:-translate-y-0.5
                            ${answered
                              ? 'border-purple-500 bg-purple-500 text-white shadow-md shadow-purple-100'
                              : 'border-slate-200 bg-slate-100 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500'
                            }`}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Step 3 Bakat</p>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                      {jawabanBakat.filter((item) => item.jawaban !== '').length}/{jawabanBakat.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {jawabanBakat.map((item, index) => {
                      const answered = item.jawaban !== '';
                      return (
                        <button
                          key={index}
                          onClick={() => goToAnswerTarget({ step: 3, refKey: `bakat-${item.soal_id}` })}
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-xs font-bold transition hover:-translate-y-0.5
                            ${answered
                              ? 'border-green-500 bg-green-500 text-white shadow-md shadow-green-100'
                              : 'border-slate-200 bg-slate-100 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500'
                            }`}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* TOMBOL CEK JAWABAN MOBILE */}
            <button
              onClick={() => setShowAnswerCheck(true)}
              className="absolute right-4 -top-4 z-20 flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs font-bold text-blue-600 shadow-lg shadow-slate-200 border-1 border-blue-500 transition hover:bg-blue-50 xl:hidden"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
                {unansweredTargets.length}
              </span>
              Cek
            </button>
            
            {/* HEADER */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span>{stepIcons[step - 1]}</span>
                  {step === 1 && 'Step 1 - Nilai Akademik'}
                  {step === 2 && 'Step 2 - Tes Minat (RIASEC)'}
                  {step === 3 && 'Step 3 - Tes Bakat'}
                </h2>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  {step}/3
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${(step / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* CONTENT */}
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent scroll-smooth"
            >
              {/* ===== STEP 1: AKADEMIK ===== */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">📚</div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm mb-1">Nilai Akademik</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Masukkan nilai rapor Semester 1 sampai Semester 6 untuk setiap mata pelajaran (0-100). Pilih semester dengan tombol S1-S6, lalu geser slider atau ketik langsung nilainya.
                        </p>
                      </div>
                    </div>
                  </div>

                  {dataAkademik.map((item) => {
                    const key = item.key as keyof typeof akademik;
                    const semesterIndex = semesterAktif[key];
                    const nilai = akademik[key][semesterIndex];
                    const info = getNilaiInfo(nilai);

                    return (
                      <div
                        key={item.key}
                        className="bg-white border border-blue-50 rounded-2xl p-5 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex flex-col gap-3 mb-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                              <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs font-bold">
                                {item.label.charAt(0)}
                              </span>
                              {item.label}
                            </p>

                            {/* {nilai > 0 && (
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${info.bg} ${info.color}`}>
                                {info.label}
                              </span>
                            )} */}
                          </div>

                          {/* PILIH SEMESTER S1 - S6 */}
                          <div className="grid grid-cols-6 gap-2">
                            {[0, 1, 2, 3, 4, 5].map((sem) => {
                              const nilaiSemester = akademik[key][sem];
                              const sudahDiisi = Number(nilaiSemester) > 0;
                              const sedangAktif = semesterIndex === sem;

                              return (
                                <button
                                  key={sem}
                                  type="button"
                                  onClick={() =>
                                    setSemesterAktif((prev) => ({
                                      ...prev,
                                      [key]: sem,
                                    }))
                                  }
                                  className={`h-9 rounded-xl border text-[11px] font-bold transition-all duration-200
                                    ${
                                      sudahDiisi
                                        ? 'border-blue-500 bg-blue-500 text-white'
                                        : 'border-red-300 bg-red-50 text-red-500'
                                    }
                                    ${
                                      sedangAktif
                                        ? 'ring-2 ring-blue-400 ring-offset-2 scale-105'
                                        : 'hover:scale-105'
                                    }`}
                                >
                                  S{sem + 1}
                                </button>
                              );
                            })}
                          </div>

                          <p className="text-[11px] text-slate-400">
                            Sedang mengisi <span className="font-semibold text-blue-600">Semester {semesterIndex + 1}</span>
                            {' '}• Hijau = sudah diisi, merah = belum diisi.
                          </p>
                        </div>

                        <div
                          ref={(el) => {
                            soalRefs.current[`akademik-${item.key}-${semesterIndex}`] = el;
                          }}
                          className="rounded-xl"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={nilai}
                                onChange={(e) =>
                                  updateAkademik(
                                    key,
                                    semesterIndex,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500
                                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500
                                  [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
                                  [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                              />

                              <div className="flex justify-between px-1 mt-1">
                                <span className="text-[10px] text-slate-400">0</span>
                                <span className="text-[10px] text-slate-400">25</span>
                                <span className="text-[10px] text-slate-400">50</span>
                                <span className="text-[10px] text-slate-400">75</span>
                                <span className="text-[10px] text-slate-400">100</span>
                              </div>
                            </div>

                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={nilai || ''}
                                onChange={(e) => {
                                  const val =
                                    e.target.value === ''
                                      ? 0
                                      : parseInt(e.target.value);

                                  updateAkademik(key, semesterIndex, val);
                                }}
                                onBlur={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  updateAkademik(key, semesterIndex, val);
                                }}
                                placeholder="0"
                                className="w-16 h-11 text-center text-sm font-semibold bg-blue-50 border border-blue-100 rounded-xl
                                  focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white focus:border-blue-200
                                  transition-all duration-300 text-slate-700 placeholder:text-slate-300
                                  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ===== STEP 2: RIASEC ===== */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">💭</div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm mb-1">Tes Minat (RIASEC)</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Jawablah sesuai dengan perasaanmu yang sebenarnya. Tidak ada jawaban benar atau salah. Pilih dari Sangat Setuju sampai Sangat Tidak Setuju.
                        </p>
                      </div>
                    </div>
                  </div>

                  {soalList.map((item, index) => {
                    const currentValue = jawabanRiasec.find((j) => j.soal_id === item.id)?.nilai || 0;
                    return (
                      <div
                        key={item.id}
                        ref={(el) => { soalRefs.current[`riasec-${item.id}`] = el; }}
                        className="bg-white border border-purple-50 rounded-2xl p-4 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex gap-2 mb-3">
                          <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-bold flex-shrink-0">
                            {index + 1}
                          </span>
                          <p className="text-sm text-slate-700 font-medium">{item.pertanyaan}</p>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          {pilihanRiasec.map((opt) => {
                            const isSelected = currentValue === opt.nilai;
                            return (
                              <button
                                key={opt.label}
                                onClick={() => updateRiasec(item.id, opt.nilai)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border text-left
                                  ${isSelected
                                    ? 'bg-purple-100 border-purple-300 text-purple-800 shadow-sm'
                                    : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-purple-200 hover:bg-purple-50/80'
                                  }`}
                              >
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                                  ${isSelected ? 'bg-purple-300 text-purple-800' : 'bg-slate-200 text-slate-500'}`}
                                >
                                  {opt.label}
                                </span>
                                <span>{opt.text}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ===== STEP 3: BAKAT ===== */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">🧠</div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm mb-1">Tes Bakat</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Jawablah 15 soal berikut dengan memilih satu jawaban yang paling tepat. Kerjakan dengan teliti ya!
                        </p>
                      </div>
                    </div>
                  </div>

                  {soalBakat.map((soal: any, index: number) => {
                    const selected = jawabanBakat.find((j) => j.soal_id === soal.id)?.jawaban || '';
                    return (
                      <div
                        key={soal.id}
                        ref={(el) => { soalRefs.current[`bakat-${soal.id}`] = el; }}
                        className="bg-white border border-green-50 rounded-2xl p-4 hover:shadow-md transition-all duration-300"
                      >
                        <p className="text-sm text-slate-700 font-medium mb-3">
                          <span className="text-green-600 font-bold mr-2">{index + 1}.</span>
                          {soal.pertanyaan}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {soal.opsi.map((opt: string) => {
                            const isSelected = selected === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => updateBakat(soal.id, opt)}
                                className={`p-3 rounded-xl text-xs text-left transition-all duration-200 border
                                  ${isSelected
                                    ? 'bg-green-100 border-green-300 text-green-800 shadow-sm font-medium'
                                    : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-green-200 hover:bg-green-50/80'
                                  }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* FOOTER NAVIGATION */}
            <div className="p-6 pt-4 border-t border-slate-100">
              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex-1 py-3.5 px-4 bg-slate-100 text-slate-700 rounded-2xl font-semibold text-sm hover:bg-slate-200 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Kembali
                  </button>
                )}

                {step < 3 ? (
                  <button
                    onClick={() => {
                      if (canNextStep()) {
                        setStep(step + 1);
                      } else {
                        alert('Mohon lengkapi semua jawaban di step ini terlebih dahulu.');
                        // Auto-scroll ke soal pertama yang belum dijawab
                        setTimeout(() => scrollToUnanswered(), 100);
                      }
                    }}
                    className="flex-1 py-3.5 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold text-sm hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    Lanjut
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`flex-1 py-3.5 px-4 rounded-2xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2
                      ${isSubmitting
                        ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                        : isStep3Complete()
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 hover:from-green-600 hover:to-emerald-700'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin"></div>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Submit Jawaban
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex justify-center gap-2 mt-4">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`w-2 h-2 rounded-full transition-all duration-300
                      ${s === step ? 'bg-indigo-600 w-6' : s < step ? 'bg-indigo-300' : 'bg-slate-200'}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      


      {/* ===== MODAL CEK JAWABAN ===== */}
      {showAnswerCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowAnswerCheck(false)}></div>
          
          <div className="w-[340px] rounded-2xl border border-blue-100 bg-white/95 p-7 shadow-2xl shadow-slate-200/70 backdrop-blur xl:block">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  {/* <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">Peta Jawaban</p> */}
                  <h3 className="mt-1 text-base font-bold text-slate-800">Cek Kelengkapan Tes</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {totalAnswered} dari {answerTargets.length} sudah terisi.
                  </p>
                </div>
                <button
                  onClick={() => setShowAnswerCheck(false)}
                  className="rounded-2xl bg-gradient-to-r from-red-500 to-[#ff1269] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Close
                </button>
              </div>

              <div className="mb-5 rounded-2xl bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Progress</span>
                  <span className="font-bold text-blue-600">{progressJawaban}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                    style={{ width: `${progressJawaban}%` }}
                  />
                </div>
                <p className={`mt-2 text-xs font-medium ${unansweredTargets.length === 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                  {unansweredTargets.length === 0
                    ? 'Semua jawaban sudah lengkap.'
                    : `${unansweredTargets.length} jawaban belum terisi.`}
                </p>
              </div>

              <div className="max-h-[58vh] space-y-5 overflow-y-auto pr-1">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Step 1 Akademik</p>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                      {jumlahAkademikTerisi}/24
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[0, 1, 2, 3, 4, 5].map((semesterIndex) => {
                      const semesterLengkap = akademikItems.every(
                        (item) => Number(akademik[item.key][semesterIndex]) > 0
                      );

                      return (
                        <div
                          key={semesterIndex}
                          className={`rounded-2xl border p-2 ${
                            semesterLengkap
                              ? 'border-blue-200 bg-blue-50/60'
                              : 'border-red-100 bg-red-50/40'
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span
                              className={`text-[10px] font-bold ${
                                semesterLengkap ? 'text-blue-600' : 'text-red-500'
                              }`}
                            >
                              Semester {semesterIndex + 1}
                            </span>

                            <span
                              className={`text-[9px] font-semibold ${
                                semesterLengkap ? 'text-blue-600' : 'text-red-400'
                              }`}
                            >
                              {semesterLengkap ? 'Lengkap' : 'Belum lengkap'}
                            </span>
                          </div>

                          <div className="grid grid-cols-4 gap-1.5">
                            {akademikItems.map((item) => {
                              const answered =
                                Number(akademik[item.key][semesterIndex]) > 0;

                              return (
                                <button
                                  key={`${item.key}-${semesterIndex}`}
                                  onClick={() => {
                                    setSemesterAktif((prev) => ({
                                      ...prev,
                                      [item.key]: semesterIndex,
                                    }));

                                    goToAnswerTarget({
                                      step: 1,
                                      refKey: `akademik-${item.key}-${semesterIndex}`,
                                    });
                                  }}
                                  className={`flex h-9 items-center justify-center rounded-xl border text-[10px] font-bold transition hover:-translate-y-0.5
                                    ${
                                      answered
                                        ? 'border-blue-500 bg-blue-500 text-white shadow-sm shadow-emerald-100'
                                        : 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100'
                                    }`}
                                >
                                  {item.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Step 2 RIASEC</p>
                    <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-600">
                      {jawabanRiasec.filter((item) => Number(item.nilai) > 0).length}/{jawabanRiasec.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {jawabanRiasec.map((item, index) => {
                      const answered = Number(item.nilai) > 0;
                      return (
                        <button
                          key={index}
                          onClick={() => goToAnswerTarget({ step: 2, refKey: `riasec-${item.soal_id}` })}
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-xs font-bold transition hover:-translate-y-0.5
                            ${answered
                              ? 'border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-100'
                              : 'border-slate-200 bg-slate-100 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500'
                            }`}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Step 3 Bakat</p>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                      {jawabanBakat.filter((item) => item.jawaban !== '').length}/{jawabanBakat.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {jawabanBakat.map((item, index) => {
                      const answered = item.jawaban !== '';
                      return (
                        <button
                          key={index}
                          onClick={() => goToAnswerTarget({ step: 3, refKey: `bakat-${item.soal_id}` })}
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-xs font-bold transition hover:-translate-y-0.5
                            ${answered
                              ? 'border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-100'
                              : 'border-slate-200 bg-slate-100 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500'
                            }`}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
        </div>
      )}

      {/* ===== MODAL PROFILE ===== */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowProfile(false)}></div>
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-6 z-50">
            <button
              onClick={() => setShowProfile(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {me.nama_lengkap.charAt(0)}
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-800 text-center mb-1">{me.nama_lengkap}</h2>
            <p className="text-sm text-blue-600 font-medium text-center mb-4">Siswa Kelas {me.kelas}</p>

            <div className="space-y-3 bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Username</p>
                  <p className="text-sm font-medium text-slate-700">@{me.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-medium text-slate-700">{me.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center text-green-600 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Kelas</p>
                  <p className="text-sm font-medium text-slate-700">{me.kelas}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowProfile(false)}
              className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold text-sm hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all duration-200"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ===== MODAL LOGOUT ===== */}
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowLogout(false)}></div>
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-6 z-50 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>

            <h2 className="text-lg font-bold text-slate-800 mb-2">Konfirmasi Logout</h2>
            <p className="text-sm text-slate-500 mb-6">
              Apakah kamu yakin ingin keluar dari halaman tes? Jawaban yang sudah diisi akan tetap tersimpan sebagai draft.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogout(false)}
                className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-2xl font-semibold text-sm hover:bg-slate-200 transition-all duration-200"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 px-4 bg-red-500 text-white rounded-2xl font-semibold text-sm hover:bg-red-600 transition-all duration-200 shadow-lg shadow-red-200"
              >
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SoalPage;