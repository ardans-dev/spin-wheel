import { useEffect, useRef, useState } from 'react'
import { APP_CONFIG } from './config'
import { useParticipants } from './hooks/useParticipants'
import { calculateGroupSizes, generateGroups } from './utils/groups'
import { calculateWheelRotation } from './utils/wheel'
import { randomIntInclusive, selectRandomWinner } from './utils/random'
import type { AppMode, Group, GroupSettingMode, Participant, SpinHistoryEntry } from './types'
import { BackButton, Brand } from './components/Brand'
import { GroupResults } from './components/GroupResults'
import { GroupSettings } from './components/GroupSettings'
import { Icon } from './components/Icon'
import { ParticipantEditor } from './components/ParticipantEditor'
import { ProcessingModal } from './components/ProcessingModal'
import { SpinWheel } from './components/SpinWheel'
import { SpinHistory } from './components/SpinHistory'
import { WinnerResult } from './components/WinnerResult'

const PROCESSING_MESSAGES = [
  'Mengacak peserta...',
  'Menyusun anggota...',
  'Menentukan kelompok...',
  'Hampir selesai...',
]

function Home({ onSelectMode }: { onSelectMode: (mode: AppMode) => void }) {
  return (
    <div className="home-page">
      <div className="home-intro">
        <p className="eyebrow">Alat undian sederhana</p>
        <h1>Spin Wheel</h1>
        <p>Pilih mode yang ingin digunakan.</p>
      </div>

      <div className="mode-grid">
        <button className="mode-card mode-card-individual" type="button" onClick={() => onSelectMode('individual')}>
          <span className="mode-card-line" aria-hidden="true" />
          <span className="mode-card-kicker">01 / satu pemenang</span>
          <strong>Individu</strong>
          <span>Pilih satu nama secara acak.</span>
          <span className="mode-card-action">Mulai <Icon name="arrow" size={17} /></span>
        </button>
        <button className="mode-card mode-card-group" type="button" onClick={() => onSelectMode('group')}>
          <span className="mode-card-line" aria-hidden="true" />
          <span className="mode-card-kicker">02 / beberapa kelompok</span>
          <strong>Kelompok</strong>
          <span>Bagi peserta ke beberapa kelompok.</span>
          <span className="mode-card-action">Mulai <Icon name="arrow" size={17} /></span>
        </button>
      </div>
    </div>
  )
}

type IndividualPageProps = {
  participants: Participant[]
  onAdd: (name: string) => boolean
  onAddMany: (value: string) => number
  onEdit: (id: string, name: string) => boolean
  onRemove: (id: string) => void
  removeWinner: boolean
  onRemoveWinnerChange: (value: boolean) => void
}

