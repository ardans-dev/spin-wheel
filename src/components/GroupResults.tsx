import type { CSSProperties } from 'react'
import { APP_CONFIG } from '../config'
import type { Group } from '../types'
import { Icon } from './Icon'

type GroupResultsProps = {
  groups: Group[]
  onRegenerate: () => void
  onCopy: () => void
}

export function GroupResults({ groups, onRegenerate, onCopy }: GroupResultsProps) {
  if (!groups.length) return null

  const totalMembers = groups.reduce((total, group) => total + group.members.length, 0)

  return (
    <section className="group-results" aria-labelledby="group-results-title">
      <div className="result-header">
        <div>
          <p className="eyebrow">Sudah dibagi</p>
          <h2 id="group-results-title">Hasil pembagian</h2>
          <p className="muted-copy">{totalMembers} peserta · {groups.length} kelompok</p>
        </div>
        <div className="result-actions">
          <button className="button button-outline" type="button" onClick={onCopy}><Icon name="copy" size={16} /> Salin hasil</button>
          <button className="button button-dark" type="button" onClick={onRegenerate}><Icon name="refresh" size={16} /> Acak lagi</button>
        </div>
      </div>
      <div className="group-grid">
        {groups.map((group) => (
          <article
            className="group-card"
            key={group.id}
            style={{
              '--card-index': group.index,
              '--card-stagger': `${APP_CONFIG.animation.cardStagger}ms`,
            } as CSSProperties}
          >
            <div className="group-card-top">
              <span>Kelompok {group.index}</span>
              <span className="member-count">{group.members.length}</span>
            </div>
            <ul>
              {group.members.map((member) => <li key={member.id}>{member.name}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
