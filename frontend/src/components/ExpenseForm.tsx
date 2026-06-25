import { useState } from 'react'
import { finances } from '../services/api'

interface Props {
  record?: any
  onSave: () => void
  onCancel: () => void
}

export default function ExpenseForm({ record, onSave, onCancel }: Props) {
  const [form, setForm] = useState({
    category: record?.category || 'utilities',
    description: record?.description || '',
    amount: record?.amount?.toString() || '',
    date: record?.date || '',
    notes: record?.notes || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const editing = !!record

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        category: form.category,
        description: form.description,
        amount: Number(form.amount),
        date: form.date,
        notes: form.notes,
      }
      if (editing) {
        await finances.expenses.update(record.id, payload)
      } else {
        await finances.expenses.create(payload)
      }
      onSave()
    } catch (err: any) {
      const data = err.response?.data
      if (data) {
        const msgs = Object.values(data).flat().join(', ')
        setError(msgs || 'Error al guardar')
      } else {
        setError('Error al guardar')
      }
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-row">
        <div className="form-group">
          <label>Categoría *</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
            <option value="utilities">Servicios (agua/luz/teléfono)</option>
            <option value="maintenance">Mantenimiento</option>
            <option value="medication">Medicamentos</option>
            <option value="transport">Transporte</option>
            <option value="supplies">Insumos</option>
            <option value="other">Otros</option>
          </select>
        </div>
        <div className="form-group">
          <label>Monto (Q) *</label>
          <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Fecha *</label>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Descripción</label>
          <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </div>
      <div className="form-group">
        <label>Notas</label>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Actualizar gasto' : 'Registrar gasto'}</button>
      </div>
    </form>
  )
}
