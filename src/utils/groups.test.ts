import { describe, expect, it } from 'vitest'
import { calculateGroupSizes, generateGroups } from './groups'
import type { Participant } from '../types'

const participants = (count: number): Participant[] =>
  Array.from({ length: count }, (_, index) => ({ id: `p-${index + 1}`, name: `Nama ${index + 1}` }))

describe('group distribution', () => {
  it('membagi 20 peserta ke 7 kelompok tanpa sisa yang hilang', () => {
    expect(calculateGroupSizes(20, 'groupCount', 7)).toEqual([3, 3, 3, 3, 3, 3, 2])
  })

  it('membagi berdasarkan anggota per kelompok', () => {
    expect(calculateGroupSizes(20, 'membersPerGroup', 3)).toEqual([3, 3, 3, 3, 3, 3, 2])
    expect(calculateGroupSizes(10, 'membersPerGroup', 3)).toEqual([3, 3, 2, 2])
  })

  it.each([
    [10, 3, 3],
    [21, 7, 7],
    [7, 7, 7],
    [2, 2, 2],
  ])('menghasilkan jumlah kelompok yang benar untuk %i peserta dan %i kelompok', (total, count, expected) => {
    expect(calculateGroupSizes(total, 'groupCount', count)).toHaveLength(expected)
  })

  it('menolak satu peserta atau jumlah kelompok yang terlalu banyak', () => {
    expect(calculateGroupSizes(1, 'groupCount', 1)).toEqual([])
    expect(generateGroups(participants(1), 'groupCount', 1)).toHaveLength(0)
    expect(calculateGroupSizes(2, 'groupCount', 3)).toEqual([])
    expect(calculateGroupSizes(20, 'groupCount', 0)).toEqual([])
    expect(calculateGroupSizes(20, 'groupCount', 2.5)).toEqual([])
    expect(calculateGroupSizes(20, 'groupCount', Number.NaN)).toEqual([])
  })

  it('tidak menggandakan atau menghilangkan peserta saat generate', () => {
    const result = generateGroups(participants(20), 'groupCount', 7)
    const ids = result.flatMap((group) => group.members.map((member) => member.id))

    expect(result).toHaveLength(7)
    expect(ids).toHaveLength(20)
    expect(new Set(ids).size).toBe(20)
  })

  it('menjaga jumlah anggota saat memakai mode anggota per kelompok', () => {
    const result = generateGroups(participants(10), 'membersPerGroup', 3)

    expect(result.map((group) => group.members.length)).toEqual([3, 3, 2, 2])
    expect(result.flatMap((group) => group.members)).toHaveLength(10)
  })

  it('menggunakan shuffle setiap kali generate dipanggil', () => {
    const orders = Array.from({ length: 20 }, () =>
      generateGroups(participants(6), 'groupCount', 2)
        .flatMap((group) => group.members.map((member) => member.id))
        .join(','),
    )

    expect(new Set(orders).size).toBeGreaterThan(1)
  })
})
