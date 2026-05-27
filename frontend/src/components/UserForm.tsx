import { useState } from 'react'
import { auth } from '../services/api'

interface UserFormProps {
  user?: any
  onSave: () => void
  onCancel: () => void
}

export default function UserForm({ user, onSave, onCancel }: UserFormProps) {
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    role: user?.role || 'operator',
    phone: user?.phone || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const editing = !!user

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload: any = { ...form }
      if (!payload.password && editing) delete payload.password
      if (!editing && !payload.password) { setError('La contraseña es requerida'); setSaving(false); return }
      if (editing) {
        const { password: pwd, ...rest } = payload
        await auth.update(user.id, pwd ? payload : rest)
      } else {
        await auth.create(payload)
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
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label>Usuario *</label>
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Nombre</label>
          <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Apellido</label>
          <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>{editing ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña *'}</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editing} minLength={6} />
        </div>
        <div className="form-group">
          <label>Rol *</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required>
            <option value="admin">Administrador</option>
            <option value="veterinarian">Veterinario</option>
            <option value="manager">Encargado</option>
            <option value="operator">Operario</option>
            <option value="viewer">Visor</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Teléfono</label>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Guardando...' : editing ? 'Actualizar usuario' : 'Crear usuario'}
        </button>
      </div>
    </form>
  )
}
