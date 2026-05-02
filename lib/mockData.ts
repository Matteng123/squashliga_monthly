import { User, LeagueSettings } from './types'

export const MOCK_USERS: User[] = [
  { id: 'admin-1', name: 'Admin User', email: 'admin@squash.local', role: 'admin' },
  { id: 'player-1', name: 'Mike Coxlong', email: 'mike@squash.local', role: 'player' },
  { id: 'player-2', name: 'Justin Herhole', email: 'justin@squash.local', role: 'player' },
  { id: 'player-3', name: 'Jack Mehoff', email: 'jack@squash.local', role: 'player' },
  { id: 'player-4', name: 'Ben Dover', email: 'ben@squash.local', role: 'player' },
  { id: 'player-5', name: 'Hugh Janus', email: 'hugh@squash.local', role: 'player' },
  { id: 'player-6', name: 'Seymour Butts', email: 'seymour@squash.local', role: 'player' },
]

export const DEFAULT_LEAGUE_SETTINGS: LeagueSettings = {
  playDays: ['Monday', 'Thursday'],
  playDayTimes: {
    Monday: '20:00 – 22:00',
    Tuesday: '20:00 – 22:00',
    Wednesday: '20:00 – 22:00',
    Thursday: '20:00 – 22:00',
    Friday: '20:00 – 22:00',
    Saturday: '20:00 – 22:00',
    Sunday: '20:00 – 22:00',
  },
  playersPerCourt: 4,
  minimumPlayers: 2,
  monthlyDeadline: 30,
  reminderDay: 25,
  bankAccountName: 'Squash Liga e.V.',
  bankAccountIBAN: 'DE89370400440532013000',
  paypalLink: 'https://paypal.me/squashliga',
}
