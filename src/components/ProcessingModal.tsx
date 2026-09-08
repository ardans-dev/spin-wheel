import { APP_CONFIG } from '../config'

type ProcessingModalProps = {
  message: string
}

export function ProcessingModal({ message }: ProcessingModalProps) {
  const segmentAngle = 360 / APP_CONFIG.wheel.colors.length
  const wheelBackground = `conic-gradient(${APP_CONFIG.wheel.colors
    .map((color, index) => `${color} ${index * segmentAngle}deg ${(index + 1) * segmentAngle}deg`)
    .join(', ')})`

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="processing-modal" role="dialog" aria-modal="true" aria-labelledby="processing-title">
        <div
          className="processing-wheel"
          aria-hidden="true"
          style={{
            background: wheelBackground,
            animation: `processing-wheel-turn ${APP_CONFIG.animation.processingWheelDuration}ms linear infinite`,
          }}
        >
          <span />
        </div>
        <p className="eyebrow">Sebentar</p>
        <h2 id="processing-title">{message}</h2>
        <div className="processing-track" aria-label="Sedang memproses"><span /></div>
      </div>
    </div>
  )
}
