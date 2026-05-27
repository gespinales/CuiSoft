import { useState } from 'react'
import { reproduction } from '../services/api'

export default function MatingForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ sow: '', boar: '', mating_type: 'natural', mating_date: '', technician: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await reproduction.matings.create({
        ...form,
        sow: Number(form.sow),
        boar: form.boar ? Number(form.boar) : null,
      })
      onSave()
    } catch { } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>ID de la Cerda *</label>
          <input name="sow" type="number" value={form.sow} onChange={(e) => setForm({ ...form, sow: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>ID del Verraco</label>
          <input name="boar" type="number" value={form.boar} onChange={(e) => setForm({ ...form, boar: e.target.value })} placeholder="Opcional" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Fecha de monta *</label>
          <input name="mating_date" type="date" value={form.mating_date} onChange={(e) => setForm({ ...form, mating_date: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Tipo</label>
          <select name="mating_type" value={form.mating_type} onChange={(e) => setForm({ ...form, mating_type: e.target.value })}>
            <option value="natural">Monta natural</option>
            <option value="artificial">Inseminación artificial</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Técnico</label>
        <input name="technician" value={form.technician} onChange={(e) => setForm({ ...form, technician: e.target.value })} />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Registrar monta'}</button>
      </div>
    </form>
  )
}
