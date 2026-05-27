import { useState } from 'react'
import { sales } from '../services/api'

export default function CustomerForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try { await sales.customers.create(form); onSave() } catch { } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Nombre *</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Teléfono</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
      </div>
      <div className="form-group">
        <label>Dirección</label>
        <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Crear cliente'}</button>
      </div>
    </form>
  )
}
