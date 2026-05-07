import { DaftarPageType } from '@/type/daftarPageType'
import React, { useState } from 'react'

const DaftarPage = ({ click }: any) => {
    const [nama, setNama] = useState('')
    const [sekolah, setSekolah] = useState('')
    const [kelas, setKelas] = useState('')
    const [usia, setUsia] = useState<string | number>("")
    const [kelamin, setKelamin] = useState('pria')
    return (
      <div className='w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100'>
  <div className='flex flex-col justify-center items-center w-[320px] bg-white p-6 rounded-2xl shadow-md'>

    <p className='font-semibold text-[22px] text-slate-700'>Data Diri</p>
    <p className='mb-6 text-slate-500 text-sm'>Isi data diri anda</p>

    {/* Input */}
    <p className='mb-1 w-full text-sm'>Nama Lengkap</p>
    <input
      type="text"
      value={nama}
      onChange={(e) => setNama(e.target.value)}
      className='w-full border border-slate-200 rounded-lg p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-200'
    />

    <p className='mb-1 w-full text-sm'>Kelas</p>
    <input
      type="text"
      value={kelas}
      onChange={(e) => setKelas(e.target.value)}
      className='w-full border border-slate-200 rounded-lg p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-200'
    />

    <p className='mb-1 w-full text-sm'>Usia</p>
    <input
      type="number"
      value={usia}
      onChange={(e) => setUsia(Number(e.target.value))}
      className='w-full border border-slate-200 rounded-lg p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-200'
    />

    {/* Gender */}
    <p className='mb-2 w-full text-sm'>Jenis Kelamin</p>
    <div className='w-full flex gap-2'>
      <button
        onClick={() => setKelamin('pria')}
        className={`flex-1 p-2 rounded-lg text-sm transition-all
        ${kelamin === 'pria'
          ? 'bg-indigo-200 text-indigo-800'
          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
        }`}
      >
        Pria
      </button>

      <button
        onClick={() => setKelamin('wanita')}
        className={`flex-1 p-2 rounded-lg text-sm transition-all
        ${kelamin === 'wanita'
          ? 'bg-pink-200 text-pink-800'
          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
        }`}
      >
        Wanita
      </button>
    </div>

    {/* Submit */}
    <button
      onClick={click}
      className='w-full p-3 rounded-lg mt-6 font-medium bg-indigo-300 text-indigo-900 hover:bg-indigo-400 transition-all'
    >
      Submit
    </button>

  </div>
</div>
    )
}

export default DaftarPage