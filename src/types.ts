export type AppMode = 'home' | 'individual' | 'group'

export type Participant = {
  id: string
  name: string
}

export type GroupSettingMode = 'groupCount' | 'membersPerGroup'

export type ParticipantFormProps = {
  participants: Participant[]
  onAdd: (name: string) => boolean
  onAddMany: (value: string) => number
  onEdit: (id: string, name: string) => boolean
  onRemove: (id: string) => void
}

export type Group = {
  id: string
  index: number
  members: Participant[]
}

export type SpinHistoryEntry = {
  id: string
  name: string
}
