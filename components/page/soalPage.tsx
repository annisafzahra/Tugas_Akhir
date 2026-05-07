'use client';

import React, { useEffect, useState } from 'react';
import { soalList } from '@/lib/data/dataSoal';
import { soalBakat } from '@/lib/data/dataBakat';
import { dataAkademik } from '@/lib/data/dataAkademik';

const pilihanRiasec = [
  { label: 'A', nilai: 5, text: 'Sangat Suka' },
  { label: 'B', nilai: 4, text: 'Suka' },
  { label: 'C', nilai: 3, text: 'Netral' },
  { label: 'D', nilai: 2, text: 'Tidak Suka' },
  { label: 'E', nilai: 1, text: 'Sangat Tidak Suka' },
];

const pilihanAkademik = [
  { label: '71 - 100', value: 3, desc: 'Nilai Tinggi' },
  { label: '41 - 70', value: 2, desc: 'Nilai Sedang' },
  { label: '0 - 40', value: 1, desc: 'Nilai Rendah' },
];

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

  // =========================
  // HANDLER
  // =========================

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
    setAkademik((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // =========================
  // PERHITUNGAN
  // =========================

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

  const handleSubmit = () => {
    const nilaiBakat = hitungBakat();

    const hasil = {
      akademik: 'SMA - IPA',
      riasec: 'SMA - IPS',
      bakat: 'SMK - Akuntansi',
      gabungan: 'SMA - IPS',
    };

    onFinish(hasil);
  };

  // =========================
  // CEK STEP SELESAI
  // =========================

  const isStep1Complete = () => {
    return akademik.mtk > 0 && akademik.indo > 0 && akademik.ipa > 0 && akademik.ips > 0;
  };

  const isStep2Complete = () => {
    return jawabanRiasec.every((j) => j.nilai > 0);
  };

  const isStep3Complete = () => {
    return jawabanBakat.every((j) => j.jawaban !== '');
  };

  const canNextStep = () => {
    if (step === 1) return isStep1Complete();
    if (step === 2) return isStep2Complete();
    return true;
  };

  // =========================
  // COMPONENT STEP
  // =========================

  const StepAkademik = () => (
    <div className="space-y-6">
      {/* Deskripsi */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📚</div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm mb-1">
              Nilai Akademik
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pilih rentang nilai rapor semester terakhir untuk setiap mata
              pelajaran. Ini membantu kami mengetahui kekuatan akademikmu.
            </p>
          </div>
        </div>
      </div>

      {dataAkademik.map((item) => (
        <div
          key={item.key}
          className="bg-white border border-blue-50 rounded-2xl p-4 hover:shadow-md transition-shadow"
        >
          <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs font-bold">
              {item.label.charAt(0)}
            </span>
            {item.label}
          </p>

          <div className="grid grid-cols-3 gap-2">
            {pilihanAkademik.map((opt) => {
              const isSelected =
                akademik[item.key as keyof typeof akademik] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => updateAkademik(item.key, opt.value)}
                  className={`p-3 rounded-xl text-xs transition-all duration-200 border
                    ${
                      isSelected
                        ? 'bg-blue-100 border-blue-300 text-blue-800 shadow-sm'
                        : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-blue-50/80'
                    }`}
                >
                  <p className="font-bold text-sm">{opt.label}</p>
                  <p className="text-[10px] mt-0.5 opacity-75">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const StepRiasec = () => (
    <div className="space-y-4">
      {/* Deskripsi */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💭</div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm mb-1">
              Tes Minat (RIASEC)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Jawablah sesuai dengan perasaanmu yang sebenarnya. Tidak ada
              jawaban benar atau salah. Pilih dari Sangat Suka sampai Sangat
              Tidak Suka.
            </p>
          </div>
        </div>
      </div>

      {soalList.map((item, index) => {
        const currentValue =
          jawabanRiasec.find((j) => j.soal_id === item.id)?.nilai || 0;

        return (
          <div
            key={item.id}
            className="bg-white border border-purple-50 rounded-2xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex gap-2 mb-3">
              <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs font-bold flex-shrink-0">
                {index + 1}
              </span>
              <p className="text-sm text-slate-700 font-medium">
                {item.pertanyaan}
              </p>
            </div>

            {/* Pilihan vertikal satu baris */}
            <div className="flex flex-col gap-1.5">
              {pilihanRiasec.map((opt) => {
                const isSelected = currentValue === opt.nilai;
                return (
                  <button
                    key={opt.label}
                    onClick={() => updateRiasec(item.id, opt.nilai)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 border text-left
                      ${
                        isSelected
                          ? 'bg-purple-100 border-purple-300 text-purple-800 shadow-sm'
                          : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-purple-200 hover:bg-purple-50/80'
                      }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                      ${isSelected 
                        ? 'bg-purple-300 text-purple-800' 
                        : 'bg-slate-200 text-slate-500'
                      }`}
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
  );

  const StepBakat = () => {
    // Group soal by kategori
    const grouped = soalBakat.reduce((acc: any, soal) => {
      if (!acc[soal.kategori]) acc[soal.kategori] = [];
      acc[soal.kategori].push(soal);
      return acc;
    }, {});

    const kategoriLabel: any = {
      logika: 'Logika & Penalaran',
      verbal: 'Verbal & Bahasa',
      mekanikal: 'Mekanikal & Praktis',
    };

    const kategoriIcon: any = {
      logika: '🧮',
      verbal: '📖',
      mekanikal: '🔧',
    };

    return (
      <div className="space-y-6">
        {/* Deskripsi */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🧠</div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1">
                Tes Bakat
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ada 15 soal terbagi dalam 3 kategori. Pilih satu jawaban yang
                paling tepat untuk setiap soal.
              </p>
            </div>
          </div>
        </div>

        {Object.keys(grouped).map((kategori) => (
          <div key={kategori}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{kategoriIcon[kategori]}</span>
              <h3 className="font-semibold text-slate-700 text-sm">
                {kategoriLabel[kategori]}
              </h3>
              <span className="text-xs text-slate-400 ml-auto">
                {grouped[kategori].length} soal
              </span>
            </div>

            {grouped[kategori].map((soal: any, index: number) => {
              const selected =
                jawabanBakat.find((j) => j.soal_id === soal.id)?.jawaban || '';

              return (
                <div
                  key={soal.id}
                  className="bg-white border border-green-50 rounded-2xl p-4 mb-3 hover:shadow-md transition-shadow"
                >
                  <p className="text-sm text-slate-700 font-medium mb-3">
                    <span className="text-green-600 font-bold mr-2">
                      {index + 1}.
                    </span>
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
                            ${
                              isSelected
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
        ))}
      </div>
    );
  };

  // =========================
  // UI
  // =========================

  const stepIcons = ['📚', '💭', '🧠'];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100 p-4 relative overflow-hidden">
      {/* Dekorasi Background */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Card Container */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-blue-50 flex flex-col h-[90vh]">
          {/* HEADER */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span>{stepIcons[step - 1]}</span>
                Tes Penjurusan
              </h1>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                {step}/3
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto px-6 pb-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {step === 1 && <StepAkademik />}
            {step === 2 && <StepRiasec />}
            {step === 3 && <StepBakat />}
          </div>

          {/* FOOTER NAVIGATION */}
          <div className="p-6 pt-4 border-t border-slate-100">
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-3.5 px-4 bg-slate-100 text-slate-700 rounded-2xl font-semibold text-sm hover:bg-slate-200 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
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
                      alert(
                        'Mohon lengkapi semua jawaban di step ini terlebih dahulu.'
                      );
                    }
                  }}
                  className="flex-1 py-3.5 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold text-sm hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Lanjut
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!isStep3Complete()}
                  className={`flex-1 py-3.5 px-4 rounded-2xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2
                    ${
                      isStep3Complete()
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 hover:from-green-600 hover:to-emerald-700'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Submit Jawaban
                </button>
              )}
            </div>

            {/* Step Indicator */}
            <div className="flex justify-center gap-2 mt-4">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-all duration-300
                    ${
                      s === step
                        ? 'bg-indigo-600 w-6'
                        : s < step
                        ? 'bg-indigo-300'
                        : 'bg-slate-200'
                    }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoalPage;