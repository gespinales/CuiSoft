import { useState } from 'react'
import { finances } from '../services/api'

interface Props {
  record?: any
  onSave: () => void
  onCancel: () => void
}

export default function WorkerPaymentForm({ record, onSave, onCancel }: Props) {
  const [form, setForm] = useState({
    worker_name: record?.worker_name || '',
    amount: record?.amount?.toString() || '',
    payment_date: record?.payment_date || '',
    frequency: record?.frequency || 'weekly',
    period_start: record?.period_start || '',
    period_end: record?.period_end || '',
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
        worker_name: form.worker_name,
        amount: Number(form.amount),
        payment_date: form.payment_date,
        frequency: form.frequency,
        period_start: form.period_start,
        period_end: form.period_end,
        notes: form.notes,
      }
      if (editing) {
        await finances.workerPayments.update(record.id, payload)
      } else {
        await finances.workerPayments.create(payload)
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
          <label>Trabajador *</label>
          <input type="text" value={form.worker_name} onChange={(e) => setForm({ ...form, worker_name: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Monto (Q) *</label>
          <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Fecha de pago *</label>
          <input type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Frecuencia *</label>
          <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} required>
            <option value="weekly">Semanal</option>
            <option value="biweekly">Quincenal</option>
            <option value="monthly">Mensual</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Inicio del período *</label>
          <input type="date" value={form.period_start} onChange={(e) => setForm({ ...form, period_start: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Fin del período *</label>
          <input type="date" value={form.period_end} onChange={(e) => setForm({ ...form, period_end: e.target.value })} required />
        </div>
      </div>
      <div className="form-group">
        <label>Notas</label>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Actualizar pago' : 'Registrar pago'}</button>
      </div>
    </form>
  )
}
