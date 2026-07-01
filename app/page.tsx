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
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter();
  const [page, setPage] = useState<'login' | 'register'>('login')

  return (
    <>
      {page === 'login' && (
        <LoginPage
          goRegister={() => setPage('register')}
          onLogin={() => router.push('/soal')}
          onAdminLogin={() => router.push('/admin')}
        />
      )}

      {page === 'register' && (
        <RegisterPage
          goLogin={() => setPage('login')}
          afterRegister={() => router.push('/soal')}
        />
      )}
      
    </>
  )
}