function IndividualPage({
  participants,
  onAdd,
  onAddMany,
  onEdit,
  onRemove,
  removeWinner,
  onRemoveWinnerChange,
}: IndividualPageProps) {
  const [winner, setWinner] = useState<Participant | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [spinDuration, setSpinDuration] = useState<number>(APP_CONFIG.spin.desktopDuration)
  const [spinError, setSpinError] = useState('')
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [history, setHistory] = useState<SpinHistoryEntry[]>([])
  const [historyEnabled, setHistoryEnabled] = useState(false)
  const rotationRef = useRef(0)
  const spinTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setIsReducedMotion(mediaQuery.matches)
    handleChange()
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => () => {
    if (spinTimeoutRef.current) window.clearTimeout(spinTimeoutRef.current)
  }, [])

  const spin = () => {
    if (isSpinning) return
    if (participants.length < 2) {
      setSpinError('Minimal 2 peserta diperlukan.')
      return
    }

    const winnerIndex = selectRandomWinner(participants)
    const isMobile = window.matchMedia('(max-width: 720px)').matches
    const duration = isReducedMotion
      ? APP_CONFIG.spin.reducedMotionDuration
      : isMobile
        ? APP_CONFIG.spin.mobileDuration
        : APP_CONFIG.spin.desktopDuration
    const rotations = randomIntInclusive(APP_CONFIG.spin.minRotations, APP_CONFIG.spin.maxRotations)
    const targetRotation = calculateWheelRotation(
      winnerIndex,
      participants.length,
      rotationRef.current,
      rotations,
    )

    if (spinTimeoutRef.current) window.clearTimeout(spinTimeoutRef.current)
    setSpinError('')
    setWinner(null)
    setSpinDuration(duration)
    setRotation(targetRotation)
    rotationRef.current = targetRotation
    setIsSpinning(true)

    spinTimeoutRef.current = window.setTimeout(() => {
      const selected = participants[winnerIndex]
      setWinner(selected)
      setHistory((current) => [
        ...current,
        { id: `${selected.id}-${current.length}-${Date.now()}`, name: selected.name },
      ])
      setIsSpinning(false)
      if (removeWinner) onRemove(selected.id)
    }, duration)
  }

  const reset = () => {
    if (isSpinning) return
    setWinner(null)
    setSpinError('')
    setRotation(0)
    rotationRef.current = 0
    setHistory([])
  }

  const copyWinner = () => {
    if (winner) void navigator.clipboard?.writeText(`Pemenang: ${winner.name}`)
  }

  return (
    <div className="mode-page">
      <div className="page-intro">
        <p className="eyebrow">Mode individu</p>
        <h1>Pilih satu nama.</h1>
        <p>Tambahkan peserta, lalu biarkan wheel memilih.</p>
      </div>

      <div className="workspace individual-layout">
        <ParticipantEditor participants={participants} onAdd={onAdd} onAddMany={onAddMany} onEdit={onEdit} onRemove={onRemove} />

        <section className="wheel-panel" aria-labelledby="wheel-title">
          <div className="panel-heading-line">
            <div>
              <p className="eyebrow">Putar wheel</p>
              <h2 id="wheel-title">Siapa yang terpilih?</h2>
            </div>
            <span className="panel-note">{participants.length} sektor</span>
          </div>

          <div className="wheel-stage">
            <SpinWheel participants={participants} rotation={rotation} isSpinning={isSpinning} duration={spinDuration} />
          </div>

          <div className="spin-controls">
            <button className="button button-coral spin-button" type="button" onClick={spin} disabled={isSpinning || participants.length < 2}>
              {isSpinning ? 'Sedang berputar...' : 'Spin'}
              {!isSpinning && <Icon name="arrow" size={18} />}
            </button>
            <label className="toggle-row">
              <input type="checkbox" checked={removeWinner} onChange={(event) => onRemoveWinnerChange(event.target.checked)} />
              <span className="toggle-ui" aria-hidden="true" />
              <span>Hapus pemenang setelah dipilih</span>
            </label>
            {spinError && <p className="field-error" role="alert">{spinError}</p>}
            {!spinError && participants.length < 2 && <p className="field-error" role="status">Minimal 2 peserta diperlukan.</p>}
          </div>

          <WinnerResult winner={winner} onSpinAgain={spin} onCopy={copyWinner} />
          <button className="reset-link" type="button" onClick={reset} disabled={isSpinning}>Atur wheel dari awal</button>
          <SpinHistory entries={history} enabled={historyEnabled} onEnabledChange={setHistoryEnabled} />
        </section>
      </div>
    </div>
  )
}

type GroupPageProps = {
  participants: Participant[]
  onAdd: (name: string) => boolean
  onAddMany: (value: string) => number
  onEdit: (id: string, name: string) => boolean
  onRemove: (id: string) => void
}

