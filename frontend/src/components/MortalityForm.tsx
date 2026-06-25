import { useState, useEffect } from 'react'
import { health, pigs } from '../services/api'

interface Props {
  record?: any
  onSave: () => void
  onCancel: () => void
}

export default function MortalityForm({ record, onSave, onCancel }: Props) {
  const [form, setForm] = useState({
    pig: record?.pig?.toString() || '',
    death_date: record?.death_date || '',
    cause: record?.cause || 'unknown',
    necropsy_performed: record?.necropsy_performed ? 'true' : 'false',
    necropsy_results: record?.necropsy_results || '',
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
      await health.mortality.create({ ...form, pig: Number(form.pig), necropsy_performed: form.necropsy_performed === 'true' })
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
          <label>Fecha de muerte *</label>
          <input type="date" value={form.death_date} onChange={(e) => setForm({ ...form, death_date: e.target.value })} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Causa</label>
          <select value={form.cause} onChange={(e) => setForm({ ...form, cause: e.target.value })}>
            <option value="disease">Enfermedad</option>
            <option value="crushed">Aplastamiento</option>
            <option value="diarrhea">Diarrea</option>
            <option value="respiratory">Problema respiratorio</option>
            <option value="congenital">Malformación congénita</option>
            <option value="trauma">Traumatismo</option>
            <option value="unknown">Causa desconocida</option>
            <option value="other">Otro</option>
          </select>
        </div>
        <div className="form-group">
          <label>¿Necropsia?</label>
          <select value={form.necropsy_performed} onChange={(e) => setForm({ ...form, necropsy_performed: e.target.value })}>
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Registrar mortalidad'}</button>
      </div>
    </form>
  )
}
