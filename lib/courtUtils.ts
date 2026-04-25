export function calculateCourtsRequired(playerCount: number, playersPerCourt: number): number {
  if (playerCount === 0) return 0
  return Math.ceil(playerCount / playersPerCourt)
}
