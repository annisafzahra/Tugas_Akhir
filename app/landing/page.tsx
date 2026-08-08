'use client';

import React, { useEffect, useRef, useState } from 'react';
import { soalList } from '@/lib/data/dataSoal';
import { soalBakat } from '@/lib/data/dataBakat';
import { dataAkademik } from '@/lib/data/dataAkademik';
import { getMe, submitTes } from '@/lib/function/api';
import { useRouter } from 'next/navigation';
import { UserType } from '@/type/dataHasilTestType';
import dataHasilTest from '@/lib/function/dataHasilTest';
import Image from 'next/image';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const deskripsiJurusan: Record<string, string> = {
    IPA: 'Jurusan ini sesuai bagi siswa yang menyukai sains, logika, dan pemecahan masalah secara sistematis.',
    IPS: 'Jurusan ini sesuai bagi siswa yang tertarik mempelajari ekonomi, masyarakat, dan berbagai fenomena sosial.',
    Bahasa: 'Jurusan ini sesuai bagi siswa yang menyukai komunikasi, literasi, serta pembelajaran bahasa dan budaya.',
    AKL: 'Jurusan ini sesuai bagi siswa yang teliti dan tertarik pada bidang keuangan, administrasi, serta pengelolaan data.',
    TKJ: 'Jurusan ini sesuai bagi siswa yang tertarik pada komputer, teknologi informasi, dan jaringan.',
    TKRO: 'Jurusan ini sesuai bagi siswa yang menyukai dunia otomotif, mesin, dan teknologi kendaraan.',
  };

  const getDeskripsiJurusan = (
    jurusan: string,
    sumber: 'akademik' | 'minat' | 'bakat'
  ) => {
    const deskripsi = deskripsiJurusan[jurusan] || '';
  
    const prefixMap = {
      akademik: `Berdasarkan hasil tes akademik, kamu memiliki kecocokan yang tinggi pada jurusan ${jurusan}.`,
      minat: `Berdasarkan hasil tes minat RIASEC, kamu memiliki kecocokan yang tinggi pada jurusan ${jurusan}.`,
      bakat: `Berdasarkan hasil tes bakat, kamu memiliki kecocokan yang tinggi pada jurusan ${jurusan}.`,
    };
  
    return `${prefixMap[sumber]} ${deskripsi}`;
  };


const LandingPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [idNumber, setIdNumber] = useState(0);
  const { hasilTestSiswa } = dataHasilTest(idNumber);
  const [jawabanRiasec, setJawabanRiasec] = useState<any[]>([]);
  const [jawabanBakat, setJawabanBakat] = useState<any[]>([]);
  const [akademik, setAkademik] = useState({
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

  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [selected, setSelected] = useState<UserType | null>(null);
  const [hasilList, setHasilList] = useState<any[]>([]);
  const [isDetailTes, setIsDetailTes] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pickHapus, setPickHapus] = useState(0);
  
  const getHasilListSiswa = (siswa: UserType) => {
    return hasilList.filter((item) => {
      const sameId = item.user?.id && siswa.id && item.user.id === siswa.id;
      const sameName =
        item.user?.nama_lengkap?.toLowerCase() === siswa.nama_lengkap?.toLowerCase();
      return sameId || sameName;
    });
  };
  const selectedHasilList = selected ? getHasilListSiswa(selected) : [];

  const formatTanggal = (date?: string) => {
    if (!date) return '-';
    return date.split('T')[0];
  };


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

  // ===== REFS UNTUK SCROLL =====
  const contentRef = useRef<HTMLDivElement>(null);

  const allowLeaveRef = useRef(false);

  useEffect(() => {
    const savedDraft = localStorage.getItem(getDraftKey());
  
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
  
        setStep(draft.step || 1);
  
        setAkademik(
          draft.akademik || {
            mtk: 0,
            indo: 0,
            ipa: 0,
            ips: 0,
          }
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
        setIdNumber(res.data.id);
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

  const handleLogout = () => {
    allowLeaveRef.current = true;
  
    const userId = localStorage.getItem('user_id_jurusan');
    localStorage.removeItem(`draft_soal_jurusan_${userId || 'guest'}`);
  
    setShowLogout(false);
    router.push('/');
  };

  const handleDownloadPdf = async (hasil: any) => {
    const akademik = hasil.rekomendasi_akademik || '-';
    const riasec = hasil.rekomendasi_riasec || '-';
    const bakat = hasil.rekomendasi_bakat || '-';
  
    // =====================================================
    // DESKRIPSI JURUSAN
    // Sama seperti yang ada di HasilPage
    // =====================================================
    const deskripsiJurusan: Record<string, string> = {
      IPA:
        'Jurusan ini sesuai bagi siswa yang menyukai sains, logika, dan pemecahan masalah secara sistematis.',
  
      IPS:
        'Jurusan ini sesuai bagi siswa yang tertarik mempelajari ekonomi, masyarakat, dan berbagai fenomena sosial.',
  
      Bahasa:
        'Jurusan ini sesuai bagi siswa yang menyukai komunikasi, literasi, serta pembelajaran bahasa dan budaya.',
  
      AKL:
        'Jurusan ini sesuai bagi siswa yang teliti dan tertarik pada bidang keuangan, administrasi, serta pengelolaan data.',
  
      TKJ:
        'Jurusan ini sesuai bagi siswa yang tertarik pada komputer, teknologi informasi, dan jaringan.',
  
      TKRO:
        'Jurusan ini sesuai bagi siswa yang menyukai dunia otomotif, mesin, dan teknologi kendaraan.',
    };
  
  
    // =====================================================
    // DESKRIPSI PER HASIL
    // =====================================================
    const getDeskripsi = (
      jurusan: string,
      sumber: 'akademik' | 'minat' | 'bakat'
    ) => {
      const deskripsi = deskripsiJurusan[jurusan] || '';
  
      if (sumber === 'akademik') {
        return `Berdasarkan hasil tes akademik, kamu memiliki kecocokan yang tinggi pada jurusan ${jurusan}. ${deskripsi}`;
      }
  
      if (sumber === 'minat') {
        return `Berdasarkan hasil tes minat RIASEC, kamu memiliki kecocokan yang tinggi pada jurusan ${jurusan}. ${deskripsi}`;
      }
  
      return `Berdasarkan hasil tes bakat, kamu memiliki kecocokan yang tinggi pada jurusan ${jurusan}. ${deskripsi}`;
    };
  
  
    // =====================================================
    // LOGIKA REKOMENDASI UTAMA
    // mengikuti HasilPage
    // =====================================================
    const semuaSama =
      akademik === riasec &&
      riasec === bakat;
  
    const duaSama =
      !semuaSama &&
      (
        akademik === riasec ||
        akademik === bakat ||
        riasec === bakat
      );
  
  
    let rekomendasiUtama = '';
  
    if (semuaSama) {
      rekomendasiUtama = akademik;
    }
  
    else if (duaSama) {
      if (akademik === riasec) {
        rekomendasiUtama = akademik;
      }
  
      else if (akademik === bakat) {
        rekomendasiUtama = akademik;
      }
  
      else {
        rekomendasiUtama = riasec;
      }
    }
  
    else {
      rekomendasiUtama = akademik;
    }
  
  
    // =====================================================
    // PENJELASAN REKOMENDASI UTAMA
    // =====================================================
    let penjelasanUtama = '';
  
    if (semuaSama) {
      penjelasanUtama =
        `Ketiga aspek (akademik, minat, dan bakat) menunjukkan hasil yang sama, yaitu ${rekomendasiUtama}. ` +
        `Ini menandakan keselarasan yang kuat antara kemampuan, minat, dan bakat kamu.`;
    }
  
    else if (duaSama) {
      if (akademik === riasec) {
        penjelasanUtama =
          `Hasil akademik dan minat menunjukkan jurusan yang sama yaitu ${rekomendasiUtama}, sehingga menjadi rekomendasi utama.`;
      }
  
      else if (akademik === bakat) {
        penjelasanUtama =
          `Hasil akademik dan bakat menunjukkan jurusan yang sama yaitu ${rekomendasiUtama}, sehingga menjadi rekomendasi utama.`;
      }
  
      else {
        penjelasanUtama =
          `Hasil minat dan bakat menunjukkan jurusan yang sama yaitu ${rekomendasiUtama}, sehingga menjadi rekomendasi utama.`;
      }
    }
  
    else {
      penjelasanUtama =
        `Ketiga aspek (akademik, minat, dan bakat) menunjukkan hasil yang berbeda. ` +
        `Rekomendasi utama diambil dari aspek akademik (${rekomendasiUtama}) karena nilai akademik merupakan data riil dari rapor yang mencerminkan kemampuan aktual siswa di sekolah.`;
    }
  
  
    // =====================================================
    // DATA SISWA
    // =====================================================
    const nama =
      hasil.user?.nama_lengkap ||
      me.nama_lengkap ||
      '-';
  
    const kelas =
      hasil.user?.kelas ||
      me.kelas ||
      '-';
  
  
    // =====================================================
    // FORMAT TANGGAL
    // contoh: 06-08-2026
    // =====================================================
    const tanggal = hasil.created_at
      ? new Date(hasil.created_at)
          .toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
          .replace(/\//g, '-')
      : '-';
  
  
    // =====================================================
    // BUAT HTML PDF
    // =====================================================
    const pdfElement = document.createElement('div');
  
    pdfElement.style.position = 'fixed';
    pdfElement.style.left = '-99999px';
    pdfElement.style.top = '0';
  
    /*
      Ukuran sekitar A4 pada 96dpi.
      Hasil akhirnya akan dimasukkan ke A4 jsPDF.
    */
    pdfElement.style.width = '794px';
    pdfElement.style.minHeight = '1123px';
  
    pdfElement.style.background = '#ffffff';
  
    // kalau project kamu sudah pakai Poppins,
    // html2canvas akan menangkap font ini.
    pdfElement.style.fontFamily = 'Poppins, Arial, sans-serif';
  
    pdfElement.style.color = '#111111';
  
    pdfElement.innerHTML = `
      <div
        style="
          width: 100%;
          box-sizing: border-box;
          padding: 66px 42px 50px 42px;
          background: white;
        "
      >
  
        <!-- ============================= -->
        <!-- HEADER -->
        <!-- ============================= -->
  
        <div style="text-align:center;">
          <h1
            style="
              margin:0;
              color:#315f96;
              font-size:22px;
              font-weight:700;
              line-height:1.2;
            "
          >
            HASIL REKOMENDASI JURUSAN
          </h1>
  
          <p
            style="
              margin:7px 0 0 0;
              color:#64748b;
              font-size:13px;
              font-weight:400;
            "
          >
            Berikut adalah rekomendasi jurusan berdasarkan data yang telah diisi
          </p>
        </div>
  
  
        <!-- ============================= -->
        <!-- IDENTITAS -->
        <!-- ============================= -->
  
        <div
          style="
            margin-top:22px;
            margin-left:10px;
            font-size:13px;
            line-height:1.65;
          "
        >
  
          <div style="display:flex;">
            <div
              style="
                width:70px;
                font-weight:700;
              "
            >
              Nama
            </div>
  
            <div style="width:12px;">
              :
            </div>
  
            <div>
              ${nama}
            </div>
          </div>
  
  
          <div style="display:flex;">
            <div
              style="
                width:70px;
                font-weight:700;
              "
            >
              Kelas
            </div>
  
            <div style="width:12px;">
              :
            </div>
  
            <div>
              ${kelas}
            </div>
          </div>
  
  
          <div style="display:flex;">
            <div
              style="
                width:70px;
                font-weight:700;
              "
            >
              tanggal
            </div>
  
            <div style="width:12px;">
              :
            </div>
  
            <div>
              ${tanggal}
            </div>
          </div>
  
        </div>
  
  
        <!-- ============================= -->
        <!-- AKADEMIK -->
        <!-- ============================= -->
  
        <div
          style="
            margin-top:34px;
            border:1px solid #222222;
          "
        >
  
          <div
              style="
                  height:75px;
                  box-sizing:border-box;
                  padding:0px 12px;
                  display:flex;
                  flex-direction:column;
                  justify-content:center;
              "
          >
  
            <div
              style="
                font-size:11px;
                font-weight:700;
              "
            >
              BERDASARKAN AKADEMIK
            </div>
  
            <div
                style="
                    color:#2563eb;
                    font-size:17px;
                    font-weight:700;
                    margin-bottom:8px;
                    line-height:1.2;
                "
            >
                ${akademik}
            </div>
  
          </div>
  
  
          <div
            style="
              border-top:1px solid #222222;
              padding:0px 12px;
              padding-bottom: 18px;
              font-size:12.5px;
              line-height:1.55;
            "
          >
            ${getDeskripsi(
              akademik,
              'akademik'
            )}
          </div>
  
        </div>
  
  
        <!-- ============================= -->
        <!-- MINAT RIASEC -->
        <!-- ============================= -->
  
        <div
          style="
            margin-top:28px;
            border:1px solid #222222;
          "
        >
  
            <div
                style="
                    height:75px;
                    box-sizing:border-box;
                    padding:0px 12px;
                    display:flex;
                    flex-direction:column;
                    justify-content:center;
                "
            >
  
            <div
              style="
                font-size:11px;
                font-weight:700;
              "
            >
              BERDASARKAN MINAT (RIASEC)
            </div>
  
            <div
                style="
                    color:#2563eb;
                    font-size:17px;
                    font-weight:700;
                    margin-bottom:8px;
                    line-height:1.2;
                "
            >
              ${riasec}
            </div>
  
          </div>
  
  
          <div
            style="
              border-top:1px solid #222222;
              padding:0px 12px;
              padding-bottom: 18px;
              font-size:12.5px;
              line-height:1.55;
            "
          >
            ${getDeskripsi(
              riasec,
              'minat'
            )}
          </div>
  
        </div>
  
  
        <!-- ============================= -->
        <!-- BAKAT -->
        <!-- ============================= -->
  
        <div
          style="
            margin-top:28px;
            border:1px solid #222222;
          "
        >
  
            <div
                style="
                    height:75px;
                    box-sizing:border-box;
                    padding:0px 12px;
                    display:flex;
                    flex-direction:column;
                    justify-content:center;
                "
            >
  
            <div
              style="
                font-size:11px;
                font-weight:700;
              "
            >
              BERDASARKAN BAKAT
            </div>
  
            <div
                style="
                    color:#2563eb;
                    font-size:17px;
                    font-weight:700;
                    margin-bottom:8px;
                    line-height:1.2;
                "
            >
              ${bakat}
            </div>
  
          </div>
  
  
          <div
            style="
              border-top:1px solid #222222;
              padding:0px 12px;
              padding-bottom: 18px;
              font-size:12.5px;
              line-height:1.55;
            "
          >
            ${getDeskripsi(
              bakat,
              'bakat'
            )}
          </div>
  
        </div>
  
  
        <!-- ============================= -->
        <!-- REKOMENDASI UTAMA -->
        <!-- ============================= -->
  
        <div
          style="
            margin-top:29px;
          "
        >
  
          <!-- HEADER BIRU -->
          <div
            style="
              background:#568bc6;
              height:35px;
              display:flex;
              justify-content:center;
              align-items:center;
              color:white;
              font-size:14px;
              font-weight:400;
              padding-top:0px;
              padding-bottom:15px;
            "
          >
            REKOMENDASI UTAMA
          </div>
  
  
          <!-- HASIL BIRU MUDA -->
          <div
            style="
              height:52px;
              background:#dbe8f5;
              border-left:1px solid #8db4dc;
              border-right:1px solid #8db4dc;
              border-bottom:1px solid #8db4dc;
  
              display:flex;
              align-items:center;
              justify-content:center;
  
              color:#0875bd;
              font-size:22px;
              font-weight:700;

              padding-top:0px;
              padding-bottom:20px;
            "
          >
            ${rekomendasiUtama}
          </div>
  
        </div>
  
  
        <!-- ============================= -->
        <!-- PENJELASAN UTAMA -->
        <!-- ============================= -->
  
        <p
          style="
            margin:
              17px
              7px
              0
              7px;
  
            font-size:12.5px;
            line-height:1.55;
            color:#111111;
          "
        >
          ${penjelasanUtama}
        </p>
  
      </div>
    `;
  
  
    // masukkan sementara ke body
    document.body.appendChild(pdfElement);
  
  
    try {
      // =====================================================
      // HTML -> CANVAS
      // =====================================================
  
      const canvas = await html2canvas(
        pdfElement,
        {
          scale: 2.5,
  
          backgroundColor:
            '#ffffff',
  
          useCORS: true,
  
          logging: false,
  
          windowWidth: 794,
        }
      );
  
  
      // =====================================================
      // CANVAS -> PDF A4
      // =====================================================
  
      const imgData =
        canvas.toDataURL(
          'image/png',
          1
        );
  
  
      const pdf =
        new jsPDF(
          'p',
          'mm',
          'a4'
        );
  
  
      const pdfWidth =
        pdf.internal.pageSize.getWidth();
  
      const pdfHeight =
        pdf.internal.pageSize.getHeight();
  
  
      /*
        Isi canvas dipasang memenuhi A4.
        Karena HTML tadi sudah mengikuti rasio A4,
        layout tidak berubah.
      */
      pdf.addImage(
        imgData,
        'PNG',
        0,
        0,
        pdfWidth,
        pdfHeight,
        undefined,
        'FAST'
      );
  
  
      // =====================================================
      // NAMA FILE
      // =====================================================
  
      const namaFile =
        nama
          .trim()
          .replace(/\s+/g, '_')
          .replace(
            /[^a-zA-Z0-9_-]/g,
            ''
          );
  
  
      pdf.save(
        `Hasil_Rekomendasi_${namaFile}.pdf`
      );
  
    }
  
    catch (error) {
      console.error(
        'Gagal membuat PDF:',
        error
      );
  
      alert(
        'Gagal membuat PDF'
      );
    }
  
    finally {
      // hapus element sementara
      document.body.removeChild(
        pdfElement
      );
    }
  };


  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-blue-100 via-white to-indigo-100 relative overflow-x-hidden">
      {/* Dekorasi Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* ===== TOP NAVBAR ===== */}
      <div className="relative z-20 px-3 pt-3 pb-2 sm:px-6 sm:pt-5 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-2xl px-3 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-200 sm:h-10 sm:w-10 sm:rounded-2xl">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="truncate text-base font-bold text-slate-800 sm:text-lg">Tes Penjurusan</h1>
              <p className="truncate text-[11px] text-slate-500 sm:text-xs">Hai, {me.nama_lengkap.split(' ')[0]}</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-sm font-bold text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg sm:h-10 sm:w-10"
            >
              {me.nama_lengkap.charAt(0)}
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)}></div>
                <div className="absolute right-0 z-40 mt-2 w-[min(14rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-100 bg-white py-2 shadow-xl">
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
        <div className="w-full lg:w-[70%]">
          <div className="relative h-[400px] bg-white rounded-3xl shadow-xl border-1 border-blue-300 flex flex-row justify-end">
            <div className='absolute left-[300px] w-[250px] h-[150px] overflow-hidden'>
                <div className='w-[200px] h-[200px] rounded-full bg-blue-100 absolute -top-[100px]'></div>
            </div>
            <div className='absolute -top-[78px] -left-[10px]'>
                <Image src="/landing.png" alt="Admin" width={600} height={600} />
            </div>
            <div className='w-[50%] flex flex-col gap-6 pt-[70px]'>
                <p className='text-[40px] font-bold leading-[1.2]'>Bingung Memilih Jurusan? Kami Siap Membantu!</p>
                <p className='w-[500px]'>Ikuti tes akademik, minat, dan bakat untuk menemukan jurusan yang paling sesuai dengan dirimu sehingga kamu dapat belajar dengan lebih percaya diri.</p>
                <button onClick={()=>{router.push('/soal')}} className='w-[500px] flex flex-row gap-3 items-center justify-center font-bold text-[15px] rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white py-4 transition-transform duration-300 hover:scale-105'>
                    Mulai Tes
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
                            d="M16.862 3.487a2.121 2.121 0 113 3L7.5 18.85 3 20l1.15-4.5L16.862 3.487z"
                        />
                    </svg>
                </button>
            </div>


          </div>
        </div>
      </div>
      
      
            {/* ===== DETAIL JURUSAN ===== */}
            <div className="relative z-10 flex items-center justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="w-full max-w-6xl">

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[0.78fr_1.7fr] lg:gap-10">

                {/* ===== BAGIAN KIRI ===== */}
                <div className="flex flex-col items-center pt-0 text-center lg:items-start lg:pt-4 lg:text-left">
                    <p className="mb-3 w-fit rounded-full border border-blue-300 bg-blue-100 px-5 py-2 text-center text-sm font-semibold text-blue-600 sm:px-6">
                    Detail Jurusan
                    </p>

                    <h2 className="mb-4 max-w-md text-[26px] font-bold leading-[1.15] text-slate-700 sm:text-[30px] lg:mb-5">
                    Kenali Jurusan yang
                    Sesuai dengan Dirimu
                    </h2>

                    <p className="max-w-md text-sm leading-relaxed text-slate-500 sm:text-[15px] lg:max-w-[320px]">
                    Setiap jurusan memiliki bidang pembelajaran dan karakteristik yang
                    berbeda. Kenali masing-masing jurusan agar kamu dapat memahami
                    pilihan yang sesuai dengan minat, kemampuan, dan bakatmu.
                    </p>
                </div>

                {/* ===== BAGIAN KANAN ===== */}
                <div
                    className="
                    flex
                    w-full
                    gap-4
                    overflow-x-auto
                    pb-5
                    pr-2
                    scroll-smooth
                    snap-x
                    snap-mandatory
                    sm:gap-5

                    [&::-webkit-scrollbar]:h-2
                    [&::-webkit-scrollbar-track]:bg-slate-100
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-blue-300
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    "
                >

                    {/* ================= IPA ================= */}
                    <div className="min-w-[280px] max-w-[280px] min-h-[430px] sm:min-w-[320px] sm:max-w-[320px] sm:min-h-[450px] bg-white border border-b-4 border-blue-300 rounded-[24px] p-5 shadow-sm snap-start flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:rounded-[28px] sm:p-6">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-[28px] mb-5">
                        🔬
                    </div>

                    <h3 className="text-[22px] font-bold text-slate-700 sm:text-[24px]">
                        IPA
                    </h3>

                    <p className="text-[14px] text-slate-500 leading-relaxed mt-3">
                        Jurusan IPA mempelajari berbagai ilmu tentang alam, seperti
                        Matematika, Fisika, Kimia, dan Biologi.
                    </p>

                    <div className="mt-5">
                        <p className="text-[14px] font-semibold text-slate-700 mb-3">
                        Cocok untuk kamu yang:
                        </p>

                        <ul className="space-y-2 text-[14px] text-slate-500">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">✓</span>
                            Menyukai pelajaran sains.
                        </li>

                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">✓</span>
                            Senang berpikir logis.
                        </li>

                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">✓</span>
                            Memiliki rasa ingin tahu yang tinggi.
                        </li>

                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">✓</span>
                            Tertarik melakukan eksperimen.
                        </li>
                        </ul>
                    </div>

                    
                    </div>


                    {/* ================= IPS ================= */}
                    <div className="min-w-[280px] max-w-[280px] min-h-[430px] sm:min-w-[320px] sm:max-w-[320px] bg-white border border-b-4 border-orange-300 rounded-[24px] p-5 shadow-sm snap-start flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:rounded-[28px] sm:p-6">
                    <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-[28px] mb-5">
                        🌍
                    </div>

                    <h3 className="text-[22px] font-bold text-slate-700 sm:text-[24px]">
                        IPS
                    </h3>

                    <p className="text-[14px] text-slate-500 leading-relaxed mt-3">
                        Jurusan IPS mempelajari kehidupan masyarakat, ekonomi, sejarah,
                        geografi, dan berbagai peristiwa sosial.
                    </p>

                    <div className="mt-5">
                        <p className="text-[14px] font-semibold text-slate-700 mb-3">
                        Cocok untuk kamu yang:
                        </p>

                        <ul className="space-y-2 text-[14px] text-slate-500">
                        <li className="flex items-start gap-2">
                            <span className="text-orange-500 font-bold">✓</span>
                            Senang berdiskusi.
                        </li>

                        <li className="flex items-start gap-2">
                            <span className="text-orange-500 font-bold">✓</span>
                            Tertarik pada kehidupan sosial.
                        </li>

                        <li className="flex items-start gap-2">
                            <span className="text-orange-500 font-bold">✓</span>
                            Menyukai ekonomi atau sejarah.
                        </li>

                        <li className="flex items-start gap-2">
                            <span className="text-orange-500 font-bold">✓</span>
                            Memiliki kemampuan komunikasi yang baik.
                        </li>
                        </ul>
                    </div>
                    </div>


                    {/* ================= BAHASA ================= */}
                    <div className="min-w-[280px] max-w-[280px] min-h-[430px] sm:min-w-[320px] sm:max-w-[320px] bg-white border border-b-4 border-purple-300 rounded-[24px] p-5 shadow-sm snap-start flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:rounded-[28px] sm:p-6">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-[28px] mb-5">
                        📚
                    </div>

                    <h3 className="text-[22px] font-bold text-slate-700 sm:text-[24px]">
                        Bahasa
                    </h3>

                    <p className="text-[14px] text-slate-500 leading-relaxed mt-3">
                        Jurusan Bahasa berfokus pada kemampuan berbahasa, komunikasi,
                        sastra, serta pemahaman berbagai budaya.
                    </p>

                    <div className="mt-5">
                        <p className="text-[14px] font-semibold text-slate-700 mb-3">
                        Cocok untuk kamu yang:
                        </p>

                        <ul className="space-y-2 text-[14px] text-slate-500">
                        <li className="flex items-start gap-2">
                            <span className="text-purple-500 font-bold">✓</span>
                            Gemar membaca.
                        </li>

                        <li className="flex items-start gap-2">
                            <span className="text-purple-500 font-bold">✓</span>
                            Senang menulis.
                        </li>

                        <li className="flex items-start gap-2">
                            <span className="text-purple-500 font-bold">✓</span>
                            Tertarik belajar bahasa asing.
                        </li>

                        <li className="flex items-start gap-2">
                            <span className="text-purple-500 font-bold">✓</span>
                            Suka berkomunikasi dengan orang lain.
                        </li>
                        </ul>
                    </div>
                    </div>


                    {/* ================= TKJ ================= */}
                    <div className="min-w-[280px] max-w-[280px] min-h-[430px] sm:min-w-[320px] sm:max-w-[320px] bg-white border border-b-4 border-cyan-300 rounded-[24px] p-5 shadow-sm snap-start flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:rounded-[28px] sm:p-6">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-100 flex items-center justify-center text-[28px] mb-5">
                        💻
                    </div>

                    <h3 className="text-[22px] font-bold text-slate-700 sm:text-[24px]">
                        TKJ
                    </h3>

                    <p className="text-[14px] text-slate-500 leading-relaxed mt-3">
                        Jurusan TKJ mempelajari komputer, jaringan, perangkat keras,
                        serta dasar-dasar teknologi informasi.
                    </p>

                    <div className="mt-5">
                        <p className="text-[14px] font-semibold text-slate-700 mb-3">
                        Cocok untuk kamu yang:
                        </p>

                        <ul className="space-y-2 text-[14px] text-slate-500">
                        <li className="flex items-start gap-2">
                            <span className="text-cyan-500 font-bold">✓</span>
                            Menyukai komputer.
                        </li>

                        <li className="flex items-start gap-2">
                            <span className="text-cyan-500 font-bold">✓</span>
                            Tertarik pada teknologi.
                        </li>

                        <li className="flex items-start gap-2">
                            <span className="text-cyan-500 font-bold">✓</span>
                            Senang memecahkan masalah.
                        </li>

                        <li className="flex items-start gap-2">
                            <span className="text-cyan-500 font-bold">✓</span>
                            Ingin belajar dunia IT.
                        </li>
                        </ul>
                    </div>
                    </div>


                    {/* ================= AKL ================= */}
                    <div className="min-w-[280px] max-w-[280px] min-h-[430px] sm:min-w-[320px] sm:max-w-[320px] bg-white border border-b-4 border-emerald-300 rounded-[24px] p-5 shadow-sm snap-start flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:rounded-[28px] sm:p-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-[28px] mb-5">
                        💰
                    </div>

                    <h3 className="text-[22px] font-bold text-slate-700 sm:text-[24px]">
                        AKL
                    </h3>

                    <p className="text-[14px] text-slate-500 leading-relaxed mt-3">
                        Jurusan AKL mempelajari pengelolaan keuangan, pencatatan
                        transaksi, dan dasar-dasar akuntansi.
                    </p>

                    <div className="mt-5">
                        <p className="text-[14px] font-semibold text-slate-700 mb-3">
                        Cocok untuk kamu yang:
                        </p>

                        <ul className="space-y-2 text-[14px] text-slate-500">
                        <li className="flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">✓</span>
                            Teliti dalam bekerja.
                        </li>

                        <li className="flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">✓</span>
                            Suka berhitung.
                        </li>

                        <li className="flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">✓</span>
                            Senang bekerja dengan data.
                        </li>

                        <li className="flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">✓</span>
                            Tertarik pada dunia keuangan.
                        </li>
                        </ul>
                    </div>
                    </div>


                    {/* ================= TKRO ================= */}
                    <div className="min-w-[280px] max-w-[280px] min-h-[430px] sm:min-w-[320px] sm:max-w-[320px] bg-white border border-b-4 border-red-300 rounded-[24px] p-5 shadow-sm snap-start flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:rounded-[28px] sm:p-6">
                    <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-[28px] mb-5">
                        🚗
                    </div>

                    <h3 className="text-[22px] font-bold text-slate-700 sm:text-[24px]">
                        TKRO
                    </h3>

                    <p className="text-[14px] text-slate-500 leading-relaxed mt-3">
                        Jurusan TKRO mempelajari cara kerja, perawatan, dan perbaikan
                        kendaraan bermotor.
                    </p>

                    <div className="mt-5">
                        <p className="text-[14px] font-semibold text-slate-700 mb-3">
                        Cocok untuk kamu yang:
                        </p>

                        <ul className="space-y-2 text-[14px] text-slate-500">
                        <li className="flex items-start gap-2">
                            <span className="text-red-500 font-bold">✓</span>
                            Menyukai dunia otomotif.
                        </li>

                        <li className="flex items-start gap-2">
                            <span className="text-red-500 font-bold">✓</span>
                            Senang kegiatan praktik.
                        </li>

                        <li className="flex items-start gap-2">
                            <span className="text-red-500 font-bold">✓</span>
                            Tertarik dengan mesin kendaraan.
                        </li>

                        <li className="flex items-start gap-2">
                            <span className="text-red-500 font-bold">✓</span>
                            Suka mempelajari cara kerja alat.
                        </li>
                        </ul>
                    </div>
                    </div>

                </div>
                </div>
            </div>
            </div>
      
      
      {/* ===== MAIN CONTENT ===== */}
      <div className="relative z-10 mb-16 flex items-center justify-center px-4 py-4 sm:px-6 lg:mb-24 lg:px-8">
        <div className="w-full max-w-6xl">
          <div className="relative flex min-h-[500px] flex-col-reverse gap-8 rounded-3xl border border-blue-200 bg-white p-4 shadow-xl sm:p-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10 lg:p-10">
                
                {/* RIWAYAT */}
                <div className='flex w-full min-w-0 flex-col lg:w-[62%]'>
                    <div className='mt-1 flex max-h-[520px] w-full flex-col gap-3 overflow-y-auto pr-1 sm:pr-2'>
                        {hasilTestSiswa.map((hasil: any, index: number) => (
                            <div key={hasil.id || index} className="rounded-2xl border border-blue-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4 md:rounded-[1.7rem] md:p-5">
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

                                <div className="grid w-full grid-cols-3 gap-1.5 sm:gap-2 md:w-auto md:min-w-[300px]">
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

                                <div className="mt-4 flex h-auto flex-col items-stretch gap-3 md:flex-row md:items-stretch md:justify-between md:gap-4">
                                    <div className='flex min-w-0 flex-1 flex-col rounded-2xl border border-blue-200 bg-blue-50 p-4'>
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
                                    <div className='flex min-w-0 flex-1 flex-col rounded-2xl border border-purple-200 bg-purple-50 p-4'>
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
                                    <div className='flex min-w-0 flex-1 flex-col rounded-2xl border border-emerald-200 bg-emerald-50 p-4'>
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

                                <div className="mt-3 flex justify-stretch gap-2 border-t border-slate-100 pt-3 sm:justify-end md:mt-4 md:pt-4">
                                <button
                                onClick={() => handleDownloadPdf(hasil)}
                                className="w-full rounded-xl bg-gradient-to-br from-red-500 to-[#c70462] px-4 py-2.5 text-xs font-extrabold text-white shadow-lg transition hover:scale-[1.02] sm:w-auto md:px-6 md:text-sm"
                                >
                                Download PDF
                                </button>
                                </div>
                            </div>
                            ))}
                    </div>
                </div>
                
                {/* ===== BAGIAN KANAN ===== */}
                <div className="flex w-full flex-col items-center text-center lg:w-[32%] lg:items-start lg:pt-4 lg:text-left">
                    <p className="mb-3 w-fit rounded-full border border-blue-300 bg-blue-100 px-5 py-2 text-center text-sm font-semibold text-blue-600 sm:px-6">
                    Riwayat Tes
                    </p>

                    <h2 className="mb-4 max-w-md text-[26px] font-bold leading-[1.15] text-slate-700 sm:text-[30px] lg:mb-5 lg:max-w-[320px]">
                        Cek Kembali Hasil Tesmu
                    </h2>

                    <p className="max-w-md text-sm leading-relaxed text-slate-500 sm:text-[15px] lg:max-w-[320px]">
                        Lihat kembali hasil tes dan rekomendasi jurusan yang pernah kamu dapatkan.
                        Kamu juga bisa mengunduh hasilnya dalam bentuk PDF agar mudah disimpan.
                    </p>
                </div>

                
          </div>
        </div>
      </div>

      {/* ===== MODAL PROFILE ===== */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowProfile(false)}></div>
          <div className="relative z-50 max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-[1.75rem] bg-white p-5 shadow-2xl sm:rounded-[2rem] sm:p-6">
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
                  <p className="break-all text-sm font-medium text-slate-700">{me.email}</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowLogout(false)}></div>
          <div className="relative z-50 w-full max-w-sm rounded-[1.75rem] bg-white p-5 text-center shadow-2xl sm:rounded-[2rem] sm:p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>

            <h2 className="text-lg font-bold text-slate-800 mb-2">Konfirmasi Logout</h2>
            <p className="text-sm text-slate-500 mb-6">
              Apakah kamu yakin ingin keluar dari halaman tes? Jawaban yang sudah diisi akan tetap tersimpan sebagai draft.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
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

export default LandingPage;