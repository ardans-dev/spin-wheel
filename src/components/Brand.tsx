import { Icon } from './Icon'

export function Brand() {
  return (
    <div className="brand" aria-label="Spin Wheel">
      <span className="brand-mark"><span /></span>
      <span>Spin Wheel</span>
    </div>
  )
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="back-button" type="button" onClick={onClick}>
      <Icon name="back" size={17} />
      <span>Kembali</span>
    </button>
  )
}
