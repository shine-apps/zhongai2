import { describe, it, expect } from 'vitest'

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const phi1 = toRad(lat1)
  const phi2 = toRad(lat2)
  const deltaPhi = toRad(lat2 - lat1)
  const deltaLambda = toRad(lon2 - lon1)
  const a = Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

describe('Haversine distance calculation', () => {
  it('should return 0 for same coordinates', () => {
    expect(calculateDistance(39.9042, 116.4074, 39.9042, 116.4074)).toBeCloseTo(0, 0)
  })

  it('should calculate distance between Beijing and Shanghai correctly (~1068km)', () => {
    const distance = calculateDistance(39.9042, 116.4074, 31.2304, 121.4737)
    expect(distance).toBeGreaterThan(1_000_000)
    expect(distance).toBeLessThan(1_200_000)
  })

  it('should calculate short distance correctly', () => {
    const distance = calculateDistance(39.9042, 116.4074, 39.9072, 116.4074)
    expect(distance).toBeGreaterThan(200)
    expect(distance).toBeLessThan(400)
  })

  it('should be symmetric', () => {
    const d1 = calculateDistance(39.9042, 116.4074, 31.2304, 121.4737)
    const d2 = calculateDistance(31.2304, 121.4737, 39.9042, 116.4074)
    expect(d1).toBeCloseTo(d2, 0)
  })

  it('should handle equator crossing', () => {
    const distance = calculateDistance(1, 0, -1, 0)
    expect(distance).toBeGreaterThan(200_000)
    expect(distance).toBeLessThan(230_000)
  })

  it('should handle antipodal points approximately', () => {
    const distance = calculateDistance(0, 0, 0, 180)
    expect(distance).toBeGreaterThan(19_000_000)
    expect(distance).toBeLessThan(21_000_000)
  })
})
