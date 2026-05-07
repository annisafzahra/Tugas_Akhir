// 'use client'

// import { useState } from 'react'
// import LoginPage from '@/components/page/loginPage'
// import RegisterPage from '@/components/page/registerPage'
// import SoalPage from '@/components/page/soalPage'

// export default function Home() {
//   const [page, setPage] = useState<'login' | 'register' | 'soal'>('login')
 
//   return (
//     <>
//       {page === 'login' && (
//         <LoginPage
//           goRegister={() => setPage('register')}
//           onLogin={() => setPage('soal')}
//         />
//       )}

//       {page === 'register' && (
//         <RegisterPage
//           goLogin={() => setPage('login')}
//           afterRegister={() => setPage('soal')} // langsung ke soal 
//         />
//       )}
      
//       {page === 'soal' && <SoalPage />}
//     </>
//   )
// }

'use client'

import { useState } from 'react'
import LoginPage from '@/components/page/loginPage'
import RegisterPage from '@/components/page/registerPage'
import SoalPage from '@/components/page/soalPage'
import HasilPage from '@/components/page/hasilPage'
import AdminPage from '@/components/page/adminPage'

export default function Home() {
  const [page, setPage] = useState<'login' | 'register' | 'soal' | 'hasil' | 'admin'>('login')

  const [hasil, setHasil] = useState<any>(null)

  return (
    <>
      {page === 'login' && (
        <LoginPage
          goRegister={() => setPage('register')}
          onLogin={() => setPage('soal')}
          onAdminLogin={() => setPage('admin')}
        />
      )}

      {page === 'register' && (
        <RegisterPage
          goLogin={() => setPage('login')}
          afterRegister={() => setPage('soal')}
        />
      )}
      
      {page === 'soal' && (
        <SoalPage
          onFinish={(data: any) => {
            setHasil(data)
            setPage('hasil')
          }}
        />
      )}

      {page === 'hasil' && hasil && (
        <HasilPage data={hasil} />
      )}
      
      {page === 'admin' && (
        <AdminPage />
      )}
    </>
  )
}