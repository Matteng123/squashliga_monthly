'use client'

import useAppStore from '@/lib/store'
import MailItem from './MailItem'
import { Mail as MailIcon } from 'lucide-react'

export default function MailCenter() {
  const recentMail = useAppStore(s => s.recentMail)

  return (
    <div className="space-y-4">
      {recentMail.length === 0 ? (
        <div className="card text-center py-12">
          <MailIcon size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">No emails yet.</p>
          <p className="text-xs text-slate-500 mt-2">Emails appear here as the system generates them.</p>
        </div>
      ) : (
        recentMail.map(mail => <MailItem key={mail.id} mail={mail} />)
      )}
    </div>
  )
}
