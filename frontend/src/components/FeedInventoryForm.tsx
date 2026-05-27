import { useState, useEffect } from 'react'
import { feeding } from '../services/api'

interface FeedInventoryFormProps {
  record?: any
  onSave: () => void
  onCancel: () => void
}

export default function FeedInventoryForm({ record, onSave, onCancel }: FeedInventoryFormProps) {
  const [form, setForm] = useState({
    feed_type: record?.feed_type?.toString() || '',
    stock_quantity: record?.stock_quantity?.toString() || '0',
    entry_date: record?.entry_date || '',
    batch_number: record?.batch_number || '',
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
      const payload = { ...form, feed_type: Number(form.feed_type), stock_quantity: Number(form.stock_quantity) }
      if (editing) {
        await feeding.inventory.update(record.id, payload)
      } else {
        await feeding.inventory.create(payload)
      }
      onSave()
    } catch { } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Tipo de alimento *</label>
          <select value={form.feed_type} onChange={(e) => setForm({ ...form, feed_type: e.target.value })} required>
            <option value="">Seleccionar...</option>
            {types.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Cantidad *</label>
          <input type="number" step="0.01" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Fecha de ingreso *</label>
          <input type="date" value={form.entry_date} onChange={(e) => setForm({ ...form, entry_date: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Lote</label>
          <input value={form.batch_number} onChange={(e) => setForm({ ...form, batch_number: e.target.value })} />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Actualizar ingreso' : 'Registrar ingreso'}</button>
      </div>
    </form>
  )
}
