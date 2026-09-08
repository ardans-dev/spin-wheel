import { useCallback, useState } from 'react'
import type { Participant } from '../types'

// [CONFIG]
// Aplikasi dimulai kosong supaya daftar peserta selalu berasal dari input user.
const initialParticipants: Participant[] = []

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

function createParticipant(name: string): Participant {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
  }
}

export function useParticipants() {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants)

  const add = useCallback((rawName: string) => {
    const name = normalizeName(rawName)
    if (!name) return false

    if (participants.some((participant) => participant.name.toLowerCase() === name.toLowerCase())) {
      return false
    }

    setParticipants([...participants, createParticipant(name)])
    return true
  }, [participants])

  const addMany = useCallback((rawValue: string) => {
    const names = rawValue
      .split(/[\n,;]+/)
      .map(normalizeName)
      .filter(Boolean)

    setParticipants((current) => {
      const existingNames = new Set(current.map((participant) => participant.name.toLowerCase()))
      const additions = names
        .filter((name) => {
          const key = name.toLowerCase()
          if (existingNames.has(key)) return false
          existingNames.add(key)
          return true
        })
        .map(createParticipant)

      return [...current, ...additions]
    })

    return names.length
  }, [])

  const edit = useCallback((id: string, rawName: string) => {
    const name = normalizeName(rawName)
    if (!name) return false

    if (
      participants.some(
        (participant) => participant.id !== id && participant.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      return false
    }

    setParticipants(participants.map((participant) =>
      participant.id === id ? { ...participant, name } : participant,
    ))
    return true
  }, [participants])

  const remove = useCallback((id: string) => {
    setParticipants((current) => current.filter((participant) => participant.id !== id))
  }, [])

  const reset = useCallback(() => {
    setParticipants(initialParticipants)
  }, [])

  return { participants, add, addMany, edit, remove, reset, setParticipants }
}
