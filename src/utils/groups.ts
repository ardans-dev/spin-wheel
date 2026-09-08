import type { Group, GroupSettingMode, Participant } from '../types'
import { shuffleParticipants } from './random'

export function calculateGroupSizes(
  totalParticipants: number,
  mode: GroupSettingMode,
  value: number,
): number[] {
  if (
    !Number.isInteger(totalParticipants) ||
    !Number.isInteger(value) ||
    totalParticipants < 2 ||
    value < 1
  ) return []

  const groupCount = mode === 'groupCount' ? value : Math.ceil(totalParticipants / value)
  if (groupCount < 1 || groupCount > totalParticipants) return []

  const baseSize = Math.floor(totalParticipants / groupCount)
  const remainder = totalParticipants % groupCount

  return Array.from({ length: groupCount }, (_, index) => baseSize + (index < remainder ? 1 : 0))
}

export function generateGroups(
  participants: Participant[],
  mode: GroupSettingMode,
  value: number,
): Group[] {
  const sizes = calculateGroupSizes(participants.length, mode, value)
  if (!sizes.length) return []

  const shuffled = shuffleParticipants(participants)
  let cursor = 0

  const groups = sizes.map((size, index) => {
    const members = shuffled.slice(cursor, cursor + size)
    cursor += size

    return {
      id: `group-${index + 1}`,
      index: index + 1,
      members,
    }
  })

  const generatedIds = groups.flatMap((group) => group.members.map((member) => member.id))
  const hasAllParticipants = generatedIds.length === participants.length
  const hasNoDuplicates = new Set(generatedIds).size === generatedIds.length

  return hasAllParticipants && hasNoDuplicates ? groups : []
}
