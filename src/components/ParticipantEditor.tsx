import { useState } from 'react'
import type { ParticipantFormProps } from '../types'
import { Icon } from './Icon'

export function ParticipantEditor({
  participants,
  onAdd,
  onAddMany,
  onEdit,
  onRemove,
}: ParticipantFormProps) {
  const [newName, setNewName] = useState('')
  const [pastedNames, setPastedNames] = useState('')
  const [inputError, setInputError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleAdd = () => {
    if (!newName.trim()) {
      setInputError('Masukkan nama peserta terlebih dahulu.')
      return
    }

    // [VALIDATION]
    // Koma atau baris baru pada field utama diperlakukan sebagai daftar nama,
    // bukan sebagai bagian dari satu nama panjang.
    const hasMultipleNames = /[,;\n]/.test(newName)
    if (hasMultipleNames) {
      const addedCount = onAddMany(newName)
      if (addedCount === 0) {
        setInputError('Masukkan nama peserta yang valid.')
        return
      }
    } else if (!onAdd(newName)) {
      setInputError('Nama tersebut sudah ada.')
      return
    }

    setNewName('')
    setInputError('')
  }

  const handleAddMany = () => {
    if (!pastedNames.trim()) {
      setInputError('Tempelkan setidaknya satu nama.')
      return
    }
    onAddMany(pastedNames)
    setPastedNames('')
    setInputError('')
  }

  const saveEdit = (id: string) => {
    if (!editingName.trim()) return
    if (!onEdit(id, editingName)) {
      setInputError('Nama tersebut sudah ada.')
      return
    }
    setEditingId(null)
    setEditingName('')
    setInputError('')
  }

  return (
    <section className="participant-panel" aria-labelledby="participant-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Daftar peserta</p>
          <h2 id="participant-title">Siapa yang ikut?</h2>
        </div>
        <span className="count-chip">{participants.length} peserta</span>
      </div>

      <div className="add-row">
        <label className="sr-only" htmlFor="new-participant">Nama peserta baru</label>
        <textarea
          id="new-participant"
          className="single-name-input"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              handleAdd()
            }
          }}
          placeholder="Nama atau Andi, Budi, Citra..."
          rows={2}
        />
        <button className="button button-dark" type="button" onClick={handleAdd}>Tambah</button>
      </div>

      <p className="input-hint">Enter untuk menambahkan · Shift + Enter untuk baris baru</p>

      {inputError && <p className="field-error" role="alert">{inputError}</p>}

      <div className="participant-list" aria-live="polite">
        {participants.length === 0 ? (
          <div className="empty-list">Belum ada peserta. Tambahkan nama di atas.</div>
        ) : (
          participants.map((participant, index) => (
            <div className="participant-row" key={participant.id}>
              <span className="participant-number">{String(index + 1).padStart(2, '0')}</span>
              {editingId === participant.id ? (
                <div className="inline-edit">
                  <label className="sr-only" htmlFor={`edit-${participant.id}`}>Edit nama</label>
                  <input
                    id={`edit-${participant.id}`}
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') saveEdit(participant.id)
                      if (event.key === 'Escape') setEditingId(null)
                    }}
                    autoFocus
                  />
                  <button className="icon-button icon-button-confirm" type="button" onClick={() => saveEdit(participant.id)} aria-label="Simpan nama">
                    <Icon name="check" size={16} />
                  </button>
                </div>
              ) : (
                <span className="participant-name">{participant.name}</span>
              )}
              {editingId !== participant.id && (
                <div className="row-actions">
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={`Edit ${participant.name}`}
                    onClick={() => {
                      setEditingId(participant.id)
                      setEditingName(participant.name)
                    }}
                  >
                    <Icon name="edit" size={16} />
                  </button>
                  <button className="icon-button icon-button-danger" type="button" aria-label={`Hapus ${participant.name}`} onClick={() => onRemove(participant.id)}>
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <details className="paste-drawer">
        <summary>Tambah banyak nama sekaligus</summary>
        <div className="paste-content">
          <label htmlFor="paste-participants">Pisahkan dengan koma atau tekan Enter untuk nama berikutnya.</label>
          <textarea
            id="paste-participants"
            value={pastedNames}
            onChange={(event) => setPastedNames(event.target.value)}
            placeholder={'Andi, Budi, Citra\natau satu nama per baris'}
            rows={4}
          />
          <button className="button button-outline small-button" type="button" onClick={handleAddMany}>Tambahkan daftar</button>
        </div>
      </details>
    </section>
  )
}
