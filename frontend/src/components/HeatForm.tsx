import { useState } from 'react'
import { reproduction } from '../services/api'

export default function HeatForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ sow: '', heat_date: '', intensity: 'medium', detected_by: '', symptoms: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await reproduction.heatDetections.create({ ...form, sow: Number(form.sow) })
      onSave()
    } catch { } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>ID de la Cerda *</label>
          <input name="sow" type="number" value={form.sow} onChange={(e) => setForm({ ...form, sow: e.target.value })} required placeholder="Ej: 1" />
        </div>
        <div className="form-group">
          <label>Fecha de celo *</label>
          <input name="heat_date" type="date" value={form.heat_date} onChange={(e) => setForm({ ...form, heat_date: e.target.value })} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Intensidad</label>
          <select name="intensity" value={form.intensity} onChange={(e) => setForm({ ...form, intensity: e.target.value })}>
            <option value="low">Bajo</option>
            <option value="medium">Medio</option>
            <option value="high">Alto</option>
          </select>
        </div>
        <div className="form-group">
          <label>Detectado por</label>
          <input name="detected_by" value={form.detected_by} onChange={(e) => setForm({ ...form, detected_by: e.target.value })} />
        </div>
      </div>
      <div className="form-group">
        <label>Síntomas</label>
        <textarea name="symptoms" value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} rows={2} />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Registrar celo'}</button>
      </div>
    </form>
  )
}
