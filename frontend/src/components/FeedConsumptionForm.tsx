import { useState, useEffect } from 'react'
import { feeding } from '../services/api'

interface FeedConsumptionFormProps {
  record?: any
  onSave: () => void
  onCancel: () => void
}

export default function FeedConsumptionForm({ record, onSave, onCancel }: FeedConsumptionFormProps) {
  const [form, setForm] = useState({
    feed_type: record?.feed_type?.toString() || '',
    pig: record?.pig?.toString() || '',
    quantity: record?.quantity?.toString() || '0',
    date: record?.date || '',
    location: record?.location?.toString() || '',
    notes: record?.notes || '',
  })
  const [types, setTypes] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const editing = !!record

  useEffect(() => { feeding.feedTypes.list().then((r) => setTypes(r.data.results || r.data)) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        feed_type: Number(form.feed_type),
        pig: form.pig ? Number(form.pig) : null,
        quantity: Number(form.quantity),
        date: form.date,
        location: form.location ? Number(form.location) : null,
        notes: form.notes,
      }
      if (editing) {
        await feeding.consumption.update(record.id, payload)
      } else {
        await feeding.consumption.create(payload)
      }
      onSave()
    } catch { } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Alimento *</label>
          <select value={form.feed_type} onChange={(e) => setForm({ ...form, feed_type: e.target.value })} required>
            <option value="">Seleccionar...</option>
            {types.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Cantidad *</label>
          <input type="number" step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Fecha *</label>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>ID del Cerdo</label>
          <input type="number" value={form.pig} onChange={(e) => setForm({ ...form, pig: e.target.value })} placeholder="Opcional" />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Actualizar consumo' : 'Registrar consumo'}</button>
      </div>
    </form>
  )
}
