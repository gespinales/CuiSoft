import { useState, useEffect } from 'react'
import { pigs } from '../services/api'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'
import PigForm from '../components/PigForm'

interface Pig {
  id: number
  ear_tag: string
  name: string
  breed_name: string
  sex: string
  category: string
  status: string
  location_name: string
  birth_date: string
  age_days: number
}

export default function Pigs() {
  const [pigList, setPigList] = useState<Pig[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState({ category: '', status: '', sex: '' })
  const [modal, setModal] = useState(false)
  const [editingPig, setEditingPig] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  useEffect(() => {
    loadPigs()
  }, [filter])

  const loadPigs = async () => {
    setLoading(true)
    try {
      const params: any = { search: search || undefined }
      if (filter.category) params.category = filter.category
      if (filter.status) params.status = filter.status
      if (filter.sex) params.sex = filter.sex
      const res = await pigs.list(params)
      setPigList(res.data.results || res.data)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingPig(null)
    setModal(true)
  }

  const openEdit = (pig: any) => {
    setEditingPig(pig)
    setModal(true)
  }

  const handleSave = () => {
    setModal(false)
    setEditingPig(null)
    loadPigs()
  }

  const handleDelete = async (id: number) => {
    try {
      await pigs.delete(id)
      setDeleteConfirm(null)
      loadPigs()
    } catch { }
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'badge-success',
      sold: 'badge-secondary',
      dead: 'badge-danger',
      transferred: 'badge-warning',
    }
    const labels: Record<string, string> = {
      active: 'Activo',
      sold: 'Vendido',
      dead: 'Muerto',
      transferred: 'Transferido',
    }
    return <span className={`badge ${colors[status] || ''}`}>{labels[status] || status}</span>
  }

  const sexLabel = (s: string) => s === 'male' ? 'Macho' : 'Hembra'

  const categoryLabel: Record<string, string> = {
    sow: 'Cerda Madre',
    boar: 'Verraco',
    piglet: 'Lechón',
    grower: 'Engorde',
    replacement: 'Reemplazo',
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Animales</h2>
          <p>Registro y control de todos los cerdos</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Nuevo cerdo
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por arete o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadPigs()}
          />
          {search && (
            <button className="search-clear" onClick={() => { setSearch(''); setTimeout(loadPigs, 0) }}>✕</button>
          )}
        </div>
        <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })}>
          <option value="">Todas las categorías</option>
          <option value="sow">Cerdas Madres</option>
          <option value="boar">Verracos</option>
          <option value="piglet">Lechones</option>
          <option value="grower">Engorde</option>
          <option value="replacement">Reemplazo</option>
        </select>
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="sold">Vendido</option>
          <option value="dead">Muerto</option>
          <option value="transferred">Transferido</option>
        </select>
        <select value={filter.sex} onChange={(e) => setFilter({ ...filter, sex: e.target.value })}>
          <option value="">Todos</option>
          <option value="female">Hembras</option>
          <option value="male">Machos</option>
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Arete</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Sexo</th>
              <th>Raza</th>
              <th>Edad</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th style={{ width: 80 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center">Cargando...</td></tr>
            ) : pigList.length === 0 ? (
              <tr><td colSpan={9} className="text-center">
                <div className="empty-table">
                  <p>No hay animales registrados</p>
                  <button className="btn btn-primary" onClick={openCreate}>Crear primer cerdo</button>
                </div>
              </td></tr>
            ) : pigList.map((pig) => (
              <tr key={pig.id}>
                <td><strong>{pig.ear_tag}</strong></td>
                <td>{pig.name || '-'}</td>
                <td>{categoryLabel[pig.category] || pig.category}</td>
                <td>{sexLabel(pig.sex)}</td>
                <td>{pig.breed_name || '-'}</td>
                <td>{pig.age_days} días</td>
                <td>{pig.location_name || '-'}</td>
                <td>{statusBadge(pig.status)}</td>
                <td>
                  <div className="action-btns">
                    <button className="btn-icon" title="Editar" onClick={() => openEdit(pig)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon btn-icon-danger" title="Eliminar" onClick={() => setDeleteConfirm(pig.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editingPig ? 'Editar cerdo' : 'Nuevo cerdo'}>
        <PigForm pig={editingPig} onSave={handleSave} onCancel={() => setModal(false)} />
      </Modal>

      <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} title="Confirmar eliminación" width="400px">
        <p>¿Estás seguro de eliminar este cerdo? Esta acción no se puede deshacer.</p>
        <div className="form-actions" style={{ marginTop: 20 }}>
          <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
          <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm!)}>Eliminar</button>
        </div>
      </Modal>
    </div>
  )
}
