import { useState, useEffect } from 'react'
import { sales } from '../services/api'

export default function SaleForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ customer: '', sale_date: '', total_amount: '0', payment_method: '', notes: '' })
  const [customers, setCustomers] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => { sales.customers.list().then((r) => setCustomers(r.data.results || r.data)) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await sales.sales.create({
        ...form,
        customer: Number(form.customer),
        total_amount: Number(form.total_amount),
      })
      onSave()
    } catch { } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Cliente *</label>
          <select value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} required>
            <option value="">Seleccionar...</option>
            {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Fecha *</label>
          <input type="date" value={form.sale_date} onChange={(e) => setForm({ ...form, sale_date: e.target.value })} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Monto total *</label>
          <input type="number" step="0.01" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Método de pago</label>
          <input value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Crear venta'}</button>
      </div>
    </form>
  )
}
