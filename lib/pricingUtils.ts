const BASE_FEE = 20 // € - only if gamesJoined > 0
const PER_GAME_FEE = 5 // €

export function calculateCost(gamesJoined: number): number {
  if (gamesJoined === 0) return 0
  return BASE_FEE + gamesJoined * PER_GAME_FEE
}

export function calculateBreakdown(gamesJoined: number): {
  baseFee: number
  perGameFee: number
  total: number
} {
  const baseFee = gamesJoined > 0 ? BASE_FEE : 0
  return {
    baseFee,
    perGameFee: gamesJoined * PER_GAME_FEE,
    total: calculateCost(gamesJoined),
  }
}

export function formatPrice(price: number): string {
  return `€${price.toFixed(2)}`
}
