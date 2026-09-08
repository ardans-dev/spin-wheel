import type { Participant } from '../types'
import { Icon } from './Icon'

type WinnerResultProps = {
  winner: Participant | null
  onSpinAgain: () => void
  onCopy?: () => void
}

export function WinnerResult({ winner, onSpinAgain, onCopy }: WinnerResultProps) {
  if (!winner) {
    return (
      <div className="result-placeholder">
        <span className="result-line" />
        <p>Hasil spin akan muncul di sini.</p>
      </div>
    )
  }

  return (
    <section className="winner-result" aria-live="polite">
      <p className="eyebrow">Yang terpilih</p>
      <p className="winner-name">{winner.name}</p>
      <p className="winner-caption">mendapat giliran.</p>
      <div className="result-actions">
        <button className="button button-coral" type="button" onClick={onSpinAgain}>Spin lagi <Icon name="refresh" size={16} /></button>
        {onCopy && <button className="button button-quiet" type="button" onClick={onCopy}><Icon name="copy" size={16} /> Salin</button>}
      </div>
    </section>
  )
}
