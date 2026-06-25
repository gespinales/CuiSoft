import { useState, useEffect } from 'react'
import { health, pigs } from '../services/api'

interface Props {
  record?: any
  onSave: () => void
  onCancel: () => void
}

export default function VaccinationForm({ record, onSave, onCancel }: Props) {
  const [form, setForm] = useState({
    pig: record?.pig?.toString() || '',
    vaccine: record?.vaccine?.toString() || '',
    application_date: record?.application_date || '',
    dose_ml: record?.dose_ml?.toString() || '',
    applied_by: record?.applied_by || '',
    next_due_date: record?.next_due_date || '',
    notes: record?.notes || '',
  })
  const [vaccines, setVaccines] = useState<any[]>([])
  const [pigList, setPigList] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    health.vaccines.list().then((r) => setVaccines(r.data.results || r.data))
    pigs.list({ status: 'active', page_size: 100 }).then((r) => setPigList(r.data.results || r.data))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await health.records.create({
        pig: Number(form.pig), vaccine: Number(form.vaccine),
        application_date: form.application_date,
        dose_ml: form.dose_ml ? Number(form.dose_ml) : null,
        applied_by: form.applied_by,
        next_due_date: form.next_due_date || null,
        notes: form.notes,
      })
      onSave()
    } catch { } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Cerdo *</label>
          <select value={form.pig} onChange={(e) => setForm({ ...form, pig: e.target.value })} required>
            <option value="">Seleccionar...</option>
            {pigList.map((p: any) => <option key={p.id} value={p.id}>{p.ear_tag} - {p.name || 'Sin nombre'}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Vacuna *</label>
          <select value={form.vaccine} onChange={(e) => setForm({ ...form, vaccine: e.target.value })} required>
            <option value="">Seleccionar...</option>
            {vaccines.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Fecha de aplicación *</label>
          <input type="date" value={form.application_date} onChange={(e) => setForm({ ...form, application_date: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Dosis (ml)</label>
          <input type="number" step="0.1" value={form.dose_ml} onChange={(e) => setForm({ ...form, dose_ml: e.target.value })} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Aplicado por</label>
          <input value={form.applied_by} onChange={(e) => setForm({ ...form, applied_by: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Próxima dosis</label>
          <input type="date" value={form.next_due_date} onChange={(e) => setForm({ ...form, next_due_date: e.target.value })} />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Registrar vacunación'}</button>
      </div>
    </form>
  )
}
