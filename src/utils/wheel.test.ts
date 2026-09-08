import { describe, expect, it } from 'vitest'
import { calculateWheelRotation, getSectorAngle } from './wheel'

describe('wheel rotation', () => {
  it('menghitung sudut sektor berdasarkan jumlah peserta', () => {
    expect(getSectorAngle(4)).toBe(90)
    expect(getSectorAngle(7)).toBeCloseTo(360 / 7)
    expect(getSectorAngle(0)).toBe(0)
  })

  it('membawa sektor pemenang ke pointer di bagian atas', () => {
    const target = calculateWheelRotation(2, 4, 0, 5)
    expect(target % 360).toBe(180)
    expect(target).toBe(1980)
  })

  it('selalu menambah beberapa putaran dari posisi sebelumnya', () => {
    const target = calculateWheelRotation(1, 5, 740, 5)
    expect(target).toBeGreaterThan(740 + 4 * 360)
  })

  it('tidak menghitung rotasi untuk wheel atau winner yang tidak valid', () => {
    expect(calculateWheelRotation(0, 0, 180, 5)).toBe(180)
    expect(calculateWheelRotation(-1, 4, 180, 5)).toBe(180)
    expect(calculateWheelRotation(4, 4, 180, 5)).toBe(180)
  })
})
