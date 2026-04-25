export type Role = 'player' | 'admin'
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
export type PlayDayStatus = 'open' | 'locked'
export type MonthStatus = 'active' | 'archived'
export type EmailType = 'reminder' | 'admin_summary' | 'booking'

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export interface LeagueSettings {
  playDays: DayOfWeek[]
  playersPerCourt: number
  monthlyDeadline: number
  reminderDay: number
}

export interface PlayDay {
  id: string
  date: Date
  dayOfWeek: DayOfWeek
  playersJoined: string[]
  status: PlayDayStatus
  courtsRequired: number
}

export interface Month {
  id: string
  year: number
  month: number
  playDays: PlayDay[]
  status: MonthStatus
  deadlineDate: Date
  reminderDate: Date
}

export interface Mail {
  id: string
  timestamp: Date
  recipient: string
  subject: string
  content: string
  type: EmailType
  monthId?: string
}

export interface AppState {
  users: User[]
  currentDate: Date
  leagueSettings: LeagueSettings
  months: Month[]
  mail: Mail[]
  currentUserId: string | null
  currentUser: User | null
  emailsSentThisMonth: { [key: string]: boolean }
}
