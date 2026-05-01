'use client'

import useAppStore from '@/lib/store'
import { formatDate } from '@/lib/dateUtils'
import { Mail } from 'lucide-react'
import { de } from '@/lib/i18n'

interface HeaderProps {
  onMailClick?: () => void
}

export default function Header({ onMailClick }: HeaderProps) {
  const currentUser = useAppStore(s => s.currentUser)
  const currentDate = useAppStore(s => s.currentDate)
  const mailCount = useAppStore(s => s.recentMail.length)
  const setCurrentUser = useAppStore(s => s.setCurrentUser)

  const handleLogout = () => {
    setCurrentUser(null)
  }

  if (!currentUser) return null

  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentUser(null)} className="text-lg font-bold hover:opacity-80">
              {de.header.title}
            </button>
            <div className="text-sm text-slate-400">
              {currentUser.name} <span className="text-slate-500">({currentUser.role === 'player' ? de.common.player : de.common.admin})</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-400 text-right">
              <div>{de.common.today}: {formatDate(currentDate)}</div>
            </div>

            <button
              onClick={onMailClick}
              className="relative p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title={de.header.mailCenter}
            >
              <Mail size={20} />
              {mailCount > 0 && (
                <span className="absolute top-0 right-0 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {mailCount}
                </span>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="btn-secondary text-sm"
            >
              {de.common.switchRole}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
