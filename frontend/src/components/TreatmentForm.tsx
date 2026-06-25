import { useState, useEffect } from 'react'
import { health, pigs } from '../services/api'

interface Props {
  record?: any
  onSave: () => void
  onCancel: () => void
}

export default function TreatmentForm({ record, onSave, onCancel }: Props) {
  const [form, setForm] = useState({
    pig: record?.pig?.toString() || '',
    treatment_type: record?.treatment_type || 'antibiotic',
    medication: record?.medication || '',
    start_date: record?.start_date || '',
    end_date: record?.end_date || '',
    dosage: record?.dosage || '',
    applied_by: record?.applied_by || '',
    diagnosis: record?.diagnosis || '',
    notes: record?.notes || '',
  })
  const [pigList, setPigList] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    pigs.list({ status: 'active', page_size: 100 }).then((r) => setPigList(r.data.results || r.data))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await health.treatments.create({
        ...form, pig: Number(form.pig),
        start_date: form.start_date,
        end_date: form.end_date || null,
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
          <label>Tipo *</label>
          <select value={form.treatment_type} onChange={(e) => setForm({ ...form, treatment_type: e.target.value })}>
            <option value="antibiotic">Antibiótico</option>
            <option value="antiinflammatory">Antiinflamatorio</option>
            <option value="antiparasitic">Antiparasitario</option>
            <option value="vitamin">Vitamina</option>
            <option value="other">Otro</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Medicamento *</label>
          <input value={form.medication} onChange={(e) => setForm({ ...form, medication: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Dosis</label>
          <input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Fecha inicio *</label>
          <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Fecha fin</label>
          <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
        </div>
      </div>
      <div className="form-group">
        <label>Diagnóstico</label>
        <textarea value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} rows={2} />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Registrar tratamiento'}</button>
      </div>
    </form>
  )
}
