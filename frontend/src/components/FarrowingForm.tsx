import { useState } from 'react'
import { reproduction } from '../services/api'

export default function FarrowingForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    sow: '', farrowing_date: '', piglets_alive: '0', piglets_stillborn: '0',
    piglets_mummies: '0', assisted: 'false', attended_by: '', notes: '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await reproduction.farrowings.create({
        ...form,
        sow: Number(form.sow),
        piglets_alive: Number(form.piglets_alive),
        piglets_stillborn: Number(form.piglets_stillborn),
        piglets_mummies: Number(form.piglets_mummies),
        assisted: form.assisted === 'true',
      })
      onSave()
    } catch { } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>ID de la Cerda *</label>
          <input name="sow" type="number" value={form.sow} onChange={(e) => setForm({ ...form, sow: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Fecha de parto *</label>
          <input name="farrowing_date" type="date" value={form.farrowing_date} onChange={(e) => setForm({ ...form, farrowing_date: e.target.value })} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Lechones vivos *</label>
          <input name="piglets_alive" type="number" min="0" value={form.piglets_alive} onChange={(e) => setForm({ ...form, piglets_alive: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Nacidos muertos</label>
          <input name="piglets_stillborn" type="number" min="0" value={form.piglets_stillborn} onChange={(e) => setForm({ ...form, piglets_stillborn: e.target.value })} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Momificados</label>
          <input name="piglets_mummies" type="number" min="0" value={form.piglets_mummies} onChange={(e) => setForm({ ...form, piglets_mummies: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Parto asistido</label>
          <select name="assisted" value={form.assisted} onChange={(e) => setForm({ ...form, assisted: e.target.value })}>
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Atendido por</label>
        <input name="attended_by" value={form.attended_by} onChange={(e) => setForm({ ...form, attended_by: e.target.value })} />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Registrar parto'}</button>
      </div>
    </form>
  )
}
