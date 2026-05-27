import { useState } from 'react'
import { reproduction } from '../services/api'

export default function WeaningForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ sow: '', farrowing: '', weaning_date: '', piglets_weaned: '0', avg_weight_kg: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await reproduction.weanings.create({
        ...form,
        sow: Number(form.sow),
        farrowing: form.farrowing ? Number(form.farrowing) : null,
        piglets_weaned: Number(form.piglets_weaned),
        avg_weight_kg: form.avg_weight_kg ? Number(form.avg_weight_kg) : null,
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
          <label>Fecha de destete *</label>
          <input name="weaning_date" type="date" value={form.weaning_date} onChange={(e) => setForm({ ...form, weaning_date: e.target.value })} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Lechones destetados *</label>
          <input name="piglets_weaned" type="number" min="0" value={form.piglets_weaned} onChange={(e) => setForm({ ...form, piglets_weaned: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Peso promedio (kg)</label>
          <input name="avg_weight_kg" type="number" step="0.1" value={form.avg_weight_kg} onChange={(e) => setForm({ ...form, avg_weight_kg: e.target.value })} />
        </div>
      </div>
      <div className="form-group">
        <label>ID del parto relacionado</label>
        <input name="farrowing" type="number" value={form.farrowing} onChange={(e) => setForm({ ...form, farrowing: e.target.value })} placeholder="Opcional" />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Registrar destete'}</button>
      </div>
    </form>
  )
}
