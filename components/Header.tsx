'use client'

import useAppStore from '@/lib/store'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/dateUtils'
import { Mail } from 'lucide-react'

export default function Header() {
  const currentUser = useAppStore(s => s.currentUser)
  const currentDate = useAppStore(s => s.currentDate)
  const mailCount = useAppStore(s => s.recentMail.length)
  const setCurrentUser = useAppStore(s => s.setCurrentUser)
  const router = useRouter()

  const handleLogout = () => {
    setCurrentUser(null)
    router.push('/')
  }

  if (!currentUser) return null

  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-4">
            <Link href={currentUser.role === 'player' ? '/player' : '/admin'} className="text-lg font-bold">
              🏸 Squash League
            </Link>
            <div className="text-sm text-slate-400">
              {currentUser.name} <span className="text-slate-500">({currentUser.role})</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-400 text-right">
              <div>Today: {formatDate(currentDate)}</div>
            </div>

            <Link
              href="/mail"
              className="relative p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Mail Center"
            >
              <Mail size={20} />
              {mailCount > 0 && (
                <span className="absolute top-0 right-0 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {mailCount}
                </span>
              )}
            </Link>

            <button
              onClick={handleLogout}
              className="btn-secondary text-sm"
            >
              Switch Role
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
