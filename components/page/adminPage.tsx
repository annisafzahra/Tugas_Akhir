'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
// import HasilPage from './hasilPage';
import dataHasilTest from '@/lib/function/dataHasilTest';
import dataUserFunction from '@/lib/function/dataUserFunction';
import { removeToken } from '@/lib/function/token';
import { deleteHasilTes, deleteSiswa, getMe, updateSiswa } from '@/lib/function/api';
import { CreateUser } from '@/lib/function/userFunction';
import { UserType } from '@/type/dataHasilTestType';

// const me = {
//   nama: 'Isha Khalil, S.Pd.',
//   nip: '198501012010011001',
//   email: 'isha.khalil@sekolah.sch.id',
//   role: 'Guru BK',
// };

type FormMode = 'tambah' | 'edit';

type FormState = {
  id: number;
  nama_lengkap: string;
  kelas: string;
  username: string;
  email: string;
  kelamin: string;
  nip: string;
  usia: number | '';
  is_staff: boolean;
  password: string;
  confirmPassword: string;
};

const initialForm: FormState = {
  id: 0,
  nama_lengkap: '',
  kelas: '',
  username: '',
  email: '',
  nip: '',
  kelamin: 'pria',
  usia: '',
  is_staff: false,
  password: '',
  confirmPassword: '',
};

const getInitial = (name?: string) => {
  if (!name) return '?';
  return name.trim().charAt(0).toUpperCase();
};

const formatTanggal = (date?: string) => {
  if (!date) return '-';
  return date.split('T')[0];
};

