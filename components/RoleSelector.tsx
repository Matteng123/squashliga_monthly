'use client'

import useAppStore from '@/lib/store'
import { useRouter } from 'next/navigation'

export default function RoleSelector() {
  const setCurrentUser = useAppStore(s => s.setCurrentUser)
  const users = useAppStore(s => s.users)
  const router = useRouter()

  const handleSelectRole = (userId: string) => {
    setCurrentUser(userId)
    const user = users.find(u => u.id === userId)
    if (user?.role === 'player') {
      router.push('/player')
    } else {
      router.push('/admin')
    }
  }

  const players = users.filter(u => u.role === 'player')
  const admin = users.find(u => u.role === 'admin')

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">🏸 Squash League</h1>
          <p className="text-slate-400">Monthly casual league management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Player Section */}
          <div className="card border-2 border-slate-700">
            <h2 className="text-2xl font-bold mb-6 text-emerald-400">Player</h2>
            <div className="space-y-2 mb-6">
              {players.map(player => (
                <button
                  key={player.id}
                  onClick={() => handleSelectRole(player.id)}
                  className="btn-secondary w-full text-left"
                >
                  {player.name}
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-400">Join play days • Track costs • View schedule</p>
          </div>

          {/* Admin Section */}
          <div className="card border-2 border-slate-700">
            <h2 className="text-2xl font-bold mb-6 text-orange-400">Admin</h2>
            {admin && (
              <button
                onClick={() => handleSelectRole(admin.id)}
                className="btn-secondary w-full mb-6"
              >
                {admin.name}
              </button>
            )}
            <p className="text-sm text-slate-400">Configure league • View participation • Review emails</p>
          </div>
        </div>

        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>This is a prototype. No real authentication or data persistence.</p>
        </div>
      </div>
    </div>
  )
}
