import { useState, useEffect } from 'react'
import { reproduction, pigs } from '../services/api'

interface WeaningFormProps {
  record?: any
  onSave: () => void
  onCancel: () => void
}

export default function WeaningForm({ record, onSave, onCancel }: WeaningFormProps) {
  const [form, setForm] = useState({
    sow: record?.sow?.toString() || '',
    farrowing: record?.farrowing?.toString() || '',
    weaning_date: record?.weaning_date || '',
    piglets_weaned: record?.piglets_weaned?.toString() || '0',
    avg_weight_kg: record?.avg_weight_kg?.toString() || '',
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
        farrowing: form.farrowing ? Number(form.farrowing) : null,
        piglets_weaned: Number(form.piglets_weaned),
        avg_weight_kg: form.avg_weight_kg ? Number(form.avg_weight_kg) : null,
      }
      if (editing) {
        await reproduction.weanings.update(record.id, payload)
      } else {
        await reproduction.weanings.create(payload)
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
          <label>Fecha de destete *</label>
          <input type="date" value={form.weaning_date} onChange={(e) => setForm({ ...form, weaning_date: e.target.value })} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Lechones destetados *</label>
          <input type="number" min="0" value={form.piglets_weaned} onChange={(e) => setForm({ ...form, piglets_weaned: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Peso promedio (kg)</label>
          <input type="number" step="0.1" value={form.avg_weight_kg} onChange={(e) => setForm({ ...form, avg_weight_kg: e.target.value })} />
        </div>
      </div>
      <div className="form-group">
        <label>ID del parto relacionado</label>
        <input type="number" value={form.farrowing} onChange={(e) => setForm({ ...form, farrowing: e.target.value })} placeholder="Opcional" />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Actualizar destete' : 'Registrar destete'}</button>
      </div>
    </form>
  )
}
