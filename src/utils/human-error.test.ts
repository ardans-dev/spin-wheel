import { describe, expect, it } from 'vitest'
import { calculateGroupSizes, generateGroups } from './groups'
import { calculateWheelRotation } from './wheel'
import { randomIntInclusive, selectRandomWinner } from './random'
import type { Participant } from '../types'

// Helper mirroring useParticipants normalization and delimiter splitting
function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

function parseMultipleNames(rawValue: string): string[] {
  const rawList = rawValue
    .split(/[\n,;]+/)
    .map(normalizeName)
    .filter(Boolean)

  const seen = new Set<string>()
  const uniqueList: string[] = []

  for (const name of rawList) {
    const key = name.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      uniqueList.push(name)
    }
  }

  return uniqueList
}

const mockParticipants = (count: number): Participant[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `id-${index + 1}`,
    name: `Peserta ${index + 1}`,
  }))

describe('Human Error & Edge Case Resilience', () => {
  describe('1. Input Parsing & Typos Handling', () => {
    it('menangani input kosong atau hanya spasi/newline/tab', () => {
      expect(normalizeName('')).toBe('')
      expect(normalizeName('   ')).toBe('')
      expect(normalizeName('\n\t  \r')).toBe('')
      expect(parseMultipleNames('')).toEqual([])
      expect(parseMultipleNames('   \n\n\t  ')).toEqual([])
    })

    it('membersihkan spasi ganda dan spasi di awal/akhir nama', () => {
      expect(normalizeName('   Ahmad   Yardan    Rasika  ')).toBe('Ahmad Yardan Rasika')
      expect(normalizeName('Budi      Santoso')).toBe('Budi Santoso')
    })

    it('memproses campuran delimiter tidak teratur (koma, titik koma, baris baru ganda)', () => {
      const dirtyInput = 'Andi,, Budi;;;Citra\n\nDewi,  ,Eko;;'
      const parsed = parseMultipleNames(dirtyInput)
      expect(parsed).toEqual(['Andi', 'Budi', 'Citra', 'Dewi', 'Eko'])
      expect(parsed).toHaveLength(5)
    })

    it('mencegah duplikasi nama baik case-sensitive maupun dengan perbedaan spasi', () => {
      const duplicateInput = 'Andi, andi, ANDI,   aNdI  , Budi, BUDI'
      const parsed = parseMultipleNames(duplicateInput)
      expect(parsed).toEqual(['Andi', 'Budi'])
    })

    it('menangani nama dengan karakter khusus, unicode, emoji, dan angka', () => {
      const specialInput = '🤖 Robot AI, User #102, Citra_99, Budi-Santoso, "Dewi"'
      const parsed = parseMultipleNames(specialInput)
      expect(parsed).toHaveLength(5)
      expect(parsed).toContain('🤖 Robot AI')
      expect(parsed).toContain('User #102')
    })

    it('menangani payload potensi XSS atau injection secara aman sebagai string biasa', () => {
      const xssInput = "<script>alert('xss')</script>, <img src=x onerror=alert(1)>, DROP TABLE users"
      const parsed = parseMultipleNames(xssInput)
      expect(parsed).toHaveLength(3)
      expect(parsed[0]).toBe("<script>alert('xss')</script>")
      expect(parsed[1]).toBe('<img src=x onerror=alert(1)>')
      expect(parsed[2]).toBe('DROP TABLE users')
    })

    it('menangani nama yang sangat panjang tanpa crash', () => {
      const veryLongName = 'A'.repeat(500)
      expect(normalizeName(veryLongName)).toBe(veryLongName)
      expect(parseMultipleNames(veryLongName)).toEqual([veryLongName])
    })
  })

  describe('2. Wheel Rotation & Winner Calculation Edge Cases', () => {
    it('menghitung rotasi dengan jumlah peserta minimum (2 peserta)', () => {
      const rot = calculateWheelRotation(0, 2, 0, 5)
      expect(Number.isFinite(rot)).toBe(true)
      expect(rot).toBeGreaterThan(0)

      const rotWinner1 = calculateWheelRotation(1, 2, 0, 5)
      expect(Number.isFinite(rotWinner1)).toBe(true)
      expect(rotWinner1).not.toBe(rot)
    })

    it('menghitung rotasi untuk jumlah peserta besar (50 peserta)', () => {
      for (let winner = 0; winner < 50; winner += 10) {
        const rot = calculateWheelRotation(winner, 50, 0, 6)
        expect(Number.isFinite(rot)).toBe(true)
        expect(rot).toBeGreaterThan(0)
      }
    })

    it('menjaga rotasi terus maju dan bertambah secara kontinu pada spin beruntun', () => {
      let currentRotation = 0
      for (let spin = 1; spin <= 10; spin++) {
        const winnerIndex = spin % 4
        const nextRotation = calculateWheelRotation(winnerIndex, 4, currentRotation, 5)
        expect(nextRotation).toBeGreaterThan(currentRotation)
        currentRotation = nextRotation
      }
    })

    it('memastikan selectRandomWinner selalu menghasilkan index yang valid', () => {
      const participants = mockParticipants(7)
      for (let i = 0; i < 100; i++) {
        const winnerIndex = selectRandomWinner(participants)
        expect(winnerIndex).toBeGreaterThanOrEqual(0)
        expect(winnerIndex).toBeLessThan(7)
      }
    })

    it('memastikan distribusi acak adil (fairness distribution test) pada 1000 iterasi', () => {
      const participants = mockParticipants(4)
      const counts = [0, 0, 0, 0]

      for (let i = 0; i < 1000; i++) {
        const winner = selectRandomWinner(participants)
        counts[winner]++
      }

      // Setiap peserta idealnya ~250 kali (25%). Batas toleransi wajar: 15% - 35% (150 - 350)
      for (const count of counts) {
        expect(count).toBeGreaterThan(150)
        expect(count).toBeLessThan(350)
      }
    })

    it('randomIntInclusive selalu menghasilkan nilai dalam rentang min dan max', () => {
      for (let i = 0; i < 50; i++) {
        const val = randomIntInclusive(5, 7)
        expect([5, 6, 7]).toContain(val)
      }
    })
  })

  describe('3. Group Division Edge Cases & Human Misconfiguration', () => {
    it('menolak nilai kelompok <= 0, desimal, NaN, dan Infinity', () => {
      expect(calculateGroupSizes(10, 'groupCount', 0)).toEqual([])
      expect(calculateGroupSizes(10, 'groupCount', -5)).toEqual([])
      expect(calculateGroupSizes(10, 'groupCount', 2.3)).toEqual([])
      expect(calculateGroupSizes(10, 'groupCount', Number.NaN)).toEqual([])
      expect(calculateGroupSizes(10, 'groupCount', Number.POSITIVE_INFINITY)).toEqual([])

      expect(calculateGroupSizes(10, 'membersPerGroup', 0)).toEqual([])
      expect(calculateGroupSizes(10, 'membersPerGroup', -2)).toEqual([])
      expect(calculateGroupSizes(10, 'membersPerGroup', 1.5)).toEqual([])
    })

    it('menolak jika jumlah kelompok diminta melebihi jumlah peserta', () => {
      expect(calculateGroupSizes(3, 'groupCount', 5)).toEqual([])
      expect(generateGroups(mockParticipants(3), 'groupCount', 5)).toHaveLength(0)
    })

    it('menangani kasus ekstrim 1 kelompok untuk banyak peserta', () => {
      const sizes = calculateGroupSizes(50, 'groupCount', 1)
      expect(sizes).toEqual([50])
      const groups = generateGroups(mockParticipants(50), 'groupCount', 1)
      expect(groups).toHaveLength(1)
      expect(groups[0].members).toHaveLength(50)
    })

    it('menangani kasus batas jumlah kelompok sama persis dengan jumlah peserta', () => {
      const sizes = calculateGroupSizes(6, 'groupCount', 6)
      expect(sizes).toEqual([1, 1, 1, 1, 1, 1])
      const groups = generateGroups(mockParticipants(6), 'groupCount', 6)
      expect(groups).toHaveLength(6)
      groups.forEach((g) => expect(g.members).toHaveLength(1))
    })

    it('menangani pembagian ganjil tak merata tanpa kehilangan peserta (misal: 17 peserta ke 5 kelompok)', () => {
      const sizes = calculateGroupSizes(17, 'groupCount', 5)
      expect(sizes).toEqual([4, 4, 3, 3, 3])
      expect(sizes.reduce((a, b) => a + b, 0)).toBe(17)

      const groups = generateGroups(mockParticipants(17), 'groupCount', 5)
      const allMembers = groups.flatMap((g) => g.members)
      expect(allMembers).toHaveLength(17)

      const uniqueIds = new Set(allMembers.map((m) => m.id))
      expect(uniqueIds.size).toBe(17)
    })

    it('menangani pembagian 23 peserta dengan target 4 anggota per kelompok', () => {
      // 23 peserta dibagi ~4 anggota = 6 kelompok (4, 4, 4, 4, 4, 3)
      const sizes = calculateGroupSizes(23, 'membersPerGroup', 4)
      expect(sizes.reduce((a, b) => a + b, 0)).toBe(23)
      expect(sizes).toEqual([4, 4, 4, 4, 4, 3])

      const groups = generateGroups(mockParticipants(23), 'membersPerGroup', 4)
      expect(groups.flatMap((g) => g.members)).toHaveLength(23)
    })

    it('menangani kasus stress test 100 peserta ke 13 kelompok dengan sempurna', () => {
      const participants = mockParticipants(100)
      const groups = generateGroups(participants, 'groupCount', 13)

      expect(groups).toHaveLength(13)
      const memberIds = groups.flatMap((g) => g.members.map((m) => m.id))
      expect(memberIds).toHaveLength(100)
      expect(new Set(memberIds).size).toBe(100)
    })
  })
})
