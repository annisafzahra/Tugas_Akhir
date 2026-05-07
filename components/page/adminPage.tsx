'use client';

import React, { useState } from 'react';
import HasilPage from './hasilPage';

// Data dummy admin/guru BK
const dataAdmin = {
  nama: 'Budi Santoso, S.Pd.',
  nip: '198501012010011001',
  email: 'budi.santoso@sekolah.sch.id',
  role: 'Guru BK',
  avatar: null, // null pakai inisial
};

// Data dummy siswa dengan kelas
const dummyData = [
  {
    id: 1,
    nama: 'Andi Pratama',
    kelas: '9-A',
    status: 'Sudah Tes',
    tanggal: '12 Jan 2025',
    hasil: {
      akademik: 'SMA - IPA',
      riasec: 'SMA - IPS',
      bakat: 'SMK - Akuntansi',
      gabungan: 'SMA - IPA',
    },
  },
  {
    id: 2,
    nama: 'Siti Nurhaliza',
    kelas: '9-B',
    status: 'Sudah Tes',
    tanggal: '12 Jan 2025',
    hasil: {
      akademik: 'SMK - Akuntansi',
      riasec: 'SMA - IPS',
      bakat: 'SMA - IPS',
      gabungan: 'SMA - IPS',
    },
  },
  {
    id: 3,
    nama: 'Budi Santoso',
    kelas: '9-A',
    status: 'Sudah Tes',
    tanggal: '11 Jan 2025',
    hasil: {
      akademik: 'SMA - IPA',
      riasec: 'SMA - IPA',
      bakat: 'SMA - IPA',
      gabungan: 'SMA - IPA',
    },
  },
  {
    id: 4,
    nama: 'Dewi Lestari',
    kelas: '9-C',
    status: 'Belum Tes',
    tanggal: '-',
    hasil: null,
  },
  {
    id: 5,
    nama: 'Rudi Hermawan',
    kelas: '9-B',
    status: 'Sudah Tes',
    tanggal: '10 Jan 2025',
    hasil: {
      akademik: 'SMK - Teknik',
      riasec: 'SMK - Teknik',
      bakat: 'SMK - Teknik',
      gabungan: 'SMK - Teknik',
    },
  },
];

const AdminPage = () => {
  const [selected, setSelected] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Filter data berdasarkan search
  const filteredData = dummyData.filter(
    (item) =>
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kelas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistik
  const totalSiswa = dummyData.length;
  const sudahTes = dummyData.filter((item) => item.status === 'Sudah Tes').length;
  const belumTes = dummyData.filter((item) => item.status === 'Belum Tes').length;

  // Handle Logout
  const handleLogout = () => {
    // Nanti ganti dengan fungsi logout sebenarnya
    console.log('Logout...');
    window.location.href = '/login'; // atau panggil fungsi logout dari props
  };

  // Kalau klik siswa → tampil hasil dengan mode ADMIN
  if (selected && selected.hasil) {
    return (
      <HasilPage
        data={selected.hasil}
        mode="admin"
        namaSiswa={selected.nama}
        kelasSiswa={selected.kelas}
        onKembali={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-white to-indigo-100 p-4 md:p-6 relative overflow-hidden">
      {/* Dekorasi Background */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-5xl mx-auto relative z-10">
        {/* ===== TOP NAVBAR ===== */}
        <div className="flex items-center justify-between mb-6">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Dashboard Guru BK</h1>
              <p className="text-xs text-slate-500">Selamat datang, {dataAdmin.nama.split(' ')[0]}</p>
            </div>
          </div>

          {/* Avatar & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              {dataAdmin.nama.charAt(0)}
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                {/* Overlay untuk close dropdown */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                ></div>

                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Info Admin */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800">{dataAdmin.nama}</p>
                    <p className="text-xs text-slate-500">{dataAdmin.role}</p>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setShowProfile(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setShowLogout(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ===== MODAL PROFILE ===== */}
        {showProfile && (
          <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setShowProfile(false)}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-6 z-40 animate-in zoom-in-95 duration-200">
              {/* Close Button */}
              <button
                onClick={() => setShowProfile(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Avatar besar */}
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {dataAdmin.nama.charAt(0)}
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-800 text-center mb-1">
                {dataAdmin.nama}
              </h2>
              <p className="text-sm text-blue-600 font-medium text-center mb-4">
                {dataAdmin.role}
              </p>

              {/* Info Detail */}
              <div className="space-y-3 bg-slate-50 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
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
                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0M5 10h14"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">NIP</p>
                    <p className="text-sm font-medium text-slate-700">{dataAdmin.nip}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-700">{dataAdmin.email}</p>
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
          <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setShowLogout(false)}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-6 z-40 animate-in zoom-in-95 duration-200 text-center">
              {/* Icon */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>

              <h2 className="text-lg font-bold text-slate-800 mb-2">
                Konfirmasi Logout
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Apakah kamu yakin ingin keluar dari akun?
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

        {/* ===== MAIN CARD CONTAINER ===== */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-blue-50 flex flex-col h-[80vh]">
          {/* HEADER */}
          <div className="p-6 pb-4">
            {/* Statistik Cards */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-100">
                <p className="text-xs text-slate-500 font-medium mb-1">Total Siswa</p>
                <p className="text-2xl font-bold text-slate-800">{totalSiswa}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                <p className="text-xs text-slate-500 font-medium mb-1">Sudah Tes</p>
                <p className="text-2xl font-bold text-green-700">{sudahTes}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
                <p className="text-xs text-slate-500 font-medium mb-1">Belum Tes</p>
                <p className="text-2xl font-bold text-orange-600">{belumTes}</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari nama atau kelas siswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-5 py-3 bg-blue-50/50 border border-blue-100 rounded-2xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white focus:border-blue-200 transition-all duration-300"
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="flex-1 overflow-auto px-6 pb-4">
            <div className="bg-white rounded-2xl border border-blue-50 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                    <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Nama Siswa
                    </th>
                    <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Kelas
                    </th>
                    <th className="text-center py-3.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide hidden md:table-cell">
                      Tanggal Tes
                    </th>
                    <th className="text-center py-3.5 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`border-b border-slate-50 hover:bg-blue-50/30 transition-colors
                          ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {item.nama.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-700">
                              {item.nama}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                            {item.kelas}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium
                              ${
                                item.status === 'Sudah Tes'
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-orange-50 text-orange-700'
                              }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full
                                ${item.status === 'Sudah Tes' ? 'bg-green-500' : 'bg-orange-500'}`}
                            ></span>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 hidden md:table-cell">
                          {item.tanggal}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => setSelected(item)}
                            disabled={!item.hasil}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 mx-auto
                              ${
                                item.hasil
                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 hover:scale-105'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            {item.hasil ? 'Lihat Hasil' : 'Belum Tes'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <svg
                            className="w-12 h-12 text-slate-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          <p className="text-sm text-slate-400 font-medium">
                            Siswa tidak ditemukan
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-6 pt-3 border-t border-slate-100">
            <p className="text-center text-xs text-slate-400">
              Menampilkan {filteredData.length} dari {totalSiswa} siswa
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;