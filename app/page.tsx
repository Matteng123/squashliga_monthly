'use client'

import { useEffect } from 'react'
import useAppStore from '@/lib/store'
import RoleSelector from '@/components/RoleSelector'
import { useRouter } from 'next/navigation'

export default function Home() {
  const currentUser = useAppStore(s => s.currentUser)
  const initApp = useAppStore(s => s.initApp)
  const router = useRouter()

  useEffect(() => {
    initApp()

    if (currentUser) {
      if (currentUser.role === 'player') {
        router.push('/player')
      } else {
        router.push('/admin')
      }
    }
  }, [currentUser, router, initApp])

  return <RoleSelector />
}
