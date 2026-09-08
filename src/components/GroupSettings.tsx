import type { GroupSettingMode } from '../types'
import { Icon } from './Icon'

type GroupSettingsProps = {
  participantCount: number
  mode: GroupSettingMode
  value: number
  onModeChange: (mode: GroupSettingMode) => void
  onValueChange: (value: number) => void
  error: string
}

export function GroupSettings({ participantCount, mode, value, onModeChange, onValueChange, error }: GroupSettingsProps) {
  const maxValue = mode === 'groupCount' ? participantCount : Math.max(participantCount, 1)

  const changeValue = (amount: number) => {
    onValueChange(Math.min(maxValue, Math.max(1, value + amount)))
  }

  return (
    <section className="settings-panel" aria-labelledby="group-settings-title">
      <div className="section-heading compact-heading">
        <div>
          <p className="eyebrow">Pengaturan</p>
          <h2 id="group-settings-title">Bagikan seperti apa?</h2>
        </div>
      </div>

      <div className="segmented-control" role="group" aria-label="Cara membagi peserta">
        <button type="button" className={mode === 'groupCount' ? 'is-active' : ''} onClick={() => onModeChange('groupCount')}>Jumlah kelompok</button>
        <button type="button" className={mode === 'membersPerGroup' ? 'is-active' : ''} onClick={() => onModeChange('membersPerGroup')}>Anggota per kelompok</button>
      </div>

      <div className="stepper-row">
        <div>
          <p className="stepper-label">{mode === 'groupCount' ? 'Jumlah kelompok' : 'Anggota per kelompok'}</p>
          <p className="stepper-hint">{participantCount} peserta tersedia</p>
        </div>
        <div className="stepper" aria-label={`${value} ${mode === 'groupCount' ? 'kelompok' : 'anggota per kelompok'}`}>
          <button type="button" onClick={() => changeValue(-1)} aria-label="Kurangi"><Icon name="minus" size={16} /></button>
          <span>{value}</span>
          <button type="button" onClick={() => changeValue(1)} aria-label="Tambah"><Icon name="plus" size={16} /></button>
        </div>
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
    </section>
  )
}
