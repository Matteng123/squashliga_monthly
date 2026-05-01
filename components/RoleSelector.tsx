'use client'

import useAppStore from '@/lib/store'
import { de } from '@/lib/i18n'

export default function RoleSelector() {
  const setCurrentUser = useAppStore(s => s.setCurrentUser)
  const users = useAppStore(s => s.users)

  const players = users.filter(u => u.role === 'player')
  const admin = users.find(u => u.role === 'admin')

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">{de.roleSelector.title}</h1>
          <p className="text-slate-400">{de.roleSelector.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Player Section */}
          <div className="card border-2 border-slate-700">
            <h2 className="text-2xl font-bold mb-6 text-emerald-400">{de.roleSelector.playerTitle}</h2>
            <div className="space-y-2 mb-6">
              {users.filter(u => u.role === 'player').map(player => (
                <button
                  key={player.id}
                  onClick={() => setCurrentUser(player.id)}
                  className="btn-secondary w-full text-left"
                >
                  {player.name}
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-400">{de.roleSelector.playerSubtitle}</p>
          </div>

          {/* Admin Section */}
          <div className="card border-2 border-slate-700">
            <h2 className="text-2xl font-bold mb-6 text-orange-400">{de.roleSelector.adminTitle}</h2>
            {users.find(u => u.role === 'admin') && (
              <button
                onClick={() => {
                  const admin = users.find(u => u.role === 'admin')
                  if (admin) {
                    setCurrentUser(admin.id)
                  }
                }}
                className="btn-secondary w-full mb-6"
              >
                {users.find(u => u.role === 'admin')?.name}
              </button>
            )}
            <p className="text-sm text-slate-400">{de.roleSelector.adminSubtitle}</p>
          </div>
        </div>

        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>{de.header.noRealAuth}</p>
        </div>
      </div>
    </div>
  )
}