const AdminPage = ({ onLogout }: { onLogout: () => void }) => {
  const router = useRouter();
  const { hasilTest } = dataHasilTest();
  const { dataUser } = dataUserFunction();

  const [selected, setSelected] = useState<UserType | null>(null);
  const [siswaList, setSiswaList] = useState<UserType[]>([]);
  const [siswaList2, setSiswaList2] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formMode, setFormMode] = useState<FormMode>('tambah');
  const [formData, setFormData] = useState<FormState>(initialForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<UserType | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pickHapus, setPickHapus] = useState(0);

  const [updateTarget, setUpdateTarget] = useState(0);
  const [me, setMe] = useState<UserType>({
      id: 0,
      username: '',
      nama_lengkap: '',
      kelas: '',
      usia: 0,
      kelamin: '',
      email: '',
      is_staff: true,
    });

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
    setSiswaList(dataUser || []);
  }, [dataUser]);

  const getHasilSiswa = (siswa: UserType) => {
    return hasilTest.find(
      (item) =>
        item.user?.nama_lengkap?.toLowerCase() === siswa.nama_lengkap?.toLowerCase()
    );
  };

  const getHasilListSiswa = (siswa: UserType) => {
    return hasilTest.filter((item) => {
      const sameId = item.user?.id && siswa.id && item.user.id === siswa.id;
  
      const sameName =
        item.user?.nama_lengkap?.toLowerCase() ===
        siswa.nama_lengkap?.toLowerCase();
  
      return sameId || sameName;
    });
  };

  const filteredData = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();
    if (!keyword) return siswaList;

    return siswaList.filter((item) => {
      return (
        item.nama_lengkap?.toLowerCase().includes(keyword) ||
        item.kelas?.toLowerCase().includes(keyword) ||
        item.username?.toLowerCase().includes(keyword) ||
        item.email?.toLowerCase().includes(keyword)
      );
    });
  }, [searchTerm, siswaList]);

  const totalSiswa = siswaList.length;
  const sudahTes = siswaList.filter((siswa) => {
    const hasil = getHasilSiswa(siswa);
    return Number(hasil?.mtk ?? 0) > 0;
  }).length;
  const belumTes = totalSiswa - sudahTes;

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleOpenTambah = () => {
    setFormMode('tambah');
    resetForm();
    setShowFormModal(true);
  };

  const handleOpenEdit = (siswa: UserType) => {
    setFormMode('edit');
    setUpdateTarget(siswa.id || 0);
    setFormData({
      id: siswa.id,
      nama_lengkap: siswa.nama_lengkap || '',
      kelas: siswa.kelas || '',
      username: siswa.username || '',
      email: siswa.email || '',
      kelamin: siswa.kelamin || 'pria',
      nip: siswa.nip || '',
      usia: siswa.usia || '',
      is_staff: siswa.is_staff || false,
      password: '',
      confirmPassword: '',
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  const handleOpenDelete = (siswa: UserType) => {
    setDeleteTarget(siswa);
    setShowDeleteModal(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const usiaNumber = Number(formData.usia);

    if (!formData.nama_lengkap.trim()) errors.nama_lengkap = 'Nama lengkap wajib diisi.';
    if (!formData.kelas.trim()) errors.kelas = 'Kelas wajib diisi.';
    if (!formData.username.trim()) errors.username = 'Username wajib diisi.';
    if (formData.username.trim().length < 4) errors.username = 'Username minimal 4 karakter.';
    if (!formData.email.trim()) errors.email = 'Email wajib diisi.';
    if (formData.email && !formData.email.includes('@')) errors.email = 'Format email tidak valid.';
    if (!formData.usia) errors.usia = 'Usia wajib diisi.';
    if (formData.usia && (usiaNumber < 10 || usiaNumber > 18)) errors.usia = 'Usia harus 10-18 tahun.';

    if (formMode === 'tambah') {
      if (!formData.password.trim()) errors.password = 'Password wajib diisi.';
      if (formData.password.length > 0 && formData.password.length < 6) {
        errors.password = 'Password minimal 6 karakter.';
      }
      if (!formData.confirmPassword.trim()) errors.confirmPassword = 'Konfirmasi password wajib diisi.';
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Konfirmasi password tidak sama.';
      }
    }

    const usernameExist = siswaList.some(
      (siswa) =>
        siswa.username?.toLowerCase() === formData.username.toLowerCase() &&
        siswa.id !== formData.id
    );

    if (usernameExist) errors.username = 'Username sudah digunakan.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (formMode === 'tambah') {
        const res = await CreateUser({
          nama_lengkap: formData.nama_lengkap,
          kelas: formData.kelas,
          usia: Number(formData.usia),
          kelamin: formData.kelamin,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });

        if (!res) {
          alert('Gagal menambahkan siswa. Silakan coba lagi.');
          return;
        }

        alert('Data siswa berhasil ditambahkan.');
        router.refresh();
      } else {
        // Catatan: bagian edit ini masih update lokal karena kode awal belum memiliki API update siswa.
        setSiswaList((prev) =>
          prev.map((siswa) =>
            siswa.id === formData.id
              ? {
                  ...siswa,
                  nama_lengkap: formData.nama_lengkap,
                  kelas: formData.kelas,
                  usia: Number(formData.usia),
                  kelamin: formData.kelamin,
                  username: formData.username,
                  email: formData.email,
                  is_staff: formData.is_staff,
                }
              : siswa
          )
        );
        alert('Data siswa berhasil diperbarui.');
      }

      setShowFormModal(false);
      resetForm();
    } catch (error) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!updateTarget) return;
  
    setIsLoading(true);
  
    try {
      const payload = {
        username: formData.username,
        nama_lengkap: formData.nama_lengkap,
        kelas: formData.kelas,
        nip: formData.nip || null,
        usia: formData.usia ? Number(formData.usia) : null,
        kelamin: formData.kelamin,
        email: formData.email,
      };
  
      const res = await updateSiswa(updateTarget, payload);
  
      if (res.status === 200) {
        const updatedUser = res.data.data;
  
        if (formData.is_staff === true) {
          setMe(updatedUser);
        } else {
          setSiswaList((prev) =>
            prev.map((siswa) =>
              siswa.id === updateTarget ? updatedUser : siswa
            )
          );
        }
  
        setShowFormModal(false);
        setUpdateTarget(0);
        alert('Data berhasil diperbarui.');
      } else {
        alert('Gagal mengupdate data. Silakan coba lagi.');
      }
  
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Gagal mengupdate data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsLoading(true);

    try {
      await deleteSiswa(deleteTarget.id);
      setSiswaList((prev) => prev.filter((siswa) => siswa.id !== deleteTarget.id));
      setShowDeleteModal(false);
      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      alert('Gagal menghapus siswa.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeteletHasilTes = async (hasilId: number) => {
    setIsLoading(true);
    try{
      const res = await deleteHasilTes(hasilId);
      if(res){
        alert('Hasil tes berhasil dihapus');
        router.refresh();
      }
    }finally{
      setConfirmDelete(false);
      setSelected(null);
      setIsLoading(false);
    }
  }

  const handleLogout = () => {
    removeToken();
    onLogout();
  };

  const selectedHasilList = selected ? getHasilListSiswa(selected) : [];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-sky-50 via-white to-indigo-100 px-4 py-5 md:px-8 md:py-8">
      <div className="pointer-events-none absolute -top-24 -left-20 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-16 -right-24 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />

      <main className="relative mx-auto w-full max-w-6xl">
        <header className="relative z-50 mb-6 flex flex-col gap-4 rounded-[2rem] border-[.5px] border-cyan-500 bg-white/80 p-5 shadow-xl shadow-slate-200/50 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0118 16.5c0 2.485-2.686 4.5-6 4.5s-6-2.015-6-4.5c0-2.485 2.686-4.5 6-4.5z" />
              </svg>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-500">Admin Panel</p>
              <h1 className="text-lg font-bold text-slate-900 md:text-xl">Dashboard Guru BK</h1>
              <p className="text-sm text-slate-500">Kelola data siswa dan pantau hasil rekomendasi tes.</p>
            </div>
          </div>

          <div className="relative flex items-center justify-between gap-3 md:justify-end">
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-slate-800">{me.nama_lengkap}</p>
              <p className="text-xs text-slate-500">Guru BK</p>
            </div>

            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              {getInitial(me.nama_lengkap)}
            </button>

            {showDropdown && (
              <>
                <div className="fixed z-80 inset-0" onClick={() => setShowDropdown(false)} />
                <div className="fixed right-0 top-[100px] z-90 w-64 overflow-hidden rounded-3xl border-[.5px] border-blue-500 bg-white shadow-2xl shadow-slate-200">
                  <div className="border-b border-slate-100 p-4">
                    <p className="text-sm font-bold text-slate-800">{me.nama_lengkap}</p>
                    <p className="text-xs text-slate-500">{me.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setShowProfile(true);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-blue-50"
                  >
                    <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Lihat Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setShowLogout(true);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </>
            )}

            
          </div>
        </header>

        <section className="mb-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-[2rem] border-[.5px] border-cyan-500 bg-white/85 px-10 py-6 shadow-xl shadow-slate-200/50 backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Siswa</p>
                <h3 className="mt-1 text-3xl font-bold text-slate-900">{totalSiswa}</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m0-4a4 4 0 108 0 4 4 0 00-8 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-400">Seluruh siswa terdaftar</p>
          </div>

          <div className="rounded-[2rem] border-[.5px] border-cyan-500 bg-white/85 px-10 py-6 shadow-xl shadow-slate-200/50 backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">Sudah Tes</p>
                <h3 className="mt-1 text-3xl font-bold text-slate-900">{sudahTes}</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-400">Siswa sudah memiliki hasil</p>
          </div>

          <div className="rounded-[2rem] border-[.5px] border-cyan-500 bg-white/85 px-10 py-6 shadow-xl shadow-slate-200/50 backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">Belum Tes</p>
                <h3 className="mt-1 text-3xl font-bold text-slate-900">{belumTes}</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-400">Siswa belum mengerjakan tes</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border-[.5px] border-cyan-500 bg-white/90 shadow-2xl shadow-slate-200/60 backdrop-blur">
          <div className="border-b border-slate-100 p-8">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Data Siswa</h2>
                <p className="text-sm text-slate-500">Cari, tambah, edit, hapus, dan lihat hasil rekomendasi siswa.</p>
              </div>

              <button
                onClick={handleOpenTambah}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Siswa
              </button>
            </div>

            <div className="relative">
              <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari berdasarkan nama, kelas, username, atau email..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="overflow-x-auto px-8">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Nama Siswa</th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Kelas</th>
                  <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">Status Tes</th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Tanggal Tes</th>
                  <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => {
                    const hasil = getHasilSiswa(item);
                    const isSudahTes = Number(hasil?.mtk ?? 0) > 0;

                    return (
                      <tr key={item.id} className="border-b border-slate-100 transition hover:bg-blue-50/50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 text-sm font-bold text-white shadow-md shadow-blue-100">
                              {getInitial(item.nama_lengkap)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{item.nama_lengkap}</p>
                              <p className="text-xs text-slate-400">{item.email || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-xl bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            {item.kelas || '-'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-2 rounded-xl px-3 py-1 text-xs font-semibold ${
                              isSudahTes ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            <span className={`h-2 w-2 rounded-full ${isSudahTes ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {isSudahTes ? 'Sudah Tes' : 'Belum Tes'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-500">{formatTanggal(hasil?.created_at)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelected(item)}
                              disabled={!isSudahTes}
                              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                                isSudahTes
                                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                  : 'cursor-not-allowed bg-slate-100 text-slate-400'
                              }`}
                            >
                              Lihat
                            </button>
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleOpenDelete(item)}
                              className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">Siswa tidak ditemukan</p>
                          <p className="text-sm text-slate-400">Coba gunakan kata kunci lain.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-100 px-10 py-4 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
            <p>Menampilkan {filteredData.length} dari {totalSiswa} siswa.</p>
            <p>Data diperbarui berdasarkan daftar siswa terbaru.</p>
          </div>
        </section>
      </main>

      
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />

          <div className="relative right-0 z-[101] flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-slate-900/20">
            {/* HEADER POPUP */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-10 py-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-500">
                  Detail Hasil Tes
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Riwayat Rekomendasi Jurusan
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Menampilkan daftar hasil tes yang pernah dikerjakan oleh siswa.
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* BODY POPUP */}
            <div className="grid flex-1 overflow-hidden lg:grid-cols-[1fr_330px] p-5">
              {/* KIRI: DAFTAR HASIL TES */}
              <div className="max-h-[75vh] overflow-y-auto bg-slate-50/60 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      Daftar Hasil Tes
                    </h3>
                    <p className="text-sm text-slate-500">
                      Total {selectedHasilList.length} hasil tes ditemukan.
                    </p>
                  </div>
                </div>

                {selectedHasilList.length > 0 ? (
                  <div className="space-y-4">
                    {selectedHasilList.map((hasil: any, index: number) => (
                      <div
                        key={hasil.id || index}
                        className="rounded-[1.7rem] border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          {/* NOMOR + REKOMENDASI GABUNGAN */}
                          <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-extrabold text-white shadow-lg shadow-blue-100">
                              {index + 1}
                            </div>

                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                Rekomendasi Gabungan
                              </p>
                              <h4 className="mt-1 text-xl font-extrabold text-slate-900">
                                {hasil.rekomendasi_gabungan || '-'}
                              </h4>
                              <p className="mt-1 text-xs text-slate-400">
                                Tanggal tes: {formatTanggal(hasil.created_at)}
                              </p>
                            </div>
                          </div>

                          {/* KANAN CARD: JURUSAN SATUAN */}
                          <div className="grid min-w-full grid-cols-1 gap-2 md:min-w-[360px] md:grid-cols-3">
                            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3">
                              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-500">
                                Akademik
                              </p>
                              <p className="mt-1 text-sm font-bold text-blue-800">
                                {hasil.rekomendasi_akademik || '-'}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-purple-100 bg-purple-50 p-3">
                              <p className="text-[10px] font-bold uppercase tracking-wide text-purple-500">
                                RIASEC
                              </p>
                              <p className="mt-1 text-sm font-bold text-purple-800">
                                {hasil.rekomendasi_riasec || '-'}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
                              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-500">
                                Bakat
                              </p>
                              <p className="mt-1 text-sm font-bold text-emerald-800">
                                {hasil.rekomendasi_bakat || '-'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* NILAI RINGKAS */}
                        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 text-xs md:grid-cols-5">
                          <div className="rounded-xl bg-slate-50 p-2">
                            <p className="text-slate-400">MTK</p>
                            <p className="font-bold text-slate-700">{hasil.mtk ?? '-'}</p>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-2">
                            <p className="text-slate-400">INDO</p>
                            <p className="font-bold text-slate-700">{hasil.indo ?? '-'}</p>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-2">
                            <p className="text-slate-400">IPA</p>
                            <p className="font-bold text-slate-700">{hasil.ipa ?? '-'}</p>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-2">
                            <p className="text-slate-400">IPS</p>
                            <p className="font-bold text-slate-700">{hasil.ips ?? '-'}</p>
                          </div>
                          <button onClick={()=>{setConfirmDelete(true); setPickHapus(hasil.id)}} className="flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-[#ff1265] text-sm font-extrabold text-white shadow-lg shadow-blue-100 hover:from-[#de004e] hover:to-[#de004e] hover:cursor-pointer transition">
                              Hapus
                            </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-white p-8 text-center">
                    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 012-2z" />
                      </svg>
                    </div>
                    <p className="font-bold text-slate-700">Belum ada hasil tes</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Siswa ini belum memiliki riwayat hasil rekomendasi.
                    </p>
                  </div>
                )}
              </div>

              {/* KANAN: BIODATA SISWA */}
              <div className="border-t border-slate-100 bg-white p-6 lg:border-l lg:border-t-0">
                <div className="sticky top-6">
                  <div className="mb-5 text-center">
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl font-extrabold text-white shadow-xl shadow-blue-100">
                      {getInitial(selected.nama_lengkap)}
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900">
                      {selected.nama_lengkap || '-'}
                    </h3>
                    <p className="text-sm font-medium text-blue-600">
                      Siswa Kelas {selected.kelas || '-'}
                    </p>
                  </div>

                  <div className="space-y-3 rounded-[1.7rem] bg-slate-50 p-4">
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Username
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-700">
                        @{selected.username || '-'}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Email
                      </p>
                      <p className="mt-1 break-all text-sm font-bold text-slate-700">
                        {selected.email || '-'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Usia
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-700">
                          {selected.usia || '-'}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Jenis Kelamin
                        </p>
                        <p className="mt-1 text-sm font-bold capitalize text-slate-700">
                          {selected.kelamin || '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-emerald-50 p-4 text-center">
                      <p className="text-2xl font-extrabold text-emerald-600">
                        {selectedHasilList.length}
                      </p>
                      <p className="text-xs font-semibold text-emerald-700">
                        Total Tes
                      </p>
                    </div>

                    <div className="rounded-2xl bg-blue-50 p-4 text-center">
                      <p className="text-md font-extrabold text-blue-600">
                        {formatTanggal(selectedHasilList[0]?.created_at)}
                      </p>
                      <p className="text-xs font-semibold text-blue-700">
                        Tes Terakhir
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelected(null)}
                    className="mt-5 w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    Tutup Detail
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowProfile(false)} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl shadow-slate-900/20">
            <div className="text-center">
              <button
                onClick={() => setShowProfile(false)}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold text-white shadow-lg shadow-blue-200">
                {getInitial(me.nama_lengkap)}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{me.nama_lengkap}</h2>
              <p className="mb-5 text-sm font-medium text-blue-600">Guru BK</p>

              <div className="space-y-3 rounded-3xl bg-slate-50 p-4 text-left">
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-xs text-slate-400">NIP</p>
                  <p className="text-sm font-semibold text-slate-700">{me.nip}</p>
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-sm font-semibold text-slate-700">{me.email}</p>
                </div>
              </div>

              <button
                onClick={() => handleOpenEdit(me)}
                className="mt-5 w-full rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setShowProfile(false)}
                className="mt-2 w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5"
              >
                Tutup
              </button>
              {/* <button
                onClick={() => setShowProfile(false)}
                className="mt-2 w-full rounded-2xl bg-gradient-to-r from-red-500 to-[#ff086b] py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5"
              >
                LogOut
              </button>
              <button
              onClick={() => {
                setShowDropdown(false);
                setShowLogout(true);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button> */}
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setConfirmDelete(false)} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl shadow-slate-900/20">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-500">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Konfirmasi Hapus</h2>
              <p className="mt-2 text-sm text-slate-500">Apakah kamu yakin ingin hapus hasil tes ini?</p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  onClick={()=>{handleDeteletHasilTes(pickHapus)}}
                  className="flex-1 rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-100 transition hover:bg-red-600"
                >
                  {isLoading?"Hapus...":"Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowLogout(false)} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl shadow-slate-900/20">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-500">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Konfirmasi Logout</h2>
              <p className="mt-2 text-sm text-slate-500">Apakah kamu yakin ingin keluar dari akun?</p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowLogout(false)}
                  className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-100 transition hover:bg-red-600"
                >
                  Ya, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowFormModal(false)} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-10 shadow-2xl shadow-slate-900/20">
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-500">
                {formMode === 'tambah' ? 'Tambah Data' : 'Edit Data'}
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {formMode === 'tambah' ? 'Tambah Siswa Baru' : (formData.is_staff === true ? 'Edit Data Admin' : 'Edit Data Siswa')}
              </h2>
              <p className="text-sm text-slate-500">
                {formMode === 'tambah'
                  ? 'Lengkapi data akun dan identitas siswa.'
                  : (formData.is_staff === true ? 'Perbarui data admin yang ingin di ganti.' : 'Perbarui data siswa yang dipilih.')}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.nama_lengkap}
                  onChange={(e) => handleChange('nama_lengkap', e.target.value)}
                  placeholder="Nama lengkap siswa"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                    formErrors.nama_lengkap
                      ? 'border-red-200 bg-red-50 focus:ring-red-100'
                      : 'border-slate-200 bg-slate-50 focus:border-blue-200 focus:bg-white focus:ring-blue-100'
                  }`}
                />
                {formErrors.nama_lengkap && <p className="mt-1 text-xs font-medium text-red-500">{formErrors.nama_lengkap}</p>}
              </div>

              {formData.is_staff === true ? (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">NIP</label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => handleChange('nip', e.target.value)}
                    placeholder="Contoh: 198501012010011001"
                    className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                      formErrors.nip
                        ? 'border-red-200 bg-red-50 focus:ring-red-100'
                        : 'border-slate-200 bg-slate-50 focus:border-blue-200 focus:bg-white focus:ring-blue-100'
                    }`}
                  />
                  {formErrors.kelas && <p className="mt-1 text-xs font-medium text-red-500">{formErrors.nip}</p>}
                </div>
              ):(
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Kelas</label>
                  <input
                    type="text"
                    value={formData.kelas}
                    onChange={(e) => handleChange('kelas', e.target.value)}
                    placeholder="Contoh: 9-A"
                    className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                      formErrors.kelas
                        ? 'border-red-200 bg-red-50 focus:ring-red-100'
                        : 'border-slate-200 bg-slate-50 focus:border-blue-200 focus:bg-white focus:ring-blue-100'
                    }`}
                  />
                  {formErrors.kelas && <p className="mt-1 text-xs font-medium text-red-500">{formErrors.kelas}</p>}
                </div>
              )}
              

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Usia</label>
                <input
                  type="number"
                  value={formData.usia}
                  onChange={(e) => handleChange('usia', e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Contoh: 14"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                    formErrors.usia
                      ? 'border-red-200 bg-red-50 focus:ring-red-100'
                      : 'border-slate-200 bg-slate-50 focus:border-blue-200 focus:bg-white focus:ring-blue-100'
                  }`}
                />
                {formErrors.usia && <p className="mt-1 text-xs font-medium text-red-500">{formErrors.usia}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Jenis Kelamin</label>
                <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
                  <button
                    type="button"
                    onClick={() => handleChange('kelamin', 'pria')}
                    className={`rounded-xl py-2.5 text-sm font-semibold transition ${
                      formData.kelamin === 'pria'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Laki-laki
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('kelamin', 'wanita')}
                    className={`rounded-xl py-2.5 text-sm font-semibold transition ${
                      formData.kelamin === 'wanita'
                        ? 'bg-white text-pink-500 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Perempuan
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder="Username untuk login"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                    formErrors.username
                      ? 'border-red-200 bg-red-50 focus:ring-red-100'
                      : 'border-slate-200 bg-slate-50 focus:border-blue-200 focus:bg-white focus:ring-blue-100'
                  }`}
                />
                {formErrors.username && <p className="mt-1 text-xs font-medium text-red-500">{formErrors.username}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@sekolah.sch.id"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                    formErrors.email
                      ? 'border-red-200 bg-red-50 focus:ring-red-100'
                      : 'border-slate-200 bg-slate-50 focus:border-blue-200 focus:bg-white focus:ring-blue-100'
                  }`}
                />
                {formErrors.email && <p className="mt-1 text-xs font-medium text-red-500">{formErrors.email}</p>}
              </div>

              {formMode === 'tambah' && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        placeholder="••••••••"
                        className={`w-full rounded-2xl border py-3 pl-4 pr-16 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                          formErrors.password
                            ? 'border-red-200 bg-red-50 focus:ring-red-100'
                            : 'border-slate-200 bg-slate-50 focus:border-blue-200 focus:bg-white focus:ring-blue-100'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                      >
                        {showPassword ? 'Sembunyi' : 'Lihat'}
                      </button>
                    </div>
                    {formErrors.password && <p className="mt-1 text-xs font-medium text-red-500">{formErrors.password}</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Konfirmasi Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        placeholder="••••••••"
                        className={`w-full rounded-2xl border py-3 pl-4 pr-16 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                          formErrors.confirmPassword
                            ? 'border-red-200 bg-red-50 focus:ring-red-100'
                            : 'border-slate-200 bg-slate-50 focus:border-blue-200 focus:bg-white focus:ring-blue-100'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                      >
                        {showConfirmPassword ? 'Sembunyi' : 'Lihat'}
                      </button>
                    </div>
                    {formErrors.confirmPassword && <p className="mt-1 text-xs font-medium text-red-500">{formErrors.confirmPassword}</p>}
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 md:flex-row">
              <button
                onClick={() => setShowFormModal(false)}
                disabled={isLoading}
                className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Batal
              </button>
              <button
                onClick={formMode === 'tambah' ? handleCreate : handleUpdate}
                disabled={isLoading}
                className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Menyimpan...' : formMode === 'tambah' ? 'Tambah Siswa' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl shadow-slate-900/20">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-500">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Hapus Siswa</h2>
              <p className="mt-2 text-sm text-slate-500">
                Apakah kamu yakin ingin menghapus{' '}
                <span className="font-semibold text-slate-800">{deleteTarget.nama_lengkap}</span>?
              </p>
              <p className="mt-1 text-xs text-red-500">Data yang sudah dihapus tidak bisa dikembalikan.</p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isLoading}
                  className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex-1 rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-100 transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default AdminPage;