'use client';

import { soalBakat } from '@/lib/data/dataBakat';
import { soalList } from '@/lib/data/dataSoal';
import { getMe } from '@/lib/function/api';
import dataHasilTest from '@/lib/function/dataHasilTest';
import { UserType } from '@/type/dataHasilTestType';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';



type DetailJurusanKey = 'IPA' | 'IPS' | 'Bahasa' | 'TKJ' | 'AKL' | 'TKRO';

const detailJurusan: Record<
  DetailJurusanKey,
  {
    judul: string;
    icon: string;
    tentang: string;
    warna: string;
    pelajaran: { judul: string; deskripsi: string }[];
    kegiatan: { judul: string; deskripsi: string }[];
    cocok: { judul: string; deskripsi: string }[];
  }
> = {
  IPA: {
    judul: 'IPA',
    icon: '🔬',
    tentang:
      'IPA berfokus pada pembelajaran mengenai alam dan berbagai fenomena yang terjadi di dalamnya. Kamu akan banyak menggunakan kemampuan berpikir ilmiah, logis, dan analitis untuk memahami bagaimana suatu fenomena dapat terjadi.',
    warna: 'blue',
    pelajaran: [
      {
        judul: 'Fisika',
        deskripsi:
          'Kamu akan mempelajari berbagai fenomena seperti gerak, gaya, energi, gelombang, listrik, dan konsep fisika lainnya yang banyak ditemukan dalam kehidupan sehari-hari.',
      },
      {
        judul: 'Kimia',
        deskripsi:
          'Kamu akan mengenal materi dan sifat-sifatnya, unsur dan senyawa, reaksi kimia, serta berbagai perubahan zat yang terjadi di alam maupun dalam kehidupan sehari-hari.',
      },
      {
        judul: 'Biologi',
        deskripsi:
          'Kamu akan mempelajari kehidupan mulai dari sel, sistem tubuh makhluk hidup, genetika, keanekaragaman hayati, hingga hubungan makhluk hidup dengan lingkungannya.',
      },
      {
        judul: 'Matematika dan Analisis Data',
        deskripsi:
          'Kemampuan matematika akan sering digunakan untuk melakukan perhitungan, membaca data, memahami hubungan antarvariabel, dan membantu menyelesaikan berbagai persoalan ilmiah.',
      },
    ],
    kegiatan: [
      {
        judul: 'Praktikum dan Eksperimen',
        deskripsi:
          'Kamu akan melakukan berbagai percobaan untuk menguji suatu konsep atau fenomena, kemudian mengamati dan mencatat hasil yang diperoleh.',
      },
      {
        judul: 'Menganalisis dan Memecahkan Masalah',
        deskripsi:
          'Kamu akan banyak berlatih memahami suatu permasalahan, mengolah informasi atau data, kemudian mencari penjelasan dan solusi berdasarkan konsep ilmiah.',
      },
    ],
    cocok: [
      {
        judul: 'Suka Sains dan Memiliki Rasa Ingin Tahu',
        deskripsi:
          'IPA cocok untuk kamu yang penasaran dengan cara kerja alam dan senang mencari tahu alasan di balik suatu fenomena.',
      },
      {
        judul: 'Senang Berpikir Logis',
        deskripsi:
          'Kamu akan sering menghadapi perhitungan, data, dan persoalan yang membutuhkan penalaran secara runtut.',
      },
    ],
  },

  IPS: {
    judul: 'IPS',
    icon: '🌍',
    tentang:
      'IPS berfokus pada kehidupan manusia, masyarakat, ekonomi, lingkungan, dan berbagai peristiwa sosial. Kamu akan belajar memahami bagaimana manusia berinteraksi dan bagaimana berbagai perubahan sosial maupun ekonomi terjadi.',
    warna: 'orange',
    pelajaran: [
      {
        judul: 'Ekonomi',
        deskripsi:
          'Kamu akan mempelajari kegiatan ekonomi, kebutuhan manusia, pasar, badan usaha, serta berbagai persoalan ekonomi yang terjadi dalam kehidupan masyarakat.',
      },
      {
        judul: 'Sosiologi',
        deskripsi:
          'Kamu akan mempelajari hubungan antarmanusia, kelompok sosial, perubahan sosial, konflik, serta berbagai fenomena yang terjadi dalam masyarakat.',
      },
      {
        judul: 'Geografi',
        deskripsi:
          'Kamu akan mempelajari hubungan manusia dengan lingkungan, kondisi wilayah, kependudukan, sumber daya alam, serta berbagai fenomena yang terjadi di permukaan bumi.',
      },
      {
        judul: 'Sejarah',
        deskripsi:
          'Kamu akan mempelajari berbagai peristiwa masa lalu dan melihat bagaimana peristiwa tersebut memberikan pengaruh terhadap kehidupan masyarakat saat ini.',
      },
    ],
    kegiatan: [
      {
        judul: 'Menganalisis Fenomena Sosial',
        deskripsi:
          'Kamu akan belajar mengamati suatu peristiwa sosial atau ekonomi, mencari penyebabnya, serta memahami dampaknya bagi masyarakat.',
      },
      {
        judul: 'Diskusi dan Penelitian Sederhana',
        deskripsi:
          'Pembelajaran dapat melibatkan diskusi, pengumpulan informasi, pengamatan kondisi masyarakat, hingga menyampaikan hasil analisis.',
      },
    ],
    cocok: [
      {
        judul: 'Tertarik dengan Masyarakat dan Dunia Sosial',
        deskripsi:
          'IPS cocok untuk kamu yang penasaran dengan kehidupan masyarakat, ekonomi, sejarah, maupun berbagai peristiwa yang terjadi di sekitar.',
      },
      {
        judul: 'Senang Berdiskusi dan Menganalisis',
        deskripsi:
          'Kamu akan sering membaca informasi, menyampaikan pendapat, melihat suatu permasalahan dari berbagai sudut pandang, dan menarik kesimpulan.',
      },
    ],
  },

  Bahasa: {
    judul: 'Bahasa',
    icon: '📚',
    tentang:
      'Bidang Bahasa berfokus pada kemampuan memahami dan menggunakan bahasa untuk berkomunikasi serta menyampaikan gagasan. Kamu juga akan banyak mengenal berbagai teks, karya sastra, dan penggunaan bahasa secara lisan maupun tulisan.',
    warna: 'purple',
    pelajaran: [
      {
        judul: 'Bahasa dan Komunikasi',
        deskripsi:
          'Kamu akan mengembangkan kemampuan memahami informasi serta menyampaikan gagasan secara jelas melalui komunikasi lisan maupun tulisan.',
      },
      {
        judul: 'Teks dan Literasi',
        deskripsi:
          'Kamu akan mempelajari berbagai jenis teks serta belajar memahami informasi, gagasan, struktur, dan makna yang terdapat di dalamnya.',
      },
      {
        judul: 'Sastra',
        deskripsi:
          'Kamu akan mengenal dan mengapresiasi berbagai karya sastra seperti puisi, prosa, novel, hikayat, dan drama serta memahami pesan yang terkandung di dalamnya.',
      },
      {
        judul: 'Menulis dan Menyampaikan Gagasan',
        deskripsi:
          'Kamu akan belajar menuangkan ide menjadi tulisan yang runtut sekaligus mengembangkan kemampuan berbicara, berdiskusi, dan melakukan presentasi.',
      },
    ],
    kegiatan: [
      {
        judul: 'Membaca dan Menganalisis Teks',
        deskripsi:
          'Kamu tidak hanya membaca, tetapi juga belajar menemukan informasi, memahami makna, mengevaluasi gagasan, dan memberikan tanggapan terhadap suatu teks.',
      },
      {
        judul: 'Menulis dan Presentasi',
        deskripsi:
          'Kamu akan berlatih membuat berbagai bentuk tulisan serta menyampaikan gagasan atau hasil pemikiran kepada orang lain.',
      },
    ],
    cocok: [
      {
        judul: 'Senang Membaca dan Menulis',
        deskripsi:
          'Bidang Bahasa cocok untuk kamu yang menikmati kegiatan membaca, menulis cerita atau gagasan, dan mempelajari penggunaan bahasa.',
      },
      {
        judul: 'Kreatif dan Komunikatif',
        deskripsi:
          'Kamu akan memiliki banyak kesempatan untuk mengekspresikan ide melalui tulisan, sastra, diskusi, maupun presentasi.',
      },
    ],
  },

  TKJ: {
    judul: 'TKJ',
    icon: '💻',
    tentang:
      'Teknik Komputer dan Jaringan (TKJ) berfokus pada komputer, perangkat jaringan, dan sistem komunikasi data. Kamu tidak hanya belajar teori, tetapi juga banyak melakukan praktik pemasangan, konfigurasi, dan perbaikan jaringan.',
    warna: 'cyan',
    pelajaran: [
      {
        judul: 'Dasar Jaringan Komputer',
        deskripsi:
          'Kamu akan mempelajari bagaimana komputer dapat saling terhubung dan bertukar data serta mengenal berbagai perangkat yang digunakan dalam jaringan.',
      },
      {
        judul: 'IP Address dan Subnetting',
        deskripsi:
          'Kamu akan belajar mengatur alamat perangkat dalam jaringan dan melakukan perhitungan subnetting agar jaringan dapat dirancang dengan baik.',
      },
      {
        judul: 'Jaringan Kabel, Nirkabel, dan Fiber Optic',
        deskripsi:
          'Kamu akan mengenal berbagai media jaringan serta belajar melakukan pemasangan dan perbaikan jaringan menggunakan kabel, Wi-Fi, maupun fiber optic.',
      },
      {
        judul: 'Router dan Perangkat Jaringan',
        deskripsi:
          'Kamu akan belajar memasang serta mengonfigurasi perangkat seperti router dan switch agar komunikasi antarperangkat maupun antarjaringan dapat berjalan.',
      },
      {
        judul: 'Server dan Layanan Jaringan',
        deskripsi:
          'Kamu akan belajar melakukan instalasi dan konfigurasi berbagai layanan seperti DHCP, DNS, FTP, web server, database server, VPN, dan layanan jaringan lainnya.',
      },
      {
        judul: 'Keamanan Jaringan',
        deskripsi:
          'Kamu akan mempelajari berbagai ancaman pada jaringan serta bagaimana menerapkan sistem keamanan untuk melindungi perangkat dan data.',
      },
    ],
    kegiatan: [
      {
        judul: 'Merancang dan Membangun Jaringan',
        deskripsi:
          'Kamu akan membuat topologi jaringan, menentukan alamat IP, memasang perangkat, dan melakukan konfigurasi sampai jaringan dapat digunakan.',
      },
      {
        judul: 'Troubleshooting Jaringan',
        deskripsi:
          'Ketika jaringan mengalami masalah, kamu akan belajar mencari sumber gangguan, melakukan pengujian, dan menentukan langkah perbaikannya.',
      },
    ],
    cocok: [
      {
        judul: 'Tertarik dengan Komputer dan Teknologi',
        deskripsi:
          'TKJ cocok untuk kamu yang penasaran dengan cara kerja komputer, internet, server, dan berbagai perangkat jaringan.',
      },
      {
        judul: 'Senang Memecahkan Masalah Teknis',
        deskripsi:
          'Kamu akan sering menemukan konfigurasi atau jaringan yang bermasalah sehingga kemampuan berpikir logis, teliti, dan mencari solusi akan sangat berguna.',
      },
    ],
  },

  AKL: {
    judul: 'AKL',
    icon: '💰',
    tentang:
      'Akuntansi dan Keuangan Lembaga (AKL) berfokus pada pencatatan, pengolahan, dan penyajian informasi keuangan perusahaan maupun lembaga. Kamu akan belajar bagaimana transaksi keuangan diproses hingga menjadi laporan keuangan.',
    warna: 'emerald',
    pelajaran: [
      {
        judul: 'Dasar Akuntansi dan Transaksi',
        deskripsi:
          'Kamu akan memahami konsep dasar akuntansi serta belajar mengenali dan menganalisis berbagai dokumen transaksi keuangan.',
      },
      {
        judul: 'Jurnal dan Buku Besar',
        deskripsi:
          'Kamu akan belajar mencatat transaksi ke dalam jurnal kemudian memindahkan informasi tersebut ke buku besar sebagai bagian dari proses akuntansi.',
      },
      {
        judul: 'Piutang, Utang, dan Persediaan',
        deskripsi:
          'Kamu akan mempelajari bagaimana perusahaan mencatat serta mengelola piutang pelanggan, utang, dan persediaan barang.',
      },
      {
        judul: 'Laporan Keuangan',
        deskripsi:
          'Kamu akan belajar menyusun laporan seperti laporan laba rugi, perubahan ekuitas, posisi keuangan, dan arus kas.',
      },
      {
        judul: 'Komputer Akuntansi',
        deskripsi:
          'Selain pencatatan manual, kamu akan belajar menggunakan teknologi atau aplikasi komputer untuk membantu mengelola data dan proses akuntansi.',
      },
      {
        judul: 'Perpajakan',
        deskripsi:
          'Kamu akan mempelajari dasar penghitungan, pencatatan, pembayaran, dan pelaporan pajak yang berkaitan dengan kegiatan usaha.',
      },
    ],
    kegiatan: [
      {
        judul: 'Mengolah Transaksi Keuangan',
        deskripsi:
          'Kamu akan berlatih membaca bukti transaksi, menentukan jenis transaksi, melakukan pencatatan, dan mengolahnya menjadi informasi keuangan.',
      },
      {
        judul: 'Menyusun Laporan Keuangan',
        deskripsi:
          'Data transaksi yang telah dicatat akan diproses secara sistematis hingga menghasilkan laporan yang menggambarkan kondisi keuangan perusahaan.',
      },
    ],
    cocok: [
      {
        judul: 'Teliti dan Menyukai Angka',
        deskripsi:
          'AKL cocok untuk kamu yang nyaman bekerja dengan angka dan mampu memperhatikan detail karena kesalahan kecil dalam pencatatan dapat memengaruhi hasil laporan.',
      },
      {
        judul: 'Menyukai Kegiatan yang Terstruktur',
        deskripsi:
          'Proses akuntansi dilakukan melalui tahapan yang sistematis, sehingga cocok untuk kamu yang senang mengelola data dengan rapi dan mengikuti prosedur.',
      },
    ],
  },

  TKRO: {
    judul: 'TKRO',
    icon: '🚗',
    tentang:
      'Teknik Kendaraan Ringan Otomotif (TKRO) berfokus pada cara kerja, pemeriksaan, perawatan, dan perbaikan kendaraan ringan seperti mobil. Pembelajarannya banyak dilakukan melalui kegiatan praktik menggunakan komponen kendaraan dan peralatan bengkel.',
    warna: 'red',
    pelajaran: [
      {
        judul: 'Mesin Kendaraan',
        deskripsi:
          'Kamu akan mempelajari cara kerja mesin serta melakukan pemeriksaan, pembongkaran, perawatan, dan perbaikan berbagai komponen mesin.',
      },
      {
        judul: 'Sistem Bahan Bakar dan EMS',
        deskripsi:
          'Kamu akan mengenal sistem bahan bakar serta Engine Management System (EMS) yang mengatur berbagai proses kerja mesin secara elektronik.',
      },
      {
        judul: 'Transmisi dan Pemindah Tenaga',
        deskripsi:
          'Kamu akan mempelajari bagaimana tenaga dari mesin diteruskan menuju roda melalui kopling, transmisi, differential, dan komponen pemindah tenaga lainnya.',
      },
      {
        judul: 'Rem, Kemudi, dan Suspensi',
        deskripsi:
          'Kamu akan memahami cara kerja sistem yang berhubungan dengan pengereman, pengendalian arah kendaraan, kenyamanan, dan kestabilan kendaraan.',
      },
      {
        judul: 'Kelistrikan Kendaraan',
        deskripsi:
          'Kamu akan mempelajari baterai, sistem starter, sistem pengisian, penerangan, pengapian, AC, serta berbagai komponen kelistrikan lainnya.',
      },
    ],
    kegiatan: [
      {
        judul: 'Servis dan Perawatan Kendaraan',
        deskripsi:
          'Kamu akan melakukan pemeriksaan dan perawatan berkala untuk memastikan berbagai komponen kendaraan dapat bekerja dengan baik.',
      },
      {
        judul: 'Diagnosis dan Perbaikan Kerusakan',
        deskripsi:
          'Kamu akan belajar mengenali gejala kerusakan, mencari komponen yang bermasalah, kemudian menentukan dan melakukan tindakan perbaikan.',
      },
    ],
    cocok: [
      {
        judul: 'Menyukai Otomotif dan Mesin',
        deskripsi:
          'TKRO cocok untuk kamu yang tertarik mengetahui bagaimana mesin dan berbagai komponen kendaraan bekerja.',
      },
      {
        judul: 'Senang Praktik dan Bekerja dengan Alat',
        deskripsi:
          'Sebagian pembelajaran melibatkan kegiatan teknis sehingga cocok untuk kamu yang menikmati aktivitas praktik, bongkar-pasang, pemeriksaan, dan penggunaan peralatan.',
      },
    ],
  },
};

