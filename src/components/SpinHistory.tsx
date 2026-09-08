import type { SpinHistoryEntry } from '../types'

type SpinHistoryProps = {
  entries: SpinHistoryEntry[]
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
}

export function SpinHistory({ entries, enabled, onEnabledChange }: SpinHistoryProps) {
  return (
    <section className="history-panel" aria-labelledby="history-title">
      <div className="history-header">
        <div>
          <p className="eyebrow">Catatan sesi</p>
          <h2 id="history-title">Riwayat spin</h2>
        </div>
        <label className="toggle-row history-toggle">
          <input type="checkbox" checked={enabled} onChange={(event) => onEnabledChange(event.target.checked)} />
          <span className="toggle-ui" aria-hidden="true" />
          <span>{enabled ? 'Aktif' : 'Nonaktif'}</span>
        </label>
      </div>

      {enabled ? (
        entries.length > 0 ? (
          <ol className="history-list" aria-live="polite">
            {entries.map((entry, index) => (
              <li key={entry.id} className="history-item">
                <span className="history-number">{String(index + 1).padStart(2, '0')}</span>
                <span>{entry.name}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="history-empty">Belum ada hasil. Pemenang berikutnya akan dicatat di sini.</p>
        )
      ) : (
        <p className="history-empty">Aktifkan untuk menyimpan urutan pemenang sesi ini.</p>
      )}
    </section>
  )
}
