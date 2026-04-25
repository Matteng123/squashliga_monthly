'use client'

import { Mail as MailType } from '@/lib/types'
import useAppStore from '@/lib/store'
import { formatDate } from '@/lib/dateUtils'
import { Trash2 } from 'lucide-react'

interface Props {
  mail: MailType
}

export default function MailItem({ mail }: Props) {
  const markMailAsRead = useAppStore(s => s.markMailAsRead)
  const users = useAppStore(s => s.users)

  const recipientName =
    mail.recipient === 'admin'
      ? 'Admin'
      : users.find(u => u.id === mail.recipient)?.name || 'Unknown'

  const typeLabels: { [key: string]: string } = {
    reminder: '📬 Reminder',
    admin_summary: '📊 Summary',
    booking: '🎫 Booking',
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
              {typeLabels[mail.type]}
            </span>
            <span className="text-xs text-slate-500">to {recipientName}</span>
          </div>
          <h3 className="font-semibold text-white text-sm leading-snug pr-4">{mail.subject}</h3>
        </div>

        <button
          onClick={() => markMailAsRead(mail.id)}
          className="text-slate-500 hover:text-slate-300 flex-shrink-0"
          title="Archive"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <p className="text-xs text-slate-500 mb-3">{formatDate(mail.timestamp)}</p>

      <div className="bg-slate-900 rounded p-3 border border-slate-700">
        <p className="text-sm text-slate-300 whitespace-pre-wrap font-mono text-xs leading-relaxed">
          {mail.content}
        </p>
      </div>
    </div>
  )
}
