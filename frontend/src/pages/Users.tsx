import { useState, useEffect } from 'react'
import { auth } from '../services/api'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'
import UserForm from '../components/UserForm'

export default function Users() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  useEffect(() => { loadUsers() }, [])

  const loadUsers = () => {
    setLoading(true)
    auth.list().then((r) => setUsers(r.data.results || r.data)).finally(() => setLoading(false))
  }

  const openCreate = () => { setEditingUser(null); setModal(true) }
  const openEdit = (u: any) => { setEditingUser(u); setModal(true) }

  const handleSave = () => { setModal(false); setEditingUser(null); loadUsers() }

  const handleDelete = async (id: number) => {
    try { await auth.delete(id) } catch {}
    setDeleteConfirm(null)
    loadUsers()
  }

  const roleColors: Record<string, string> = {
    admin: 'badge-danger',
    veterinarian: 'badge-primary',
    manager: 'badge-warning',
    operator: 'badge-secondary',
    viewer: 'badge',
  }

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    veterinarian: 'Veterinario',
    manager: 'Encargado',
    operator: 'Operario',
    viewer: 'Visor',
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Usuarios</h2>
          <p>Gestión de usuarios y roles del sistema</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Nuevo usuario
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th style={{ width: 80 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center">Cargando...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="text-center">No hay usuarios</td></tr>
            ) : users.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.username}</strong></td>
                <td>{[u.first_name, u.last_name].filter(Boolean).join(' ') || '-'}</td>
                <td>{u.email || '-'}</td>
                <td><span className={roleColors[u.role] || ''}>{roleLabels[u.role] || u.role}</span></td>
                <td>{u.phone || '-'}</td>
                <td>
                  {u.is_active
                    ? <span className="badge badge-success">Activo</span>
                    : <span className="badge badge-danger">Inactivo</span>}
                </td>
                <td>
                  <div className="action-btns">
                    <button className="btn-icon" title="Editar" onClick={() => openEdit(u)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon btn-icon-danger" title="Eliminar" onClick={() => setDeleteConfirm(u.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editingUser ? 'Editar usuario' : 'Nuevo usuario'}>
        <UserForm user={editingUser} onSave={handleSave} onCancel={() => setModal(false)} />
      </Modal>

      <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} title="Confirmar eliminación" width="400px">
        <p>¿Estás seguro de eliminar este usuario?</p>
        <div className="form-actions" style={{ marginTop: 20 }}>
          <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
          <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm!)}>Eliminar</button>
        </div>
      </Modal>
    </div>
  )
}