function GroupPage({ participants, onAdd, onAddMany, onEdit, onRemove }: GroupPageProps) {
  const [settingMode, setSettingMode] = useState<GroupSettingMode>('groupCount')
  const [settingValue, setSettingValue] = useState(2)
  const [groups, setGroups] = useState<Group[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [processingMessage, setProcessingMessage] = useState(PROCESSING_MESSAGES[0])
  const [groupError, setGroupError] = useState('')
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const generationTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setIsReducedMotion(mediaQuery.matches)
    handleChange()
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => () => {
    if (generationTimeoutRef.current) window.clearTimeout(generationTimeoutRef.current)
  }, [])

  useEffect(() => {
    if (!isGenerating) return
    let messageIndex = 0
    const interval = window.setInterval(() => {
      messageIndex = Math.min(messageIndex + 1, PROCESSING_MESSAGES.length - 1)
      setProcessingMessage(PROCESSING_MESSAGES[messageIndex])
    }, 580)

    return () => window.clearInterval(interval)
  }, [isGenerating])

  const validateSettings = () => {
    // [VALIDATION]
    // Validasi dilakukan sebelum modal dibuka agar user langsung mendapat arah perbaikan.
    if (participants.length < APP_CONFIG.group.minParticipants) {
      return 'Minimal 2 peserta diperlukan.'
    }
    if (settingValue < 1) return 'Jumlah harus lebih dari 0.'
    if (settingMode === 'groupCount' && settingValue > participants.length) {
      return 'Jumlah kelompok tidak boleh lebih banyak daripada jumlah peserta.'
    }
    if (!calculateGroupSizes(participants.length, settingMode, settingValue).length) {
      return 'Pengaturan kelompok belum valid.'
    }
    return ''
  }

  const generate = () => {
    if (isGenerating) return
    const error = validateSettings()
    if (error) {
      setGroupError(error)
      return
    }

    const generatedGroups = generateGroups(participants, settingMode, settingValue)
    if (!generatedGroups.length) {
      setGroupError('Kelompok belum dapat dibuat. Periksa kembali pesertanya.')
      return
    }

    const duration = isReducedMotion
      ? APP_CONFIG.group.reducedMotionDuration
      : APP_CONFIG.group.processingDuration

    if (generationTimeoutRef.current) window.clearTimeout(generationTimeoutRef.current)
    setGroupError('')
    setGroups([])
    setProcessingMessage(PROCESSING_MESSAGES[0])
    setIsGenerating(true)

    generationTimeoutRef.current = window.setTimeout(() => {
      setGroups(generatedGroups)
      setIsGenerating(false)
    }, duration)
  }

  const copyGroups = () => {
    const text = groups
      .map((group) => `Kelompok ${group.index}\n${group.members.map((member) => `- ${member.name}`).join('\n')}`)
      .join('\n\n')
    void navigator.clipboard?.writeText(text)
  }

  const handleAdd = (name: string) => {
    const didAdd = onAdd(name)
    if (didAdd) setGroups([])
    return didAdd
  }

  const handleAddMany = (value: string) => {
    const addedCount = onAddMany(value)
    if (addedCount > 0) setGroups([])
    return addedCount
  }

  const handleEdit = (id: string, name: string) => {
    const didEdit = onEdit(id, name)
    if (didEdit) setGroups([])
    return didEdit
  }

  const handleRemove = (id: string) => {
    onRemove(id)
    setGroups([])
  }

  return (
    <div className="mode-page">
      <div className="page-intro">
        <p className="eyebrow">Mode kelompok</p>
        <h1>Susun peserta bersama.</h1>
        <p>Atur cara pembagian, lalu biarkan wheel menyusun sisanya.</p>
      </div>

      <div className="group-controls">
        <ParticipantEditor participants={participants} onAdd={handleAdd} onAddMany={handleAddMany} onEdit={handleEdit} onRemove={handleRemove} />
        <div className="group-settings-column">
          <GroupSettings
            participantCount={participants.length}
            mode={settingMode}
            value={settingValue}
            onModeChange={(mode) => {
              setSettingMode(mode)
              setGroupError('')
            }}
            onValueChange={(value) => {
              setSettingValue(value)
              setGroupError('')
            }}
            error={groupError}
          />
          <button className="button button-coral group-submit" type="button" onClick={generate} disabled={isGenerating}>
            Bagikan kelompok <Icon name="arrow" size={18} />
          </button>
          <p className="small-note">Peserta akan diacak ulang setiap kali dibagikan.</p>
          <GroupResults groups={groups} onRegenerate={generate} onCopy={copyGroups} />
          {!groups.length && !isGenerating && <div className="group-empty"><span className="empty-rule" /><p>Hasil pembagian akan muncul di sini.</p></div>}
        </div>
      </div>

      {isGenerating && <ProcessingModal message={processingMessage} />}
    </div>
  )
}

export default function App() {
  const { participants, add, addMany, edit, remove, reset } = useParticipants()
  const [mode, setMode] = useState<AppMode>('home')
  const [removeWinner, setRemoveWinner] = useState(false)

  const leaveMode = () => {
    setMode('home')
    reset()
    setRemoveWinner(false)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Brand />
        {mode !== 'home' && <BackButton onClick={leaveMode} />}
      </header>

      <main>
        {mode === 'home' && <Home onSelectMode={setMode} />}
        {mode === 'individual' && (
          <IndividualPage
            participants={participants}
            onAdd={add}
            onAddMany={addMany}
            onEdit={edit}
            onRemove={remove}
            removeWinner={removeWinner}
            onRemoveWinnerChange={setRemoveWinner}
          />
        )}
        {mode === 'group' && (
          <GroupPage participants={participants} onAdd={add} onAddMany={addMany} onEdit={edit} onRemove={remove} />
        )}
      </main>

      <footer className="app-footer">
        <span className="footer-status-dot" />
        <a href="https://ardans.my.id" className="footer-link">ardans-dev</a>
        <span className="footer-rule" />
        <span>Spin Wheel [UTILITY_NODE]</span>
        <span className="footer-rule" />
        <span className="footer-stealth">Building in silence</span>
      </footer>
    </div>
  )
}
