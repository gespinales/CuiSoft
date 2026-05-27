import { useState, useEffect } from 'react'
import { reproduction, pigs } from '../services/api'

interface MatingFormProps {
  record?: any
  onSave: () => void
  onCancel: () => void
}

export default function MatingForm({ record, onSave, onCancel }: MatingFormProps) {
  const [form, setForm] = useState({
    sow: record?.sow?.toString() || '',
    boar: record?.boar?.toString() || '',
    mating_type: record?.mating_type || 'natural',
    mating_date: record?.mating_date || '',
    time_of_day: record?.time_of_day || '',
    semen_source: record?.semen_source || '',
    technician: record?.technician || '',
    is_successful: record?.is_successful ?? '',
    notes: record?.notes || '',
  })
  const [sows, setSows] = useState<any[]>([])
  const [boars, setBoars] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const editing = !!record

  useEffect(() => {
    pigs.list({ sex: 'female', category: 'sow', status: 'active', page_size: 100 })
      .then((r) => setSows(r.data.results || r.data))
    pigs.list({ sex: 'male', category: 'boar', status: 'active', page_size: 100 })
      .then((r) => setBoars(r.data.results || r.data))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        sow: Number(form.sow),
        boar: form.boar ? Number(form.boar) : null,
        is_successful: form.is_successful === '' ? null : form.is_successful,
      }
      if (editing) {
        await reproduction.matings.update(record.id, payload)
      } else {
        await reproduction.matings.create(payload)
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
          <label>Verraco</label>
          <select value={form.boar} onChange={(e) => setForm({ ...form, boar: e.target.value })}>
            <option value="">Seleccionar...</option>
            {boars.map((b: any) => <option key={b.id} value={b.id}>{b.ear_tag} - {b.name || 'Sin nombre'}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Fecha de monta *</label>
          <input type="date" value={form.mating_date} onChange={(e) => setForm({ ...form, mating_date: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Tipo</label>
          <select value={form.mating_type} onChange={(e) => setForm({ ...form, mating_type: e.target.value })}>
            <option value="natural">Monta natural</option>
            <option value="artificial">Inseminación artificial</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Horario</label>
          <select value={form.time_of_day} onChange={(e) => setForm({ ...form, time_of_day: e.target.value })}>
            <option value="">Seleccionar...</option>
            <option value="morning">Mañana</option>
            <option value="afternoon">Tarde</option>
          </select>
        </div>
        <div className="form-group">
          <label>Fuente de semen</label>
          <input value={form.semen_source} onChange={(e) => setForm({ ...form, semen_source: e.target.value })} />
        </div>
      </div>
      <div className="form-group">
        <label>Técnico</label>
        <input value={form.technician} onChange={(e) => setForm({ ...form, technician: e.target.value })} />
      </div>
      <div className="form-group">
        <label>¿Exitosa?</label>
        <select value={form.is_successful} onChange={(e) => setForm({ ...form, is_successful: e.target.value === 'true' ? true : e.target.value === 'false' ? false : '' })}>
          <option value="">Sin definir</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Actualizar monta' : 'Registrar monta'}</button>
      </div>
    </form>
  )
}
