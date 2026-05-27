import { useState } from 'react'
import { health } from '../services/api'

export default function MortalityForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ pig: '', death_date: '', cause: 'unknown', necropsy_performed: 'false', necropsy_results: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await health.mortality.create({ ...form, pig: Number(form.pig), necropsy_performed: form.necropsy_performed === 'true' })
      onSave()
    } catch { } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>ID del Cerdo *</label>
          <input type="number" value={form.pig} onChange={(e) => setForm({ ...form, pig: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Fecha de muerte *</label>
          <input type="date" value={form.death_date} onChange={(e) => setForm({ ...form, death_date: e.target.value })} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Causa</label>
          <select value={form.cause} onChange={(e) => setForm({ ...form, cause: e.target.value })}>
            <option value="disease">Enfermedad</option>
            <option value="crushed">Aplastamiento</option>
            <option value="diarrhea">Diarrea</option>
            <option value="respiratory">Problema respiratorio</option>
            <option value="congenital">Malformación congénita</option>
            <option value="trauma">Traumatismo</option>
            <option value="unknown">Causa desconocida</option>
            <option value="other">Otro</option>
          </select>
        </div>
        <div className="form-group">
          <label>¿Necropsia?</label>
          <select value={form.necropsy_performed} onChange={(e) => setForm({ ...form, necropsy_performed: e.target.value })}>
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Registrar mortalidad'}</button>
      </div>
    </form>
  )
}
