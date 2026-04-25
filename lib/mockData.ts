import { User, LeagueSettings } from './types'

export const MOCK_USERS: User[] = [
  { id: 'admin-1', name: 'Admin User', email: 'admin@squash.local', role: 'admin' },
  { id: 'player-1', name: 'Alice Johnson', email: 'alice@squash.local', role: 'player' },
  { id: 'player-2', name: 'Bob Smith', email: 'bob@squash.local', role: 'player' },
  { id: 'player-3', name: 'Charlie Brown', email: 'charlie@squash.local', role: 'player' },
  { id: 'player-4', name: 'Diana Prince', email: 'diana@squash.local', role: 'player' },
  { id: 'player-5', name: 'Edward Norton', email: 'edward@squash.local', role: 'player' },
  { id: 'player-6', name: 'Fiona Green', email: 'fiona@squash.local', role: 'player' },
]

export const DEFAULT_LEAGUE_SETTINGS: LeagueSettings = {
  playDays: ['Monday', 'Thursday'],
  playersPerCourt: 4,
  monthlyDeadline: 30,
  reminderDay: 25,
}
