import { useState, useEffect } from 'react'
import { reproduction, pigs } from '../services/api'

interface HeatFormProps {
  record?: any
  onSave: () => void
  onCancel: () => void
}

export default function HeatForm({ record, onSave, onCancel }: HeatFormProps) {
  const [form, setForm] = useState({
    sow: record?.sow?.toString() || '',
    heat_date: record?.heat_date || '',
    intensity: record?.intensity || 'medium',
    detected_by: record?.detected_by || '',
    symptoms: record?.symptoms || '',
    is_mated: record?.is_mated ?? false,
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
      const payload = { ...form, sow: Number(form.sow) }
      if (editing) {
        await reproduction.heatDetections.update(record.id, payload)
      } else {
        await reproduction.heatDetections.create(payload)
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
          <label>Fecha de celo *</label>
          <input type="date" value={form.heat_date} onChange={(e) => setForm({ ...form, heat_date: e.target.value })} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Intensidad</label>
          <select value={form.intensity} onChange={(e) => setForm({ ...form, intensity: e.target.value })}>
            <option value="low">Bajo</option>
            <option value="medium">Medio</option>
            <option value="high">Alto</option>
          </select>
        </div>
        <div className="form-group">
          <label>Detectado por</label>
          <input value={form.detected_by} onChange={(e) => setForm({ ...form, detected_by: e.target.value })} />
        </div>
      </div>
      <div className="form-group">
        <label>Síntomas</label>
        <textarea value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} rows={2} />
      </div>
      <div className="form-group">
        <label>
          <input type="checkbox" checked={form.is_mated} onChange={(e) => setForm({ ...form, is_mated: e.target.checked })} style={{ marginRight: 8 }} />
          ¿Fue montada?
        </label>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Actualizar celo' : 'Registrar celo'}</button>
      </div>
    </form>
  )
}
