'use client';

import React, { useEffect, useRef, useState } from 'react';
import { soalList } from '@/lib/data/dataSoal';
import { soalBakat } from '@/lib/data/dataBakat';
import { dataAkademik } from '@/lib/data/dataAkademik';
import { submitTes } from '@/lib/function/api';

const pilihanRiasec = [
  { label: 'A', nilai: 5, text: 'Sangat Suka' },
  { label: 'B', nilai: 4, text: 'Suka' },
  { label: 'C', nilai: 3, text: 'Netral' },
  { label: 'D', nilai: 2, text: 'Tidak Suka' },
  { label: 'E', nilai: 1, text: 'Sangat Tidak Suka' },
];

const dummyUser = {
  nama_lengkap: 'Andi Pratama',
  username: 'andi123',
  email: 'andi@sekolah.sch.id',
  kelas: '9-A',
};

const SoalPage = ({ onFinish }: { onFinish: (data: any) => void }) => {
  const [step, setStep] = useState(1);
  const [jawabanRiasec, setJawabanRiasec] = useState<any[]>([]);
  const [jawabanBakat, setJawabanBakat] = useState<any[]>([]);
  const [akademik, setAkademik] = useState({
    mtk: 0,
    indo: 0,
    ipa: 0,
    ips: 0,
  });

  const [showProfile, setShowProfile] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===== REFS UNTUK SCROLL =====
  const contentRef = useRef<HTMLDivElement>(null);
  const soalRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    setJawabanRiasec(
      soalList.map((item) => ({
        soal_id: item.id,
        nilai: 0,
      }))
    );
    setJawabanBakat(
      soalBakat.map((item) => ({
        soal_id: item.id,
        jawaban: '',
      }))
    );
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
      prev.map((j) => (j.soal_id === id ? { ...j, jawaban: value } : j))
    );
  };

  const updateAkademik = (key: string, value: number) => {
    const clampedValue = Math.min(100, Math.max(0, value));
    setAkademik((prev) => ({
      ...prev,
      [key]: clampedValue,
    }));
  };

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
    return akademik.mtk > 0 && akademik.indo > 0 && akademik.ipa > 0 && akademik.ips > 0;
  };

  const isStep2Complete = () => {
    return jawabanRiasec.every((j) => j.nilai > 0);
  };

  const isStep3Complete = () => {
    return jawabanBakat.every((j) => j.jawaban !== '');
  };

  // ===== CARI SOAL PERTAMA YANG BELUM TERJAWAB =====
  const getFirstUnansweredIndex = (): number | null => {
    if (step === 1) {
      const keys = ['mtk', 'indo', 'ipa', 'ips'];
      for (let i = 0; i < keys.length; i++) {
        if (akademik[keys[i] as keyof typeof akademik] === 0) return i;
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
      const keys = ['mtk', 'indo', 'ipa', 'ips'];
      refKey = `akademik-${keys[firstUnanswered]}`;
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
    alert('Logout berhasil! (Nanti redirect ke halaman login)');
    setShowLogout(false);
  };

  const handleSubmit = async () => {
    // Cek semua jawaban lengkap
    if (!isStep3Complete()) {
      alert('Mohon lengkapi semua jawaban terlebih dahulu.');
      scrollToUnanswered();
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
      mtk: akademik.mtk,
      indo: akademik.indo,
      ipa: akademik.ipa,
      ips: akademik.ips,
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
        onFinish({
          akademik: result.rekomendasi_akademik,
          riasec: result.rekomendasi_riasec,
          bakat: result.rekomendasi_bakat,
          gabungan: result.rekomendasi_gabungan,
        });
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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Tes Penjurusan</h1>
              <p className="text-xs text-slate-500">Hai, {dummyUser.nama_lengkap.split(' ')[0]}</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              {dummyUser.nama_lengkap.charAt(0)}
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)}></div>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 z-40">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800">{dummyUser.nama_lengkap}</p>
                    <p className="text-xs text-slate-500">Kelas {dummyUser.kelas}</p>
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
          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-blue-50 flex flex-col h-[85vh]">
            {/* HEADER */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span>{stepIcons[step - 1]}</span>
                  Step {step}
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
              className="flex-1 overflow-y-auto px-6 pb-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent scroll-smooth"
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
                          Masukkan nilai rapor semester terakhir untuk setiap mata pelajaran (0-100). Geser slider atau ketik langsung nilainya.
                        </p>
                      </div>
                    </div>
                  </div>

                  {dataAkademik.map((item) => {
                    const nilai = akademik[item.key as keyof typeof akademik];
                    const info = getNilaiInfo(nilai);
                    return (
                      <div
                        key={item.key}
                        ref={(el) => { soalRefs.current[`akademik-${item.key}`] = el; }}
                        className="bg-white border border-blue-50 rounded-2xl p-5 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs font-bold">
                              {item.label.charAt(0)}
                            </span>
                            {item.label}
                          </p>
                          {nilai > 0 && (
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${info.bg} ${info.color}`}>
                              {info.label}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex-1 relative">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={nilai}
                              onChange={(e) => updateAkademik(item.key, parseInt(e.target.value) || 0)}
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
                                const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                updateAkademik(item.key, val);
                              }}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                updateAkademik(item.key, val);
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
                          Jawablah sesuai dengan perasaanmu yang sebenarnya. Tidak ada jawaban benar atau salah. Pilih dari Sangat Suka sampai Sangat Tidak Suka.
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
                {dummyUser.nama_lengkap.charAt(0)}
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-800 text-center mb-1">{dummyUser.nama_lengkap}</h2>
            <p className="text-sm text-blue-600 font-medium text-center mb-4">Siswa Kelas {dummyUser.kelas}</p>

            <div className="space-y-3 bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Username</p>
                  <p className="text-sm font-medium text-slate-700">@{dummyUser.username}</p>
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
                  <p className="text-sm font-medium text-slate-700">{dummyUser.email}</p>
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
                  <p className="text-sm font-medium text-slate-700">{dummyUser.kelas}</p>
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
              Apakah kamu yakin ingin keluar? Progress tes yang belum disubmit akan hilang.
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