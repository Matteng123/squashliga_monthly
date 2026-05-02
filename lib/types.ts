export type Role = 'player' | 'admin'
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
export type PlayDayStatus = 'open' | 'locked'
export type MonthStatus = 'active' | 'archived' | 'completed'
export type EmailType = 'reminder' | 'admin_summary' | 'booking' | 'payment_reminder' | 'payment_confirmation'
export type PaymentMethod = 'bank_transfer' | 'paypal'
export type MonthPlayerStatus = 'open' | 'editing' | 'committed' | 'payment_submitted' | 'confirmed' | 'unpaid'

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export interface LeagueSettings {
  playDays: DayOfWeek[]
  playDayTimes: Partial<Record<DayOfWeek, string>>
  playersPerCourt: number
  monthlyDeadline: number
  reminderDay: number
  bankAccountName: string
  bankAccountIBAN: string
  paypalLink: string
}

export interface PlayDay {
  id: string
  date: Date
  dayOfWeek: DayOfWeek
  time: string
  playersJoined: string[]
  status: PlayDayStatus
  courtsRequired: number
}

export interface PlayerMonthPayment {
  playerId: string
  status: MonthPlayerStatus
  costAmount: number
  paymentMethod?: PaymentMethod
  paymentRecordedAt?: Date
  paymentConfirmedAt?: Date
}

export interface Month {
  id: string
  year: number
  month: number
  playDays: PlayDay[]
  playerStatus: Map<string, PlayerMonthPayment>
  status: MonthStatus
  deadlineDate: Date
  reminderDate: Date
  commitmentDeadline: Date
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
