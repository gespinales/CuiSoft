import { useState } from 'react'
import { feeding } from '../services/api'

interface FeedTypeFormProps {
  record?: any
  onSave: () => void
  onCancel: () => void
}

export default function FeedTypeForm({ record, onSave, onCancel }: FeedTypeFormProps) {
  const [form, setForm] = useState({
    name: record?.name || '',
    supplier: record?.supplier || '',
    unit_cost: record?.unit_cost?.toString() || '0',
    description: record?.description || '',
  })
  const [saving, setSaving] = useState(false)
  const editing = !!record

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, unit_cost: Number(form.unit_cost) }
      if (editing) {
        await feeding.feedTypes.update(record.id, payload)
      } else {
        await feeding.feedTypes.create(payload)
      }
      onSave()
    } catch { } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Nombre *</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Proveedor</label>
          <input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Costo unitario</label>
          <input type="number" step="0.01" value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost: e.target.value })} />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Actualizar alimento' : 'Crear alimento'}</button>
      </div>
    </form>
  )
}