const LandingPage = () => {
  const router = useRouter();
  const [idNumber, setIdNumber] = useState(0);
  const { hasilTestSiswa } = dataHasilTest(idNumber);
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
  const [selectedJurusan, setSelectedJurusan] = useState<DetailJurusanKey | null>(null);

  const formatTanggal = (date?: string) => {
    if (!date) return '-';
    return date.split('T')[0];
  };

  const allowLeaveRef = useRef(false);

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
      <div className="flex-1 flex items-center justify-center p-4 relative z-30">
        <div className="w-full lg:w-[70%]">
          <div className="relative h-[400px] z-30 bg-white rounded-3xl shadow-xl border-1 border-blue-300 flex flex-row justify-end">
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
            <div className="relative z-10 flex bg-blue-500 -top-[50px] items-center justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
              <div className="w-full px-[200px]">

                <div className="grid grid-cols-1 py-[70px] items-start gap-8 lg:grid-cols-[0.78fr_1.7fr] lg:gap-10">

                {/* ===== BAGIAN KIRI ===== */}
                <div className="flex flex-col items-center pt-0 text-center lg:items-start lg:pt-4 lg:text-left">
                    <p className="mb-3 w-fit rounded-full border border-white px-5 py-2 text-center text-sm font-semibold text-white sm:px-6">
                    Detail Jurusan
                    </p>

                    <h2 className="mb-4 max-w-md text-[26px] font-bold leading-[1.15] text-white sm:text-[30px] lg:mb-5">
                    Kenali Jurusan yang
                    Sesuai dengan Dirimu
                    </h2>

                    <p className="max-w-md text-sm leading-relaxed text-white sm:text-[15px] lg:max-w-[320px]">
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
                    <div className="min-w-[280px] max-w-[280px] h-[530px] sm:min-w-[320px] sm:max-w-[320px] sm:min-h-[450px] bg-white border border-b-4 border-blue-800 rounded-[24px] p-5 shadow-sm snap-start flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:rounded-[28px] sm:p-6">
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
                    <button
                        onClick={() => setSelectedJurusan('IPA')}
                        className="mt-auto w-full rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-3 text-[14px] font-bold text-white shadow-sm transition-all duration-200 hover:scale-[1.02]"
                    >
                        Lihat Detail
                    </button>

                    
                    </div>


                    {/* ================= IPS ================= */}
                    <div className="min-w-[280px] max-w-[280px] min-h-[430px] sm:min-w-[320px] sm:max-w-[320px] bg-white border border-b-4 border-blue-800 rounded-[24px] p-5 shadow-sm snap-start flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:rounded-[28px] sm:p-6">
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
                    <button
                        onClick={() => setSelectedJurusan('IPS')}
                        className="mt-auto w-full rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-3 text-[14px] font-bold text-white shadow-sm transition-all duration-200 hover:scale-[1.02]"
                    >
                        Lihat Detail
                    </button>
                    </div>


                    {/* ================= BAHASA ================= */}
                    <div className="min-w-[280px] max-w-[280px] min-h-[430px] sm:min-w-[320px] sm:max-w-[320px] bg-white border border-b-4 border-blue-800 rounded-[24px] p-5 shadow-sm snap-start flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:rounded-[28px] sm:p-6">
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
                    <button
                        onClick={() => setSelectedJurusan('Bahasa')}
                        className="mt-auto w-full rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-3 text-[14px] font-bold text-white shadow-sm transition-all duration-200 hover:scale-[1.02]"
                    >
                        Lihat Detail
                    </button>
                    </div>


                    {/* ================= TKJ ================= */}
                    <div className="min-w-[280px] max-w-[280px] min-h-[430px] sm:min-w-[320px] sm:max-w-[320px] bg-white border border-b-4 border-blue-800 rounded-[24px] p-5 shadow-sm snap-start flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:rounded-[28px] sm:p-6">
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
                    <button
                        onClick={() => setSelectedJurusan('TKJ')}
                        className="mt-auto w-full rounded-xl bg-cyan-600 hover:bg-cyan-700 px-4 py-3 text-[14px] font-bold text-white shadow-sm transition-all duration-200 hover:scale-[1.02]"
                    >
                        Lihat Detail
                    </button>
                    </div>


                    {/* ================= AKL ================= */}
                    <div className="min-w-[280px] max-w-[280px] min-h-[430px] sm:min-w-[320px] sm:max-w-[320px] bg-white border border-b-4 border-blue-800 rounded-[24px] p-5 shadow-sm snap-start flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:rounded-[28px] sm:p-6">
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
                    <button
                        onClick={() => setSelectedJurusan('AKL')}
                        className="mt-auto w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-3 text-[14px] font-bold text-white shadow-sm transition-all duration-200 hover:scale-[1.02]"
                    >
                        Lihat Detail
                    </button>
                    </div>


                    {/* ================= TKRO ================= */}
                    <div className="min-w-[280px] max-w-[280px] min-h-[430px] sm:min-w-[320px] sm:max-w-[320px] bg-white border border-b-4 border-blue-800 rounded-[24px] p-5 shadow-sm snap-start flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:rounded-[28px] sm:p-6">
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
                    <button
                        onClick={() => setSelectedJurusan('TKRO')}
                        className="mt-auto w-full rounded-xl bg-red-600 hover:bg-red-700 px-4 py-3 text-[14px] font-bold text-white shadow-sm transition-all duration-200 hover:scale-[1.02]"
                    >
                        Lihat Detail
                    </button>
                    </div>

                </div>
                </div>
            </div>
            </div>
      
      

      {/* ===== POPUP DETAIL JURUSAN ===== */}
      {selectedJurusan && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
          onClick={() => setSelectedJurusan(null)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[30px] bg-white p-5 shadow-2xl sm:p-8 lg:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol X kanan */}
            <button
              onClick={() => setSelectedJurusan(null)}
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:scale-105 hover:bg-red-50 hover:text-red-500"
              aria-label="Tutup popup"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="pr-12">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[32px]">
                {detailJurusan[selectedJurusan].icon}
              </div>

              <h2 className="text-[28px] font-extrabold text-slate-800 sm:text-[36px]">
                {detailJurusan[selectedJurusan].judul}
              </h2>

              <p className="mt-4 max-w-4xl text-[14px] leading-7 text-slate-600 sm:text-[15px]">
                {detailJurusan[selectedJurusan].tentang}
              </p>
            </div>

            {/* YANG AKAN KAMU PELAJARI */}
            <div className="mt-10">
              <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-blue-500">
                Materi Pembelajaran
              </p>
              <h3 className="mt-1 text-[22px] font-extrabold text-slate-800">
                Yang Akan Kamu Pelajari
              </h3>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {detailJurusan[selectedJurusan].pelajaran.map((item, index) => {
                  const styles = [
                    'border-blue-200 bg-blue-50',
                    'border-purple-200 bg-purple-50',
                    'border-cyan-200 bg-cyan-50',
                    'border-indigo-200 bg-indigo-50',
                    'border-sky-200 bg-sky-50',
                    'border-violet-200 bg-violet-50',
                  ];

                  return (
                    <div
                      key={item.judul}
                      className={`rounded-2xl border p-5 ${styles[index % styles.length]}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[12px] font-extrabold text-blue-600 shadow-sm">
                          {index + 1}
                        </div>

                        <div>
                          <h4 className="text-[15px] font-extrabold text-slate-800">
                            {item.judul}
                          </h4>
                          <p className="mt-2 text-[13px] leading-6 text-slate-600">
                            {item.deskripsi}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* KEGIATAN */}
            <div className="mt-10 rounded-[26px] border border-orange-200 bg-orange-50 p-5 sm:p-7">
              <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-orange-500">
                Aktivitas Belajar
              </p>
              <h3 className="mt-1 text-[22px] font-extrabold text-slate-800">
                Kegiatan yang Akan Kamu Lakukan
              </h3>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {detailJurusan[selectedJurusan].kegiatan.map((item, index) => (
                  <div
                    key={item.judul}
                    className={`rounded-2xl border bg-white p-5 shadow-sm ${
                      index % 2 === 0
                        ? 'border-orange-200'
                        : 'border-amber-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[18px]">
                        {index % 2 === 0 ? '🛠️' : '💡'}
                      </div>

                      <div>
                        <h4 className="text-[15px] font-extrabold text-slate-800">
                          {item.judul}
                        </h4>
                        <p className="mt-2 text-[13px] leading-6 text-slate-600">
                          {item.deskripsi}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COCOK UNTUK KAMU */}
            <div className="mt-8 rounded-[26px] border border-emerald-200 bg-emerald-50 p-5 sm:p-7">
              <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                Kenali Dirimu
              </p>
              <h3 className="mt-1 text-[22px] font-extrabold text-slate-800">
                Cocok untuk Kamu yang...
              </h3>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {detailJurusan[selectedJurusan].cocok.map((item, index) => (
                  <div
                    key={item.judul}
                    className={`rounded-2xl border p-5 ${
                      index % 2 === 0
                        ? 'border-emerald-200 bg-white'
                        : 'border-teal-200 bg-teal-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[12px] font-black text-white">
                        ✓
                      </div>

                      <div>
                        <h4 className="text-[15px] font-extrabold text-slate-800">
                          {item.judul}
                        </h4>
                        <p className="mt-2 text-[13px] leading-6 text-slate-600">
                          {item.deskripsi}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative z-10 mb-16 flex items-center justify-center px-4 py-6 sm:px-6 lg:mb-24 lg:px-8">
      <div className="w-full lg:w-[70%]">

        <div className="
          relative
          overflow-hidden
          rounded-[32px]
          border border-blue-200
          bg-white
          p-4
          shadow-[0_20px_60px_rgba(59,130,246,0.12)]
          sm:p-6
          lg:p-10
        ">

          {/* dekorasi background */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-200/20 blur-3xl" />

          <div className="relative flex min-h-[500px] flex-col-reverse gap-10 lg:flex-row lg:items-start lg:justify-between">

            {/* ================= RIWAYAT ================= */}
            <div className="flex w-full min-w-0 flex-col lg:w-[64%]">

              {/* header riwayat mobile / desktop */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-500">
                    Riwayat Rekomendasi
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Hasil tes yang pernah kamu lakukan
                  </p>
                </div>

                <div className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-bold text-blue-600 shadow-sm">
                  {hasilTestSiswa.length} Tes
                </div>
              </div>

              <div className="
                flex
                max-h-[530px]
                w-full
                flex-col
                gap-4
                overflow-y-auto
                pr-1
                sm:pr-2

                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-track]:bg-blue-50
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-blue-200
              ">
                {hasilTestSiswa.map((hasil: any, index: number) => (
                  <div
                    key={hasil.id || index}
                    className="
                      group
                      rounded-[24px]
                      border border-blue-100
                      bg-white
                      p-4
                      shadow-sm
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-blue-200
                      hover:shadow-lg
                      sm:p-5
                    "
                  >

                    {/* ===== BAGIAN ATAS CARD ===== */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                      {/* kiri */}
                      <div className="flex items-start gap-3 sm:gap-4">

                        <div className="
                          flex
                          h-11 w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          bg-gradient-to-br
                          from-blue-500
                          to-indigo-600
                          text-sm
                          font-extrabold
                          text-white
                          shadow-md
                          shadow-blue-200
                        ">
                          {index + 1}
                        </div>

                        <div className="min-w-0">

                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            Rekomendasi Utama
                          </p>

                          <h4 className="mt-1 text-lg font-extrabold text-slate-900 sm:text-xl">
                            {hasil.rekomendasi_gabungan || '-'}
                          </h4>

                          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">

                            <svg
                              className="h-3.5 w-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3M5 11h14M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                              />
                            </svg>

                            {formatTanggal(hasil.created_at)}
                          </div>
                        </div>
                      </div>

                      {/* badge utama */}
                      <div className="
                        w-fit
                        rounded-full
                        border border-blue-200
                        bg-blue-50
                        px-3
                        py-1.5
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-blue-600
                      ">
                        Hasil Tes
                      </div>
                    </div>


                    {/* ===== HASIL PER ASPEK ===== */}
                    <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">

                      {/* Akademik */}
                      <div className="
                        rounded-2xl
                        border border-blue-100
                        bg-blue-50/80
                        p-3
                        transition
                        group-hover:bg-blue-50
                      ">
                        <div className="mb-2 flex items-center gap-2">

                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
                            <svg
                              className="h-4 w-4 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13"
                              />
                            </svg>
                          </div>

                          <p className="text-[10px] font-bold uppercase tracking-wide text-blue-500">
                            Akademik
                          </p>
                        </div>

                        <p className="truncate text-sm font-extrabold text-blue-900">
                          {hasil.rekomendasi_akademik || '-'}
                        </p>
                      </div>


                      {/* RIASEC */}
                      <div className="
                        rounded-2xl
                        border border-purple-100
                        bg-purple-50/80
                        p-3
                        transition
                        group-hover:bg-purple-50
                      ">
                        <div className="mb-2 flex items-center gap-2">

                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
                            <svg
                              className="h-4 w-4 text-purple-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m6-4a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                          </div>

                          <p className="text-[10px] font-bold uppercase tracking-wide text-purple-500">
                            RIASEC
                          </p>
                        </div>

                        <p className="truncate text-sm font-extrabold text-purple-900">
                          {hasil.rekomendasi_riasec || '-'}
                        </p>
                      </div>


                      {/* Bakat */}
                      <div className="
                        rounded-2xl
                        border border-emerald-100
                        bg-emerald-50/80
                        p-3
                        transition
                        group-hover:bg-emerald-50
                      ">
                        <div className="mb-2 flex items-center gap-2">

                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
                            <svg
                              className="h-4 w-4 text-emerald-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.663 17h4.674M12 3a6 6 0 00-3.6 10.8A3 3 0 019.6 16h4.8a3 3 0 011.2-2.2A6 6 0 0012 3z"
                              />
                            </svg>
                          </div>

                          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-500">
                            Bakat
                          </p>
                        </div>

                        <p className="truncate text-sm font-extrabold text-emerald-900">
                          {hasil.rekomendasi_bakat || '-'}
                        </p>
                      </div>
                    </div>


                    {/* ===== BUTTON ===== */}
                    <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">

                      <button
                        onClick={() => handleDownloadPdf(hasil)}
                        className="
                          flex
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-gradient-to-r
                          from-red-500
                          to-rose-600
                          px-5
                          py-2.5
                          text-xs
                          font-extrabold
                          text-white
                          shadow-md
                          shadow-red-100
                          transition-all
                          duration-200
                          hover:scale-[1.02]
                          hover:shadow-lg
                          sm:w-auto
                          sm:text-sm
                        "
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14"
                          />
                        </svg>

                        Download PDF
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>


            {/* ================= BAGIAN KANAN ================= */}
            <div className="
              flex
              w-full
              flex-col
              items-center
              text-center
              lg:w-[30%]
              lg:items-start
              lg:pt-5
              lg:text-left
            ">

              {/* icon */}
              <div className="
                mb-5
                flex
                h-16 w-16
                items-center
                justify-center
                rounded-[20px]
                bg-gradient-to-br
                from-blue-500
                to-indigo-600
                shadow-lg
                shadow-blue-200
              ">
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6M9 8h6m2 13H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              <p className="
                mb-3
                w-fit
                rounded-full
                border border-blue-200
                bg-blue-100
                px-5
                py-2
                text-sm
                font-semibold
                text-blue-600
              ">
                Riwayat Tes
              </p>

              <h2 className="
                mb-4
                max-w-md
                text-[28px]
                font-extrabold
                leading-[1.15]
                text-slate-800
                sm:text-[32px]
                lg:max-w-[320px]
              ">
                Cek Kembali
                <span className="text-blue-600"> Hasil Tesmu</span>
              </h2>

              <p className="
                max-w-md
                text-sm
                leading-7
                text-slate-500
                sm:text-[15px]
                lg:max-w-[320px]
              ">
                Lihat kembali hasil tes dan rekomendasi jurusan yang pernah
                kamu dapatkan. Kamu juga bisa mengunduh hasilnya dalam bentuk
                PDF agar mudah disimpan.
              </p>


              {/* info kecil */}
              <div className="mt-7 w-full space-y-3">

                <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-white/70 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    ✓
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      Hasil Tersimpan
                    </p>

                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                      Semua hasil tesmu dapat dilihat kembali kapan saja.
                    </p>
                  </div>
                </div>


                <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-white/70 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500">
                    ↓
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      Unduh PDF
                    </p>

                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                      Simpan hasil rekomendasimu dalam bentuk dokumen PDF.
                    </p>
                  </div>
                </div>

              </div>

            </div>

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