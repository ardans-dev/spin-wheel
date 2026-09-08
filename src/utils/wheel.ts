// [WHEEL_LOGIC]
// Sektor pertama dimulai di atas wheel. Pointer juga berada di atas, jadi pusat
// sektor pemenang harus dibawa kembali ke sudut -90 derajat.
export function getSectorAngle(participantCount: number): number {
  return participantCount > 0 ? 360 / participantCount : 0
}

export function calculateWheelRotation(
  winnerIndex: number,
  participantCount: number,
  currentRotation: number,
  fullRotations: number,
): number {
  if (participantCount <= 0 || winnerIndex < 0 || winnerIndex >= participantCount) {
    return currentRotation
  }

  const sectorAngle = getSectorAngle(participantCount)
  const winnerTarget = (360 - (winnerIndex * sectorAngle) % 360) % 360
  const currentNormalized = ((currentRotation % 360) + 360) % 360
  const correction = (winnerTarget - currentNormalized + 360) % 360

  return currentRotation + fullRotations * 360 + correction
}

export function polarToCartesian(
  center: number,
  radius: number,
  angleInDegrees: number,
): { x: number; y: number } {
  const angleInRadians = (angleInDegrees * Math.PI) / 180

  return {
    x: center + radius * Math.cos(angleInRadians),
    y: center + radius * Math.sin(angleInRadians),
  }
}

export function describeSector(
  center: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(center, radius, endAngle)
  const end = polarToCartesian(center, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return [
    `M ${center} ${center}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ')
}
