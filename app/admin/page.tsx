"use client"
import AdminPage from '@/components/page/adminPage'
import { useRouter } from 'next/navigation'
import React from 'react'

const Page = () => {
  const router = useRouter()
  return (
    <AdminPage 
      onLogout ={() => router.push('/')} 
    />
  )
}

export default Page