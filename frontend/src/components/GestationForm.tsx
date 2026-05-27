import { useState, useEffect } from 'react'
import { reproduction, pigs } from '../services/api'

interface GestationFormProps {
  record?: any
  onSave: () => void
  onCancel: () => void
}

export default function GestationForm({ record, onSave, onCancel }: GestationFormProps) {
  const [form, setForm] = useState({
    sow: record?.sow?.toString() || '',
    start_date: record?.start_date || '',
    expected_farrowing_date: record?.expected_farrowing_date || '',
    status: record?.status || 'suspected',
    confirmed_date: record?.confirmed_date || '',
    ultrasound_result: record?.ultrasound_result ?? '',
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

  const handleStartDateChange = (value: string) => {
    const newForm = { ...form, start_date: value }
    if (value && !editing) {
      const d = new Date(value)
      d.setDate(d.getDate() + 114)
      newForm.expected_farrowing_date = d.toISOString().split('T')[0]
    }
    setForm(newForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        sow: Number(form.sow),
        start_date: form.start_date,
        expected_farrowing_date: form.expected_farrowing_date || null,
        status: form.status,
        confirmed_date: form.confirmed_date || null,
        ultrasound_result: form.ultrasound_result === '' ? null : form.ultrasound_result === 'true',
        notes: form.notes,
      }
      if (editing) {
        await reproduction.gestations.update(record.id, payload)
      } else {
        await reproduction.gestations.create(payload)
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
          <label>Estado *</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} required>
            <option value="suspected">Sospecha</option>
            <option value="confirmed">Confirmada</option>
            <option value="not_pregnant">No gestante</option>
            <option value="aborted">Abortada</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Fecha de inicio *</label>
          <input type="date" value={form.start_date} onChange={(e) => handleStartDateChange(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Fecha probable de parto</label>
          <input type="date" value={form.expected_farrowing_date} onChange={(e) => setForm({ ...form, expected_farrowing_date: e.target.value })} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Fecha de confirmación</label>
          <input type="date" value={form.confirmed_date} onChange={(e) => setForm({ ...form, confirmed_date: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Resultado de ecografía</label>
          <select value={form.ultrasound_result} onChange={(e) => setForm({ ...form, ultrasound_result: e.target.value })}>
            <option value="">Sin realizar</option>
            <option value="true">Positivo</option>
            <option value="false">Negativo</option>
          </select>
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Actualizar gestación' : 'Registrar gestación'}</button>
      </div>
    </form>
  )
}
