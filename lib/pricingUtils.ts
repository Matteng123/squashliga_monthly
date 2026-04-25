const BASE_FEE = 20 // €
const PER_GAME_FEE = 5 // €

export function calculateCost(gamesJoined: number): number {
  return BASE_FEE + gamesJoined * PER_GAME_FEE
}

export function calculateBreakdown(gamesJoined: number): {
  baseFee: number
  perGameFee: number
  total: number
} {
  return {
    baseFee: BASE_FEE,
    perGameFee: gamesJoined * PER_GAME_FEE,
    total: calculateCost(gamesJoined),
  }
}

export function formatPrice(price: number): string {
  return `€${price.toFixed(2)}`
}
