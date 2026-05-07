'use client';

import { CreateUser } from '@/lib/function/userFunction';
import React, { useState } from 'react';

const RegisterPage = ({ goLogin, afterRegister }: any) => {
  // akun
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // data diri
  const [username, setUsername] = useState('');
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('');
  const [usia, setUsia] = useState<number | string>('');
  const [kelamin, setKelamin] = useState('pria');
  const [isLoading, setisLoading] = useState(false);

  const handleRegister = async () => {
    if (!nama || !kelas || !usia || !username || !email || !password) {
      alert('Mohon isi semua data.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Password dan konfirmasi password tidak sesuai.');
      return;
    }

    setisLoading(true);
    try {
      const res = await CreateUser({
        nama_lengkap: nama,
        kelas: kelas,
        usia: Number(usia),
        kelamin: kelamin,
        username: username,
        email: email,
        password: password,
      });

      if (res) {
        alert('Register berhasil! Silakan login.');
        afterRegister();
      } else {
        alert(res || 'Terjadi kesalahan saat register.');
      }
    } catch (error) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setisLoading(false);
    }
  };

  // Komponen Reusable untuk Label Input
  const InputLabel = ({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) => (
    <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-2 ml-1">
      {icon && <span className="text-indigo-400">{icon}</span>}
      {children}
    </label>
  );

  // Styling Standar untuk Input
  const inputClass =
    'w-full px-5 py-3.5 bg-blue-50/50 border border-blue-100 rounded-2xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white focus:border-blue-200 transition-all duration-300';

  // Icon SVG kecil untuk label
  const UserIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const MailIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  const LockIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  const SchoolIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );

  return (
    // Background dengan animasi blob
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100 p-4 md:p-8 relative overflow-hidden">
      {/* Dekorasi Lingkaran Background */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Card Container */}
      <div className="w-full max-w-3xl relative z-10">
        {/* Logo / Icon Container */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-blue-50">
          {/* Header Section */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">
              Daftar Akun Baru
            </h1>
            <p className="text-base text-slate-500">Lengkapi data dirimu untuk mulai kuis</p>
          </div>

          {/* Form Section menggunakan Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* ----- KOLOM KIRI: DATA DIRI ----- */}
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-indigo-600 border-b-2 border-indigo-100 pb-3 mb-4 flex items-center gap-2">
                <SchoolIcon />
                Data Pribadi
              </h2>

              <div>
                <InputLabel icon={<UserIcon />}>Nama Lengkap</InputLabel>
                <input
                  type="text"
                  placeholder="Contoh: Andi Pratama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <InputLabel>Kelas</InputLabel>
                  <input
                    type="text"
                    placeholder="Contoh: 9-A"
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <InputLabel>Usia</InputLabel>
                  <input
                    type="number"
                    placeholder="13"
                    value={usia}
                    onChange={(e) => setUsia(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <InputLabel>Jenis Kelamin</InputLabel>
                <div className="w-full flex gap-3 p-1.5 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <button
                    type="button"
                    onClick={() => setKelamin('pria')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-300
                      ${kelamin === 'pria'
                        ? 'bg-white text-blue-600 shadow-md shadow-blue-100'
                        : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Laki-Laki
                  </button>

                  <button
                    type="button"
                    onClick={() => setKelamin('wanita')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-300
                      ${kelamin === 'wanita'
                        ? 'bg-white text-pink-500 shadow-md shadow-pink-100'
                        : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Perempuan
                  </button>
                </div>
              </div>
            </div>

            {/* ----- KOLOM KANAN: AKUN ----- */}
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-indigo-600 border-b-2 border-indigo-100 pb-3 mb-4 flex items-center gap-2">
                <LockIcon />
                Informasi Akun
              </h2>

              <div>
                <InputLabel icon={<UserIcon />}>Username</InputLabel>
                <input
                  type="text"
                  placeholder="Buat username unik"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <InputLabel icon={<MailIcon />}>Email</InputLabel>
                <input
                  type="email"
                  placeholder="emailkamu@sekolah.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <InputLabel icon={<LockIcon />}>Password</InputLabel>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <InputLabel icon={<LockIcon />}>Konfirmasi Password</InputLabel>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Ulangi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* BUTTON SECTION */}
          <div className="mt-10 flex flex-col items-center gap-4 border-t-2 border-blue-50 pt-8">
            <button
              onClick={handleRegister}
              disabled={isLoading}
              className={`w-full max-w-md py-4 rounded-2xl font-semibold text-white transition-all duration-300 flex justify-center items-center gap-2
                ${isLoading
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:-translate-y-0.5 active:scale-[0.98]'
                }
              `}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                  Mendaftar...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Buat Akun
                </>
              )}
            </button>

            <p className="text-sm text-slate-500 font-medium">
              Sudah punya akun?{' '}
              <span
                className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700 transition-colors underline-offset-2 hover:underline"
                onClick={goLogin}
              >
                Login di sini
              </span>
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Sistem Pendukung Keputusan Rekomendasi Jurusan
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;