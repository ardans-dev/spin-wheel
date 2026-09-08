import type { Participant } from '../types'

// [RANDOM_LOGIC]
// Gunakan Web Crypto agar hasil tidak mengikuti pola pseudo-random sederhana.
// Fallback Math.random menjaga utilitas tetap jalan di environment lama/test.
function randomUint32(): number {
  if (globalThis.crypto?.getRandomValues) {
    const value = new Uint32Array(1)
    globalThis.crypto.getRandomValues(value)
    return value[0]
  }

  return Math.floor(Math.random() * 0x1_0000_0000)
}

export function randomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) return 0

  // Rejection sampling menghindari bias modulo saat rentang tidak membagi 2^32.
  const limit = Math.floor(0x1_0000_0000 / maxExclusive) * maxExclusive
  let value = randomUint32()
  while (value >= limit) value = randomUint32()

  return value % maxExclusive
}

export function randomIntInclusive(min: number, max: number): number {
  return min + randomInt(max - min + 1)
}

// Fisher-Yates menghasilkan salinan baru sehingga state React tidak berubah diam-diam.
export function shuffleParticipants(participants: Participant[]): Participant[] {
  const shuffled = [...participants]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = randomInt(index + 1)
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }

  return shuffled
}

export function selectRandomWinner(participants: Participant[]): number {
  if (!participants.length) return -1
  return randomInt(participants.length)
}
