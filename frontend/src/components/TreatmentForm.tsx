import { useState } from 'react'
import { health } from '../services/api'

export default function TreatmentForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ pig: '', treatment_type: 'antibiotic', medication: '', start_date: '', end_date: '', dosage: '', applied_by: '', diagnosis: '', notes: '' })
  const [saving, setSaving] = useState(false)

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
          <label>ID del Cerdo *</label>
          <input type="number" value={form.pig} onChange={(e) => setForm({ ...form, pig: e.target.value })} required />
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
