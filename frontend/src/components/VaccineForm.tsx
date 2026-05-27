import { useState } from 'react'
import { health } from '../services/api'

export default function VaccineForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ name: '', laboratory: '', lot_number: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await health.vaccines.create(form)
      onSave()
    } catch { } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Nombre de la vacuna *</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Laboratorio</label>
          <input value={form.laboratory} onChange={(e) => setForm({ ...form, laboratory: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Lote</label>
          <input value={form.lot_number} onChange={(e) => setForm({ ...form, lot_number: e.target.value })} />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Crear vacuna'}</button>
      </div>
    </form>
  )
}
