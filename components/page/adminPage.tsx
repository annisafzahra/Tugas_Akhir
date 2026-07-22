'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dataHasilTest from '@/lib/function/dataHasilTest';
import dataUserFunction from '@/lib/function/dataUserFunction';
import { removeToken } from '@/lib/function/token';
import { deleteHasilTes, deleteSiswa, getMe, updateSiswa } from '@/lib/function/api';
import { CreateUser } from '@/lib/function/userFunction';
import { UserType } from '@/type/dataHasilTestType';

type FormMode = 'tambah' | 'edit';
type StatusType = 'success' | 'error';

type StatusPopupState = {
  show: boolean;
  type: StatusType;
  title: string;
  message: string;
};

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

const initialStatusPopup: StatusPopupState = {
  show: false,
  type: 'success',
  title: '',
  message: '',
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

  const [hasilList, setHasilList] = useState<any[]>([]);
  const [selected, setSelected] = useState<UserType | null>(null);
  const [siswaList, setSiswaList] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [statusPopup, setStatusPopup] =
    useState<StatusPopupState>(initialStatusPopup);

  const [formMode, setFormMode] = useState<FormMode>('tambah');
  const [formData, setFormData] = useState<FormState>(initialForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<UserType | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pickHapus, setPickHapus] = useState(0);

  const [isDetailTes, setIsDetailTes] = useState(0);

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

  useEffect(() => {
    const fetch = async () => {
      const id = localStorage.getItem('user_id_jurusan');
      if (!id) return;

      const res = await getMe(Number(id));
      if (res.status === 200) {
        setMe(res.data);
        console.log(`Selamat datang, ${res.data.nama_lengkap?.split(' ')[0]}!`);
      }
    };

    fetch();
  }, []);

  useEffect(() => {
    setHasilList(hasilTest || []);
  }, [hasilTest]);

  useEffect(() => {
    setSiswaList(dataUser || []);
  }, [dataUser]);

  const getHasilSiswa = (siswa: UserType) => {
    return hasilList.find(
      (item) =>
        item.user?.id === siswa.id ||
        item.user?.nama_lengkap?.toLowerCase() === siswa.nama_lengkap?.toLowerCase()
    );
  };

  const getHasilListSiswa = (siswa: UserType) => {
    return hasilList.filter((item) => {
      const sameId = item.user?.id && siswa.id && item.user.id === siswa.id;
      const sameName =
        item.user?.nama_lengkap?.toLowerCase() === siswa.nama_lengkap?.toLowerCase();
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

  const selectedHasilList = selected ? getHasilListSiswa(selected) : [];

  const showStatusPopup = (
    type: StatusType,
    title: string,
    message: string
  ) => {
    setStatusPopup({
      show: true,
      type,
      title,
      message,
    });
  };

  const closeStatusPopup = () => {
    setStatusPopup(initialStatusPopup);
  };

  const getErrorMessage = (error: unknown, fallback: string) => {
    const apiError = error as {
      response?: {
        data?: {
          message?: string;
          detail?: string;
          non_field_errors?: string[];
          username?: string[] | string;
          email?: string[] | string;
        } | string;
      };
      message?: string;
    };

    const responseData = apiError?.response?.data;

    if (typeof responseData === 'string') {
      return responseData;
    }

    if (responseData?.message) {
      return responseData.message;
    }

    if (responseData?.detail) {
      return responseData.detail;
    }

    if (responseData?.non_field_errors?.[0]) {
      return responseData.non_field_errors[0];
    }

    if (Array.isArray(responseData?.username) && responseData.username[0]) {
      return responseData.username[0];
    }

    if (typeof responseData?.username === 'string') {
      return responseData.username;
    }

    if (Array.isArray(responseData?.email) && responseData.email[0]) {
      return responseData.email[0];
    }

    if (typeof responseData?.email === 'string') {
      return responseData.email;
    }

    return apiError?.message || fallback;
  };

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
    if (!formData.is_staff && !formData.kelas.trim()) errors.kelas = 'Kelas wajib diisi.';
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
      (s) => s.username?.toLowerCase() === formData.username.toLowerCase() && s.id !== formData.id
    );
    if (usernameExist) errors.username = 'Username sudah digunakan.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await CreateUser({
        nama_lengkap: formData.nama_lengkap,
        kelas: formData.kelas,
        usia: Number(formData.usia),
        kelamin: formData.kelamin,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (!res || res.success === false) {
        showStatusPopup(
          'error',
          'Tambah Siswa Gagal',
          res?.message || 'Data siswa gagal ditambahkan.'
        );
        return;
      }

      setShowFormModal(false);
      resetForm();

      showStatusPopup(
        'success',
        'Tambah Siswa Berhasil',
        'Data siswa baru berhasil ditambahkan.'
      );

      router.refresh();
    } catch (error) {
      console.error('Tambah siswa gagal:', error);

      showStatusPopup(
        'error',
        'Tambah Siswa Gagal',
        getErrorMessage(
          error,
          'Terjadi kesalahan saat menambahkan siswa. Silakan coba lagi.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!updateTarget) return;
    if (!validateForm()) return;

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

      if (res.status !== 200) {
        showStatusPopup(
          'error',
          formData.is_staff ? 'Edit Admin Gagal' : 'Edit Siswa Gagal',
          res.data?.message || 'Data gagal diperbarui.'
        );
        return;
      }

      const updatedUser = res.data?.data || res.data;

      if (formData.is_staff) {
        setMe(updatedUser);
      } else {
        setSiswaList((prev) =>
          prev.map((siswa) =>
            siswa.id === updateTarget ? updatedUser : siswa
          )
        );
      }

      const updatedIsStaff = formData.is_staff;

      setShowFormModal(false);
      setUpdateTarget(0);
      resetForm();

      showStatusPopup(
        'success',
        updatedIsStaff ? 'Edit Admin Berhasil' : 'Edit Siswa Berhasil',
        updatedIsStaff
          ? 'Data profil admin berhasil diperbarui.'
          : 'Data siswa berhasil diperbarui.'
      );

      router.refresh();
    } catch (error) {
      console.error('Edit data gagal:', error);

      showStatusPopup(
        'error',
        formData.is_staff ? 'Edit Admin Gagal' : 'Edit Siswa Gagal',
        getErrorMessage(
          error,
          formData.is_staff
            ? 'Terjadi kesalahan saat memperbarui data admin.'
            : 'Terjadi kesalahan saat memperbarui data siswa.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsLoading(true);

    try {
      const deletedStudentName =
        deleteTarget.nama_lengkap || 'Siswa tersebut';

      await deleteSiswa(deleteTarget.id);

      setSiswaList((prev) =>
        prev.filter((siswa) => siswa.id !== deleteTarget.id)
      );

      setShowDeleteModal(false);
      setDeleteTarget(null);

      showStatusPopup(
        'success',
        'Hapus Siswa Berhasil',
        `Data ${deletedStudentName} berhasil dihapus.`
      );

      router.refresh();
    } catch (error) {
      console.error('Hapus siswa gagal:', error);

      setShowDeleteModal(false);

      showStatusPopup(
        'error',
        'Hapus Siswa Gagal',
        getErrorMessage(
          error,
          'Terjadi kesalahan saat menghapus siswa. Silakan coba lagi.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHasilTes = async (hasilId: number) => {
    if (!hasilId) return;

    setIsLoading(true);

    try {
      const res = await deleteHasilTes(hasilId);

      if (res.status !== 200 && res.status !== 204) {
        setConfirmDelete(false);

        showStatusPopup(
          'error',
          'Hapus Riwayat Tes Gagal',
          res.data?.message || 'Riwayat hasil tes gagal dihapus.'
        );
        return;
      }

      setHasilList((prev) =>
        prev.filter((hasil) => hasil.id !== hasilId)
      );

      setConfirmDelete(false);
      setPickHapus(0);

      showStatusPopup(
        'success',
        'Hapus Riwayat Tes Berhasil',
        'Riwayat hasil tes berhasil dihapus.'
      );
    } catch (error) {
      console.error('Hapus riwayat tes gagal:', error);

      setConfirmDelete(false);

      showStatusPopup(
        'error',
        'Hapus Riwayat Tes Gagal',
        getErrorMessage(
          error,
          'Terjadi kesalahan saat menghapus riwayat hasil tes.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    onLogout();
  };

  const inputClass = (error?: string) =>
    `w-full rounded-xl border px-3 py-2.5 text-xs text-slate-700 outline-none transition focus:ring-4 md:rounded-2xl md:px-4 md:py-3 md:text-sm ${
      error
        ? 'border-red-200 bg-red-50 focus:ring-red-100'
        : 'border-slate-200 bg-slate-50 focus:border-blue-200 focus:bg-white focus:ring-blue-100'
    }`;

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden overflow-y-auto bg-gradient-to-br from-sky-50 via-white to-indigo-100 px-3 py-3 sm:px-4 md:px-8 md:py-8">
      <div className="pointer-events-none absolute -top-24 -left-20 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl md:h-80 md:w-80" />
      <div className="pointer-events-none absolute top-16 -right-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl md:h-96 md:w-96" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl md:h-96 md:w-96" />

      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-3 md:gap-4">
        <header className="relative z-50 flex flex-col gap-3 rounded-3xl border-[.5px] border-cyan-500 bg-white/85 p-3 shadow-lg shadow-slate-200/50 backdrop-blur md:flex-row md:items-center md:justify-between md:rounded-[2rem] md:p-5 md:shadow-xl">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 md:h-12 md:w-12 md:rounded-2xl">
              <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0118 16.5c0 2.485-2.686 4.5-6 4.5s-6-2.015-6-4.5c0-2.485 2.686-4.5 6-4.5z" />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-500 md:text-xs md:tracking-[0.25em]">
                Admin Panel
              </p>
              <h1 className="truncate text-base font-bold text-slate-900 md:text-xl">Dashboard Admin</h1>
              <p className="line-clamp-1 text-xs text-slate-500 md:text-sm">
                Kelola data siswa dan pantau hasil rekomendasi tes
              </p>
            </div>
          </div>

          <div className="relative flex items-center justify-between gap-3 md:justify-end">
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-slate-800">{me.nama_lengkap || 'Admin'}</p>
              <p className="text-xs text-slate-500">Guru BK</p>
            </div>

            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl md:h-11 md:w-11 md:rounded-2xl md:text-sm"
            >
              {getInitial(me.nama_lengkap)}
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-[80]" onClick={() => setShowDropdown(false)} />
                <div className="absolute lg:right-0 lg:top-[52px] top-[15px] left-[50px] z-[90] w-56 overflow-hidden rounded-2xl border-[.5px] border-blue-500 bg-white shadow-2xl shadow-slate-200 md:top-[60px] md:w-64 md:rounded-3xl">
                  <div className="border-b border-slate-100 p-3 md:p-4">
                    <p className="truncate text-sm font-bold text-slate-800">{me.nama_lengkap || 'Admin'}</p>
                    <p className="truncate text-xs text-slate-500">{me.email || '-'}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setShowProfile(true);
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-blue-50 md:px-4 md:py-3 md:text-sm"
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
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-xs font-medium text-red-600 transition hover:bg-red-50 md:px-4 md:py-3 md:text-sm"
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

        <section className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="rounded-2xl border-[.5px] border-cyan-500 bg-white/85 px-3 py-3 shadow-lg shadow-slate-200/50 backdrop-blur transition md:rounded-[2rem] md:px-6 md:py-4 md:shadow-xl md:hover:-translate-y-1 md:hover:shadow-2xl">
            <div className="flex items-center justify-between gap-3 md:mb-2">
              <div>
                <p className="text-[11px] font-medium text-slate-500 md:text-sm">Total Siswa</p>
                <h3 className="mt-0.5 text-xl font-bold text-slate-900 md:mt-1 md:text-3xl">{totalSiswa}</h3>
              </div>
              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 md:flex">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m0-4a4 4 0 108 0 4 4 0 00-8 0z" />
                </svg>
              </div>
            </div>
            <p className="hidden text-xs text-slate-400 md:block">Seluruh siswa terdaftar</p>
          </div>

          <div className="rounded-2xl border-[.5px] border-cyan-500 bg-white/85 px-3 py-3 shadow-lg shadow-slate-200/50 backdrop-blur transition md:rounded-[2rem] md:px-6 md:py-4 md:shadow-xl md:hover:-translate-y-1 md:hover:shadow-2xl">
            <div className="flex items-center justify-between gap-3 md:mb-2">
              <div>
                <p className="text-[11px] font-medium text-slate-500 md:text-sm">Sudah Tes</p>
                <h3 className="mt-0.5 text-xl font-bold text-slate-900 md:mt-1 md:text-3xl">{sudahTes}</h3>
              </div>
              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 md:flex">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="hidden text-xs text-slate-400 md:block">Siswa sudah memiliki hasil</p>
          </div>

          <div className="rounded-2xl border-[.5px] border-cyan-500 bg-white/85 px-3 py-3 shadow-lg shadow-slate-200/50 backdrop-blur transition md:rounded-[2rem] md:px-6 md:py-4 md:shadow-xl md:hover:-translate-y-1 md:hover:shadow-2xl">
            <div className="flex items-center justify-between gap-3 md:mb-2">
              <div>
                <p className="text-[11px] font-medium text-slate-500 md:text-sm">Belum Tes</p>
                <h3 className="mt-0.5 text-xl font-bold text-slate-900 md:mt-1 md:text-3xl">{belumTes}</h3>
              </div>
              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 md:flex">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="hidden text-xs text-slate-400 md:block">Siswa belum mengerjakan tes</p>
          </div>
        </section>

        <section className="flex min-h-[60vh] flex-col overflow-hidden rounded-3xl border-[.5px] border-cyan-500 bg-white/90 shadow-xl shadow-slate-200/60 backdrop-blur md:rounded-[2rem] md:shadow-2xl">
          <div className="shrink-0 border-b border-slate-100 p-3 sm:p-4 md:p-6">
            <div className="mb-3 flex flex-col gap-3 md:mb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 md:text-lg">Data Siswa</h2>
                <p className="text-xs text-slate-500 md:text-sm">Cari, tambah, edit, hapus, dan lihat hasil rekomendasi siswa.</p>
              </div>

              <button
                onClick={handleOpenTambah}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl md:rounded-2xl md:px-5 md:py-3 md:text-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Siswa
              </button>
            </div>

            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 md:left-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama, kelas, username, atau email..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-100 md:rounded-2xl md:py-3 md:pl-12 md:pr-4 md:text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 md:px-6">
            <div className="space-y-3 py-3 md:hidden">
              {filteredData.length > 0 ? (
                filteredData.map((item) => {
                  const hasil = getHasilSiswa(item);
                  const isSudahTes = Number(hasil?.mtk ?? 0) > 0;

                  return (
                    <div key={item.id} className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 text-xs font-bold text-white">
                          {getInitial(item.nama_lengkap)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">{item.nama_lengkap}</p>
                          <p className="truncate text-[11px] text-slate-400">{item.email || '-'}</p>

                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <span className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
                              {item.kelas || '-'}
                            </span>
                            <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold ${isSudahTes ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${isSudahTes ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              {isSudahTes ? 'Sudah Tes' : 'Belum Tes'}
                            </span>
                            <span className="text-[10px] text-slate-400">{formatTanggal(hasil?.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setSelected(item)}
                          disabled={!isSudahTes}
                          className={`rounded-xl px-3 py-2 text-[11px] font-semibold transition ${isSudahTes ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'cursor-not-allowed bg-slate-100 text-slate-400'}`}
                        >
                          Lihat
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleOpenDelete(item)}
                          className="rounded-xl bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl bg-white p-6 text-center">
                  <p className="text-sm font-semibold text-slate-700">Siswa tidak ditemukan</p>
                  <p className="text-xs text-slate-400">Coba gunakan kata kunci lain.</p>
                </div>
              )}
            </div>

            <div className="hidden overflow-x-auto md:block">
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
                            <span className={`inline-flex items-center gap-2 rounded-xl px-3 py-1 text-xs font-semibold ${isSudahTes ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
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
                                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${isSudahTes ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'cursor-not-allowed bg-slate-100 text-slate-400'}`}
                              >
                                Lihat
                              </button>
                              <button onClick={() => handleOpenEdit(item)} className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100">
                                Edit
                              </button>
                              <button onClick={() => handleOpenDelete(item)} className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100">
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
          </div>

          <div className="flex shrink-0 flex-col gap-1 border-t border-slate-100 px-3 py-2 text-[11px] text-slate-400 md:flex-row md:items-center md:justify-between md:px-8 md:py-3 md:text-xs">
            <p>Menampilkan {filteredData.length} dari {totalSiswa} siswa.</p>
            <p>Data diperbarui berdasarkan daftar siswa terbaru.</p>
          </div>
        </section>
      </main>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative z-[101] flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/20 md:rounded-[2rem]">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-4 py-4 md:px-10 md:py-6">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500 md:text-xs md:tracking-[0.25em]">Detail Hasil Tes</p>
                <h2 className="mt-1 text-base font-bold text-slate-900 md:text-xl">Riwayat Rekomendasi Jurusan</h2>
                <p className="mt-1 text-xs text-slate-500 md:text-sm">Berikut daftar hasil tes yang pernah dikerjakan oleh siswa</p>
              </div>
              <button onClick={() => setSelected(null)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 md:h-10 md:w-10">
                <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid flex-1 overflow-y-auto lg:grid-cols-[1fr_330px] lg:overflow-hidden">
              <div className="max-h-none overflow-y-visible bg-slate-50/60 p-3 md:p-6 lg:max-h-[70vh] lg:overflow-y-auto">
                {selectedHasilList.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    {selectedHasilList.map((hasil: any, index: number) => (
                      <div key={hasil.id || index} className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm md:rounded-[1.7rem] md:p-5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
                          <div className="flex items-start gap-3 md:gap-4">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-extrabold text-white md:h-10 md:w-10 md:text-sm">
                              {index + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold uppercase text-slate-400 md:text-xs">Rekomendasi Utama</p>
                              <h4 className="mt-1 text-base font-extrabold text-slate-900 md:text-xl">{hasil.rekomendasi_gabungan || '-'}</h4>
                              <p className="mt-1 text-[11px] text-slate-400 md:text-xs">Tanggal: {formatTanggal(hasil.created_at)}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 md:min-w-[300px]">
                            <div className="rounded-xl border border-blue-100 bg-blue-50 p-2 md:rounded-2xl md:p-3">
                              <p className="text-[9px] font-bold text-blue-500 md:text-[10px]">Akademik</p>
                              <p className="mt-1 truncate text-[11px] font-bold text-blue-800 md:text-sm">{hasil.rekomendasi_akademik || '-'}</p>
                            </div>
                            <div className="rounded-xl border border-purple-100 bg-purple-50 p-2 md:rounded-2xl md:p-3">
                              <p className="text-[9px] font-bold text-purple-500 md:text-[10px]">RIASEC</p>
                              <p className="mt-1 truncate text-[11px] font-bold text-purple-800 md:text-sm">{hasil.rekomendasi_riasec || '-'}</p>
                            </div>
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-2 md:rounded-2xl md:p-3">
                              <p className="text-[9px] font-bold text-emerald-500 md:text-[10px]">Bakat</p>
                              <p className="mt-1 truncate text-[11px] font-bold text-emerald-800 md:text-sm">{hasil.rekomendasi_bakat || '-'}</p>
                            </div>
                          </div>
                        </div>
                        {isDetailTes === hasil.id && (

                          <div className="flex flex-col gap-3 h-[230px] mt-5 md:flex-row md:items-start md:justify-between items-start md:gap-4">
                            <div className='p-4 h-full flex flex-col border-[.5px] border-blue-400 bg-blue-50 rounded-lg flex-1'>
                              <p className='mb-2 font-bold text-blue-500'>Akademik</p>
                              <div className='flex flex-col gap-2'>
                                <div className='w-full flex flex-row justify-between'>
                                  <p className='text-blue-800'>MTK :</p>
                                  <p className='text-blue-800'>{hasil.mtk || '-'}</p>
                                </div>
                                <div className='flex flex-row justify-between'>
                                  <p className='text-blue-800'>Bahasa :</p>
                                  <p className='text-blue-800'>{hasil.indo || '-'}</p>
                                </div>
                                <div className='flex flex-row justify-between'>
                                  <p className='text-blue-800'>IPA :</p>
                                  <p className='text-blue-800'>{hasil.ipa || '-'}</p>
                                </div>
                                <div className='flex flex-row justify-between'>
                                  <p className='text-blue-800'>IPS :</p>
                                  <p className='text-blue-800'>{hasil.ips || '-'}</p>
                                </div>
                              </div>
                            </div>
                            <div className='p-4 h-full flex flex-col border-[.5px] border-purple-400 bg-purple-50 rounded-lg flex-1'>
                              <p className='mb-2 font-bold text-purple-500'>Minat (RIASEC)</p>
                              <div className='flex flex-col gap-2'>
                                <div className='w-full flex flex-row justify-between'>
                                  <p className='text-purple-800'>Realistic :</p>
                                  <p className='text-purple-800'>{hasil.realistic || '-'}</p>
                                </div>
                                <div className='flex flex-row justify-between'>
                                  <p className='text-purple-800'>Investigative :</p>
                                  <p className='text-purple-800'>{hasil.investigative || '-'}</p>
                                </div>
                                <div className='flex flex-row justify-between'>
                                  <p className='text-purple-800'>Artistic :</p>
                                  <p className='text-purple-800'>{hasil.artistic || '-'}</p>
                                </div>
                                <div className='flex flex-row justify-between'>
                                  <p className='text-purple-800'>Social :</p>
                                  <p className='text-purple-800'>{hasil.social || '-'}</p>
                                </div>
                                <div className='flex flex-row justify-between'>
                                  <p className='text-purple-800'>Enterprising :</p>
                                  <p className='text-purple-800'>{hasil.enterprising || '-'}</p>
                                </div>
                                <div className='flex flex-row justify-between'>
                                  <p className='text-purple-800'>Conventional :</p>
                                  <p className='text-purple-800'>{hasil.conventional || '-'}</p>
                                </div>
                              </div>
                            </div>
                            <div className='p-4 h-full flex flex-col border-[.5px] border-emerald-400 bg-emerald-50 rounded-lg flex-1'>
                              <p className='mb-2 font-bold text-emerald-500'>Bakat</p>
                              <div className='flex flex-col gap-2'>
                                <div className='w-full flex flex-row justify-between'>
                                  <p className='text-emerald-800'>Logika :</p>
                                  <p className='text-emerald-800'>{hasil.logika || '-'}</p>
                                </div>
                                <div className='flex flex-row justify-between'>
                                  <p className='text-emerald-800'>Verbal :</p>
                                  <p className='text-emerald-800'>{hasil.verbal || '-'}</p>
                                </div>
                                <div className='flex flex-row justify-between'>
                                  <p className='text-emerald-800'>Mekanikal :</p>
                                  <p className='text-emerald-800'>{hasil.mekanikal || '-'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-3 flex gap-2 justify-end border-t border-slate-100 pt-3 md:mt-4 md:pt-4">
                          <button
                            onClick={() => {
                              if(isDetailTes===hasil.id){
                                setIsDetailTes(0);
                              }else{
                                setIsDetailTes(hasil.id);
                              } 
                            }}
                            className="rounded-xl bg-gradient-to-br from-blue-500 to-[#1232ff] px-4 py-2 text-xs font-extrabold text-white shadow-lg transition hover:from-[#1025ad] hover:to-[#1025ad] md:px-6 md:text-sm"
                          >
                            {isDetailTes ? 'Tutup Detail Tes' : 'Lihat Detail Tes'}
                          </button>
                          <button
                            onClick={() => {
                              setConfirmDelete(true);
                              setPickHapus(hasil.id);
                            }}
                            className="rounded-xl bg-gradient-to-br from-red-500 to-[#ff1265] px-4 py-2 text-xs font-extrabold text-white shadow-lg transition hover:from-[#de004e] hover:to-[#de004e] md:px-6 md:text-sm"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center md:min-h-[300px] md:rounded-[2rem] md:p-8">
                    <p className="text-sm font-bold text-slate-700 md:text-base">Belum ada hasil tes</p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 bg-white p-4 md:p-6 lg:border-l lg:border-t-0">
                <div className="text-center lg:sticky lg:top-6">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-extrabold text-white shadow-xl md:mb-4 md:h-24 md:w-24 md:rounded-[2rem] md:text-3xl">
                    {getInitial(selected.nama_lengkap)}
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 md:text-lg">{selected.nama_lengkap || '-'}</h3>
                  <p className="text-xs font-medium text-blue-600 md:text-sm">Kelas {selected.kelas || '-'}</p>

                  <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-3 text-left md:mt-5 md:space-y-3 md:rounded-[1.7rem] md:p-4">
                    <div className="rounded-xl bg-white p-3 md:rounded-2xl md:p-4">
                      <p className="text-[11px] text-slate-400 md:text-xs">Username</p>
                      <p className="text-xs font-bold md:text-sm">@{selected.username || '-'}</p>
                    </div>
                    <div className="rounded-xl bg-white p-3 md:rounded-2xl md:p-4">
                      <p className="text-[11px] text-slate-400 md:text-xs">Email</p>
                      <p className="break-all text-xs font-bold md:text-sm">{selected.email || '-'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      <div className="rounded-xl bg-white p-3 md:rounded-2xl md:p-4">
                        <p className="text-[11px] text-slate-400 md:text-xs">Usia</p>
                        <p className="text-xs font-bold md:text-sm">{selected.usia || '-'}</p>
                      </div>
                      <div className="rounded-xl bg-white p-3 md:rounded-2xl md:p-4">
                        <p className="text-[11px] text-slate-400 md:text-xs">Kelamin</p>
                        <p className="text-xs font-bold capitalize md:text-sm">{selected.kelamin || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowProfile(false)} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl md:rounded-[2rem] md:p-6">
            <div className="text-center">
              <button onClick={() => setShowProfile(false)} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 md:right-4 md:top-4 md:h-9 md:w-9">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white shadow-lg md:mb-4 md:h-20 md:w-20 md:rounded-[1.7rem] md:text-2xl">
                {getInitial(me.nama_lengkap)}
              </div>
              <h2 className="text-lg font-bold text-slate-900 md:text-xl">{me.nama_lengkap || 'Admin'}</h2>
              <p className="mb-4 text-xs font-medium text-blue-600 md:mb-5 md:text-sm">Guru BK</p>

              <div className="space-y-2 rounded-2xl bg-slate-50 p-3 text-left md:space-y-3 md:rounded-3xl md:p-4">
                <div className="rounded-xl bg-white p-3 md:rounded-2xl">
                  <p className="text-[11px] text-slate-400 md:text-xs">NIP</p>
                  <p className="text-xs font-semibold md:text-sm">{me.nip || '-'}</p>
                </div>
                <div className="rounded-xl bg-white p-3 md:rounded-2xl">
                  <p className="text-[11px] text-slate-400 md:text-xs">Email</p>
                  <p className="break-all text-xs font-semibold md:text-sm">{me.email || '-'}</p>
                </div>
              </div>

              <button onClick={() => { setShowProfile(false); handleOpenEdit(me); }} className="mt-4 w-full rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:-translate-y-0.5 md:mt-5 md:rounded-2xl md:py-3 md:text-sm">
                Edit Profile
              </button>
              <button onClick={() => setShowProfile(false)} className="mt-2 w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:-translate-y-0.5 md:rounded-2xl md:py-3 md:text-sm">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-3 md:p-4">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setConfirmDelete(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-5 text-center shadow-2xl md:rounded-[2rem] md:p-6">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 md:mb-4 md:h-16 md:w-16 md:rounded-3xl">
              <svg className="h-7 w-7 md:h-8 md:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900 md:text-xl">Konfirmasi Hapus</h2>
            <p className="mt-2 text-xs text-slate-500 md:text-sm">Apakah kamu yakin ingin hapus hasil tes ini?</p>
            <div className="mt-5 flex gap-3 md:mt-6">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 md:rounded-2xl md:py-3 md:text-sm">
                Batal
              </button>
              <button onClick={() => handleDeleteHasilTes(pickHapus)} disabled={isLoading} className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:bg-red-600 disabled:opacity-60 md:rounded-2xl md:py-3 md:text-sm">
                {isLoading ? 'Hapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowLogout(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-5 text-center shadow-2xl md:rounded-[2rem] md:p-6">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 md:mb-4 md:h-16 md:w-16 md:rounded-3xl">
              <svg className="h-7 w-7 md:h-8 md:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900 md:text-xl">Konfirmasi Logout</h2>
            <p className="mt-2 text-xs text-slate-500 md:text-sm">Apakah kamu yakin ingin keluar dari akun?</p>
            <div className="mt-5 flex gap-3 md:mt-6">
              <button onClick={() => setShowLogout(false)} className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 md:rounded-2xl md:py-3 md:text-sm">
                Batal
              </button>
              <button onClick={handleLogout} className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:bg-red-600 md:rounded-2xl md:py-3 md:text-sm">
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowFormModal(false)} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl sm:p-6 md:rounded-[2rem] md:p-10">
            <button onClick={() => setShowFormModal(false)} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 md:right-4 md:top-4 md:h-9 md:w-9">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-5 pr-8 md:mb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-500 md:text-xs md:tracking-[0.25em]">
                {formMode === 'tambah' ? 'Tambah Data' : 'Edit Data'}
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900 md:text-xl">
                {formMode === 'tambah' ? 'Tambah Siswa Baru' : formData.is_staff ? 'Edit Data Admin' : 'Edit Data Siswa'}
              </h2>
              <p className="text-xs text-slate-500 md:text-sm">
                {formMode === 'tambah' ? 'Lengkapi data akun dan identitas siswa.' : formData.is_staff ? 'Perbarui data admin.' : 'Perbarui data siswa.'}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 md:gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Nama Lengkap</label>
                <input type="text" value={formData.nama_lengkap} onChange={(e) => handleChange('nama_lengkap', e.target.value)} placeholder="Nama lengkap" className={inputClass(formErrors.nama_lengkap)} />
                {formErrors.nama_lengkap && <p className="mt-1 text-[11px] text-red-500 md:text-xs">{formErrors.nama_lengkap}</p>}
              </div>

              {formData.is_staff ? (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">NIP</label>
                  <input type="text" value={formData.nip} onChange={(e) => handleChange('nip', e.target.value)} placeholder="Contoh: 198501012010011001" className={inputClass()} />
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Kelas</label>
                  <input type="text" value={formData.kelas} onChange={(e) => handleChange('kelas', e.target.value)} placeholder="Contoh: 9-A" className={inputClass(formErrors.kelas)} />
                  {formErrors.kelas && <p className="mt-1 text-[11px] text-red-500 md:text-xs">{formErrors.kelas}</p>}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Usia</label>
                <input type="number" value={formData.usia} onChange={(e) => handleChange('usia', e.target.value === '' ? '' : Number(e.target.value))} placeholder="Contoh: 14" className={inputClass(formErrors.usia)} />
                {formErrors.usia && <p className="mt-1 text-[11px] text-red-500 md:text-xs">{formErrors.usia}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Jenis Kelamin</label>
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 md:rounded-2xl">
                  <button type="button" onClick={() => handleChange('kelamin', 'pria')} className={`rounded-lg py-2 text-xs font-semibold transition md:rounded-xl md:py-2.5 md:text-sm ${formData.kelamin === 'pria' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    Laki-laki
                  </button>
                  <button type="button" onClick={() => handleChange('kelamin', 'wanita')} className={`rounded-lg py-2 text-xs font-semibold transition md:rounded-xl md:py-2.5 md:text-sm ${formData.kelamin === 'wanita' ? 'bg-white text-pink-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    Perempuan
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Username</label>
                <input type="text" value={formData.username} onChange={(e) => handleChange('username', e.target.value)} placeholder="Username" className={inputClass(formErrors.username)} />
                {formErrors.username && <p className="mt-1 text-[11px] text-red-500 md:text-xs">{formErrors.username}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Email</label>
                <input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="email@sekolah.sch.id" className={inputClass(formErrors.email)} />
                {formErrors.email && <p className="mt-1 text-[11px] text-red-500 md:text-xs">{formErrors.email}</p>}
              </div>

              {formMode === 'tambah' && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="••••••••" className={`${inputClass(formErrors.password)} pr-16`} />
                      <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 md:right-3 md:rounded-xl md:text-xs">
                        {showPassword ? 'Sembunyi' : 'Lihat'}
                      </button>
                    </div>
                    {formErrors.password && <p className="mt-1 text-[11px] text-red-500 md:text-xs">{formErrors.password}</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Konfirmasi Password</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} placeholder="••••••••" className={`${inputClass(formErrors.confirmPassword)} pr-16`} />
                      <button type="button" onClick={() => setShowConfirmPassword((prev) => !prev)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 md:right-3 md:rounded-xl md:text-xs">
                        {showConfirmPassword ? 'Sembunyi' : 'Lihat'}
                      </button>
                    </div>
                    {formErrors.confirmPassword && <p className="mt-1 text-[11px] text-red-500 md:text-xs">{formErrors.confirmPassword}</p>}
                  </div>
                </>
              )}
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 md:mt-6 md:flex-row md:gap-3">
              <button onClick={() => setShowFormModal(false)} disabled={isLoading} className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60 md:rounded-2xl md:py-3 md:text-sm">
                Batal
              </button>
              <button onClick={formMode === 'tambah' ? handleCreate : handleUpdate} disabled={isLoading} className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-60 md:rounded-2xl md:py-3 md:text-sm">
                {isLoading ? 'Menyimpan...' : formMode === 'tambah' ? 'Tambah Siswa' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-5 text-center shadow-2xl md:rounded-[2rem] md:p-6">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 md:mb-4 md:h-16 md:w-16 md:rounded-3xl">
              <svg className="h-7 w-7 md:h-8 md:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900 md:text-xl">Hapus Siswa</h2>
            <p className="mt-2 text-xs text-slate-500 md:text-sm">
              Apakah kamu yakin ingin menghapus <span className="font-semibold text-slate-800">{deleteTarget.nama_lengkap}</span>?
            </p>
            <p className="mt-1 text-[11px] text-red-500 md:text-xs">Data yang sudah dihapus tidak bisa dikembalikan.</p>
            <div className="mt-5 flex gap-3 md:mt-6">
              <button onClick={() => setShowDeleteModal(false)} disabled={isLoading} className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60 md:rounded-2xl md:py-3 md:text-sm">
                Batal
              </button>
              <button onClick={handleDelete} disabled={isLoading} className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:bg-red-600 disabled:opacity-60 md:rounded-2xl md:py-3 md:text-sm">
                {isLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {statusPopup.show && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 md:p-4">
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={closeStatusPopup}
          />

          <div className="relative z-[151] w-full max-w-sm overflow-hidden rounded-3xl bg-white p-5 text-center shadow-2xl shadow-slate-900/20 md:rounded-[2rem] md:p-7">
            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl ${
                statusPopup.type === 'success'
                  ? 'bg-emerald-50 text-emerald-500'
                  : 'bg-red-50 text-red-500'
              }`}
            >
              {statusPopup.type === 'success' ? (
                <svg
                  className="h-9 w-9"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="h-9 w-9"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>

            <p
              className={`text-[10px] font-bold uppercase tracking-[0.18em] md:text-xs ${
                statusPopup.type === 'success'
                  ? 'text-emerald-500'
                  : 'text-red-500'
              }`}
            >
              {statusPopup.type === 'success'
                ? 'Proses Berhasil'
                : 'Proses Gagal'}
            </p>

            <h2 className="mt-2 text-lg font-bold text-slate-900 md:text-xl">
              {statusPopup.title}
            </h2>

            <p className="mt-2 text-xs leading-5 text-slate-500 md:text-sm md:leading-6">
              {statusPopup.message}
            </p>

            <button
              type="button"
              onClick={closeStatusPopup}
              className={`mt-6 w-full rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:-translate-y-0.5 md:rounded-2xl md:py-3 md:text-sm ${
                statusPopup.type === 'success'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-200 hover:from-emerald-600 hover:to-teal-600'
                  : 'bg-gradient-to-r from-red-500 to-rose-500 shadow-red-200 hover:from-red-600 hover:to-rose-600'
              }`}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;