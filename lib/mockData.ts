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
  playersPerCourt: 4,
  monthlyDeadline: 30,
  reminderDay: 25,
  bankAccountName: 'Squash Liga e.V.',
  bankAccountIBAN: 'DE89370400440532013000',
  paypalLink: 'https://paypal.me/squashliga',
}
