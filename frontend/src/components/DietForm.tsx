import { useState, useEffect } from 'react'
import { feeding } from '../services/api'

interface DietFormProps {
  record?: any
  onSave: () => void
  onCancel: () => void
}

const CATEGORIES = [
  { value: 'sow', label: 'Cerda Madre' },
  { value: 'boar', label: 'Verraco' },
  { value: 'piglet', label: 'Lechón' },
  { value: 'grower', label: 'Cerdo Engorde' },
  { value: 'replacement', label: 'Reemplazo' },
]

export default function DietForm({ record, onSave, onCancel }: DietFormProps) {
  const [form, setForm] = useState({
    name: record?.name || '',
    feed_type: record?.feed_type?.toString() || '',
    pig_category: record?.pig_category || '',
    sow_status: record?.sow_status || '',
    daily_amount_per_pig: record?.daily_amount_per_pig?.toString() || '',
    description: record?.description || '',
    is_active: record?.is_active ?? true,
  })
  const [types, setTypes] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const editing = !!record

  useEffect(() => { feeding.feedTypes.list().then((r) => setTypes(r.data.results || r.data)) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        name: form.name,
        feed_type: Number(form.feed_type),
        pig_category: form.pig_category,
        sow_status: form.pig_category === 'sow' ? form.sow_status : null,
        daily_amount_per_pig: Number(form.daily_amount_per_pig),
        description: form.description,
        is_active: form.is_active,
      }
      if (editing) {
        await feeding.diets.update(record.id, payload)
      } else {
        await feeding.diets.create(payload)
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
          <label>Nombre *</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Alimento *</label>
          <select value={form.feed_type} onChange={(e) => setForm({ ...form, feed_type: e.target.value })} required>
            <option value="">Seleccionar...</option>
            {types.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Categoría de cerdo *</label>
          <select value={form.pig_category} onChange={(e) => setForm({ ...form, pig_category: e.target.value })} required>
            <option value="">Seleccionar...</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        {form.pig_category === 'sow' ? (
          <div className="form-group">
            <label>Estado reproductivo</label>
            <select value={form.sow_status} onChange={(e) => setForm({ ...form, sow_status: e.target.value })}>
              <option value="">Seleccionar...</option>
              <option value="gestating">Gestante</option>
              <option value="lactating">Lactante</option>
            </select>
          </div>
        ) : (
          <div className="form-group" />
        )}
        <div className="form-group">
          <label>Cantidad diaria (lb) *</label>
          <input type="number" step="0.01" min="0" value={form.daily_amount_per_pig} onChange={(e) => setForm({ ...form, daily_amount_per_pig: e.target.value })} required />
        </div>
      </div>
      <div className="form-group">
        <label>Descripción</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
      </div>
      <div className="form-group">
        <label>
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
          {' '}Dieta activa
        </label>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Actualizar dieta' : 'Crear dieta'}</button>
      </div>
    </form>
  )
}
