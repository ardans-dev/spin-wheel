import { describe, expect, it } from 'vitest'
import { randomInt, randomIntInclusive, selectRandomWinner, shuffleParticipants } from './random'
import type { Participant } from '../types'

const entries: Participant[] = [
  { id: 'one', name: 'Satu' },
  { id: 'two', name: 'Dua' },
  { id: 'three', name: 'Tiga' },
]

describe('random utilities', () => {
  it('menghasilkan integer di dalam batas yang diminta', () => {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      expect(randomInt(3)).toBeGreaterThanOrEqual(0)
      expect(randomInt(3)).toBeLessThan(3)
      expect(randomIntInclusive(2, 4)).toBeGreaterThanOrEqual(2)
      expect(randomIntInclusive(2, 4)).toBeLessThanOrEqual(4)
    }
  })

  it('menangani batas random yang tidak valid tanpa melempar error', () => {
    expect(randomInt(0)).toBe(0)
    expect(randomInt(-1)).toBe(0)
    expect(randomInt(1.5)).toBe(0)
    expect(selectRandomWinner([])).toBe(-1)
  })

  it('selalu memilih index winner yang ada', () => {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const index = selectRandomWinner(entries)
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(entries.length)
    }
  })

  it('shuffle mempertahankan semua peserta tepat satu kali', () => {
    const shuffled = shuffleParticipants(entries)
    expect(shuffled).toHaveLength(entries.length)
    expect(new Set(shuffled.map((entry) => entry.id))).toEqual(new Set(entries.map((entry) => entry.id)))
    expect(shuffled).not.toBe(entries)
    expect(shuffleParticipants([])).toEqual([])
  })
})
