import { Icon } from './Icon'

export function Brand() {
  return (
    <div className="brand" aria-label="Spin Wheel">
      <a href="https://ardans.my.id" className="brand-parent-link" title="Kembali ke ardans.my.id">
        <span className="brand-caret">&gt;</span>
        <span className="brand-callsign">ardans-dev</span>
        <span className="brand-status-dot" aria-hidden="true" />
      </a>
      <span className="brand-slash">/</span>
      <div className="brand-current">
        <span className="brand-mark"><span /></span>
        <span className="brand-title">Spin Wheel</span>
      </div>
      <span className="brand-badge">[UTILITY_NODE]</span>
    </div>
  )
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="back-button" type="button" onClick={onClick}>
      <Icon name="back" size={16} />
      <span>Kembali</span>
    </button>
  )
}

