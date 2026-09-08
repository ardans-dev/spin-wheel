import { useEffect, useMemo, useRef } from 'react'
import type { CSSProperties } from 'react'
import type { Participant } from '../types'
import { APP_CONFIG } from '../config'
import { describeSector, polarToCartesian } from '../utils/wheel'

function wrapWheelLabel(name: string, maxCharacters: number): string[] {
  const lines: string[] = []
  let currentLine = ''

  name.trim().split(/\s+/).forEach((word) => {
    // Nama tanpa spasi juga dipecah supaya tidak pernah keluar dari label.
    const chunks = word.match(new RegExp(`.{1,${maxCharacters}}`, 'g')) ?? [word]
    chunks.forEach((chunk) => {
      if (!currentLine) {
        currentLine = chunk
      } else if (`${currentLine} ${chunk}`.length <= maxCharacters) {
        currentLine += ` ${chunk}`
      } else {
        lines.push(currentLine)
        currentLine = chunk
      }
    })
  })

  if (currentLine) lines.push(currentLine)
  return lines.length ? lines : ['']
}

type SpinWheelProps = {
  participants: Participant[]
  rotation: number
  isSpinning: boolean
  duration: number
}

export function SpinWheel({ participants, rotation, isSpinning, duration }: SpinWheelProps) {
  const previousRotationRef = useRef(rotation)
  const center = APP_CONFIG.wheel.size / 2
  const radius = 270
  const sectorAngle = 360 / Math.max(participants.length, 1)

  const sectors = useMemo(() => participants.map((participant, index) => {
    const centerAngle = -90 + index * sectorAngle
    const startAngle = centerAngle - sectorAngle / 2
    const endAngle = centerAngle + sectorAngle / 2
    const labelRadius = participants.length > 14 ? 165 : participants.length > 8 ? 175 : 185
    const labelPoint = polarToCartesian(center, labelRadius, centerAngle)
    const labelWidth = participants.length > 14 ? 135 : participants.length > 8 ? 150 : 165
    const baseFontSize = participants.length > 14 ? 16 : participants.length > 8 ? 19 : 23
    const maxCharacters = Math.max(8, Math.floor(labelWidth / (baseFontSize * 0.55)))
    const labelLines = wrapWheelLabel(participant.name, maxCharacters)
    const isLongName = labelLines.length > 1
    const sectorTangentialSpace = 2 * labelRadius * Math.sin((Math.min(sectorAngle, 180) * Math.PI) / 360) * 0.76
    const fontSize = Math.max(10, Math.min(baseFontSize, sectorTangentialSpace / (labelLines.length * 1.16)))
    const labelHeight = Math.max(fontSize * 1.7, labelLines.length * fontSize * 1.2 + 5)
    // Label mengikuti radius wheel: sektor bawah menghadap keluar ke bawah,
    // sektor samping mengarah keluar, sementara sektor paling atas menghadap tengah.
    const isTopSector = index === 0
    const textRotation = isTopSector ? 90 : centerAngle

    return {
      participant,
      path: describeSector(center, radius, startAngle, endAngle),
      labelPoint,
      fontSize,
      labelWidth,
      labelHeight,
      isLongName,
      labelLines,
      rotation: textRotation,
    }
  }), [center, participants, sectorAngle])

  // Capture the previous transform before the next spin so CSS can animate
  // from the real current angle to the calculated winner angle.
  const startRotation = previousRotationRef.current
  useEffect(() => {
    previousRotationRef.current = rotation
  }, [rotation])

  const rotorStyle = {
    '--spin-start': `${startRotation}deg`,
    '--spin-end': `${rotation}deg`,
    transform: `rotate(${rotation}deg)`,
    animation: isSpinning
      ? `wheel-spin ${duration}ms ${APP_CONFIG.spin.easing} both`
      : 'none',
    willChange: isSpinning ? 'transform' : 'auto',
  } as CSSProperties

  return (
    <div className={`wheel-wrap ${isSpinning ? 'is-spinning' : ''}`} aria-busy={isSpinning}>
      <div className={`pointer ${isSpinning ? 'is-spinning' : ''}`} aria-hidden="true"><span /></div>
      <div
        className={`wheel-rotor ${isSpinning ? 'is-spinning' : ''}`}
        style={rotorStyle}
      >
        <svg className="wheel-svg" viewBox={`0 0 ${APP_CONFIG.wheel.size} ${APP_CONFIG.wheel.size}`} role="img" aria-label="Roda undian peserta">
          <circle cx={center} cy={center} r={radius + 11} className="wheel-outline" />
          {sectors.map(({ participant, path, labelPoint, fontSize, labelWidth, labelHeight, isLongName, labelLines, rotation: textRotation }, index) => (
            <g key={participant.id}>
              <path className="wheel-sector" d={path} fill={APP_CONFIG.wheel.colors[index % APP_CONFIG.wheel.colors.length]} />
              <g transform={`translate(${labelPoint.x} ${labelPoint.y}) rotate(${textRotation})`}>
                <foreignObject x={-labelWidth / 2} y={-labelHeight / 2} width={labelWidth} height={labelHeight} overflow="visible">
                  <div className={`wheel-label ${isLongName ? 'is-long' : ''}`} style={{ fontSize: `${fontSize}px` }}>
                    {labelLines.map((line, lineIndex) => <span className="wheel-label-line" key={`${participant.id}-${lineIndex}`}>{line}</span>)}
                  </div>
                </foreignObject>
              </g>
            </g>
          ))}
          <circle cx={center} cy={center} r="34" className="wheel-hub" />
          <circle cx={center} cy={center} r="7" className="wheel-hub-dot" />
        </svg>
      </div>
    </div>
  )
}
