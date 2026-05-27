import { useState, useEffect } from 'react'
import { reproduction, pigs } from '../services/api'

interface FarrowingFormProps {
  record?: any
  onSave: () => void
  onCancel: () => void
}

export default function FarrowingForm({ record, onSave, onCancel }: FarrowingFormProps) {
  const [form, setForm] = useState({
    sow: record?.sow?.toString() || '',
    farrowing_date: record?.farrowing_date || '',
    piglets_alive: record?.piglets_alive?.toString() || '0',
    piglets_stillborn: record?.piglets_stillborn?.toString() || '0',
    piglets_mummies: record?.piglets_mummies?.toString() || '0',
    assisted: record?.assisted ? 'true' : 'false',
    attended_by: record?.attended_by || '',
    notes: record?.notes || '',
  })
  const [sows, setSows] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const editing = !!record

  useEffect(() => {
    pigs.list({ sex: 'female', category: 'sow', status: 'active', page_size: 100 })
      .then((r) => setSows(r.data.results || r.data))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        sow: Number(form.sow),
        piglets_alive: Number(form.piglets_alive),
        piglets_stillborn: Number(form.piglets_stillborn),
        piglets_mummies: Number(form.piglets_mummies),
        assisted: form.assisted === 'true',
      }
      if (editing) {
        await reproduction.farrowings.update(record.id, payload)
      } else {
        await reproduction.farrowings.create(payload)
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
          <label>Cerda *</label>
          <select value={form.sow} onChange={(e) => setForm({ ...form, sow: e.target.value })} required>
            <option value="">Seleccionar...</option>
            {sows.map((s: any) => <option key={s.id} value={s.id}>{s.ear_tag} - {s.name || 'Sin nombre'}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Fecha de parto *</label>
          <input type="date" value={form.farrowing_date} onChange={(e) => setForm({ ...form, farrowing_date: e.target.value })} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Lechones vivos *</label>
          <input type="number" min="0" value={form.piglets_alive} onChange={(e) => setForm({ ...form, piglets_alive: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Nacidos muertos</label>
          <input type="number" min="0" value={form.piglets_stillborn} onChange={(e) => setForm({ ...form, piglets_stillborn: e.target.value })} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Momificados</label>
          <input type="number" min="0" value={form.piglets_mummies} onChange={(e) => setForm({ ...form, piglets_mummies: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Parto asistido</label>
          <select value={form.assisted} onChange={(e) => setForm({ ...form, assisted: e.target.value })}>
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Atendido por</label>
        <input value={form.attended_by} onChange={(e) => setForm({ ...form, attended_by: e.target.value })} />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Actualizar parto' : 'Registrar parto'}</button>
      </div>
    </form>
  )
}
