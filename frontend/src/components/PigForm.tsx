import { useState, useEffect } from 'react'
import { pigs, breeds, locations } from '../services/api'

interface PigFormProps {
  pig?: any
  onSave: () => void
  onCancel: () => void
}

export default function PigForm({ pig, onSave, onCancel }: PigFormProps) {
  const [form, setForm] = useState({
    ear_tag: '',
    name: '',
    sex: 'female',
    category: 'sow',
    sow_status: '',
    breed: '',
    location: '',
    birth_date: '',
    mother: '',
    father: '',
    status: 'active',
    notes: '',
  })
  const [breedList, setBreedList] = useState<any[]>([])
  const [locationList, setLocationList] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const editing = !!pig

  useEffect(() => {
    breeds.list().then((r) => setBreedList(r.data.results || r.data))
    locations.list().then((r) => setLocationList(r.data.results || r.data))
    if (pig) {
      setForm({
        ear_tag: pig.ear_tag || '',
        name: pig.name || '',
        sex: pig.sex || 'female',
        category: pig.category || 'sow',
        sow_status: pig.sow_status || '',
        breed: pig.breed?.toString() || '',
        location: pig.location?.toString() || '',
        birth_date: pig.birth_date || '',
        mother: pig.mother?.toString() || '',
        father: pig.father?.toString() || '',
        status: pig.status || 'active',
        notes: pig.notes || '',
      })
    }
  }, [pig])

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        breed: form.breed ? Number(form.breed) : null,
        location: form.location ? Number(form.location) : null,
        mother: form.mother ? Number(form.mother) : null,
        father: form.father ? Number(form.father) : null,
        birth_date: form.birth_date || null,
      }
      if (editing) {
        await pigs.update(pig.id, payload)
      } else {
        await pigs.create(payload)
      }
      onSave()
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{typeof error === 'string' ? error : JSON.stringify(error)}</div>}

      <div className="form-row">
        <div className="form-group">
          <label>Arete / ID *</label>
          <input name="ear_tag" value={form.ear_tag} onChange={handleChange} required placeholder="Ej: CM-001" />
        </div>
        <div className="form-group">
          <label>Nombre</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre opcional" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Sexo *</label>
          <select name="sex" value={form.sex} onChange={handleChange} required>
            <option value="female">Hembra</option>
            <option value="male">Macho</option>
          </select>
        </div>
        <div className="form-group">
          <label>Categoría *</label>
          <select name="category" value={form.category} onChange={handleChange} required>
            <option value="sow">Cerda Madre</option>
            <option value="boar">Verraco</option>
            <option value="piglet">Lechón</option>
            <option value="grower">Engorde</option>
            <option value="replacement">Reemplazo</option>
          </select>
        </div>
      </div>

      {form.category === 'sow' && (
        <div className="form-row">
          <div className="form-group">
            <label>Estado reproductivo</label>
            <select name="sow_status" value={form.sow_status} onChange={handleChange}>
              <option value="">Seleccionar...</option>
              <option value="empty">Vacía</option>
              <option value="gestating">Gestante</option>
              <option value="lactating">Lactante</option>
            </select>
          </div>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label>Raza</label>
          <select name="breed" value={form.breed} onChange={handleChange}>
            <option value="">Seleccionar...</option>
            {breedList.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Ubicación</label>
          <select name="location" value={form.location} onChange={handleChange}>
            <option value="">Seleccionar...</option>
            {locationList.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Fecha de nacimiento</label>
          <input name="birth_date" type="date" value={form.birth_date} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Estado</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="active">Activo</option>
            <option value="sold">Vendido</option>
            <option value="dead">Muerto</option>
            <option value="transferred">Transferido</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Madre (ID)</label>
          <input name="mother" type="number" value={form.mother} onChange={handleChange} placeholder="ID de la madre" />
        </div>
        <div className="form-group">
          <label>Padre (ID)</label>
          <input name="father" type="number" value={form.father} onChange={handleChange} placeholder="ID del padre" />
        </div>
      </div>

      <div className="form-group">
        <label>Notas</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Notas adicionales..." />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear cerdo'}
        </button>
      </div>
    </form>
  )
}
