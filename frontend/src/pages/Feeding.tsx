import { useState, useEffect } from 'react'
import { feeding } from '../services/api'
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react'
import { fmt } from '../utils/format'
import Modal from '../components/Modal'
import FeedInventoryForm from '../components/FeedInventoryForm'
import FeedConsumptionForm from '../components/FeedConsumptionForm'
import FeedTypeForm from '../components/FeedTypeForm'

type Tab = 'stock' | 'inventory' | 'consumption' | 'feedtypes'

export default function Feeding() {
  const [tab, setTab] = useState<Tab>('stock')
  const [stock, setStock] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [consumption, setConsumption] = useState<any[]>([])
  const [types, setTypes] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; type: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = () => {
    setLoading(true)
    Promise.all([
      feeding.stock().then((r) => setStock(r.data)),
      feeding.inventory.list().then((r) => setInventory(r.data.results || r.data)),
      feeding.consumption.list().then((r) => setConsumption(r.data.results || r.data)),
      feeding.feedTypes.list().then((r) => setTypes(r.data.results || r.data)),
    ]).finally(() => setLoading(false))
  }

  const openCreate = (type: string) => { setEditingRecord(null); setModalType(type); setModal(true) }
  const openEdit = (type: string, record: any) => { setEditingRecord(record); setModalType(type); setModal(true) }
  const handleSave = () => { setModal(false); setEditingRecord(null); loadData() }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      const { id, type } = deleteConfirm
      if (type === 'inventory') await feeding.inventory.delete(id)
      else if (type === 'consumption') await feeding.consumption.delete(id)
      else if (type === 'feedtype') await feeding.feedTypes.delete(id)
    } catch {}
    setDeleteConfirm(null)
    loadData()
  }

  const modalTitle = () => {
    if (!editingRecord) {
      switch (modalType) {
        case 'inventory': return 'Nuevo ingreso'
        case 'consumption': return 'Registrar consumo'
        case 'feedtype': return 'Nuevo alimento'
        default: return 'Nuevo registro'
      }
    }
    return 'Editar registro'
  }

  const renderForm = () => {
    const commonProps = { onSave: handleSave, onCancel: () => setModal(false) }
    switch (modalType) {
      case 'inventory': return <FeedInventoryForm record={editingRecord} {...commonProps} />
      case 'consumption': return <FeedConsumptionForm record={editingRecord} {...commonProps} />
      case 'feedtype': return <FeedTypeForm record={editingRecord} {...commonProps} />
      default: return null
    }
  }

  const stockColor = (available: number) => {
    if (available <= 0) return 'text-danger'
    if (available < 100) return 'text-warning'
    return ''
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Alimentación</h2>
          <p>Control de inventario, consumo y stock disponible</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {tab === 'inventory' && <button className="btn btn-primary" onClick={() => openCreate('inventory')}><Plus size={18} /> Nuevo ingreso</button>}
          {tab === 'consumption' && <button className="btn btn-primary" onClick={() => openCreate('consumption')}><Plus size={18} /> Registrar consumo</button>}
          {tab === 'feedtypes' && <button className="btn btn-primary" onClick={() => openCreate('feedtype')}><Plus size={18} /> Nuevo alimento</button>}
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'stock' ? 'active' : ''}`} onClick={() => setTab('stock')}>Stock Actual</button>
        <button className={`tab ${tab === 'inventory' ? 'active' : ''}`} onClick={() => setTab('inventory')}>Entradas</button>
        <button className={`tab ${tab === 'consumption' ? 'active' : ''}`} onClick={() => setTab('consumption')}>Consumo</button>
        <button className={`tab ${tab === 'feedtypes' ? 'active' : ''}`} onClick={() => setTab('feedtypes')}>Tipos</button>
      </div>

      {tab === 'stock' && (
        <div>
          <div className="cards-grid" style={{ marginBottom: 16 }}>
            {loading ? <p>Cargando...</p> : stock.map((s: any) => (
              <div key={s.id} className="card" style={{ borderTopColor: s.available <= 0 ? '#ef4444' : s.available < 100 ? '#f59e0b' : '#10b981' }}>
                <div className="card-content" style={{ flex: 1 }}>
                  <p className="card-label">{s.name}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 }}>
                    <div>
                      <small style={{ color: '#64748b' }}>Disponible</small>
                      <p className="card-value" style={{ color: s.available <= 0 ? '#ef4444' : s.available < 100 ? '#f59e0b' : '#10b981' }}>
                        {fmt(s.available)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <small style={{ color: '#64748b' }}>Valor: Q{fmt(s.stock_value)}</small>
                    </div>
                  </div>
                  <div className="stat-row" style={{ marginTop: 8 }}>
                    <span>Ingresado: {fmt(s.total_entered)}</span>
                    <span>Consumido: {fmt(s.total_consumed)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Alimento</th>
                  <th>Proveedor</th>
                  <th>Ingresado</th>
                  <th>Consumido</th>
                  <th>Disponible</th>
                  <th>Costo Unit.</th>
                  <th>Valor Stock</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={7} className="text-center">Cargando...</td></tr>
                : stock.length === 0 ? <tr><td colSpan={7} className="text-center">Sin datos de stock</td></tr>
                : stock.map((s: any) => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.supplier || '-'}</td>
                    <td>{fmt(s.total_entered)}</td>
                    <td>{fmt(s.total_consumed)}</td>
                    <td>
                      <span className={stockColor(s.available)}>
                        <strong>{fmt(s.available)}</strong>
                      </span>
                      {s.available <= 0 && <AlertTriangle size={14} style={{ marginLeft: 4, color: '#ef4444' }} />}
                    </td>
                    <td>Q{fmt(s.unit_cost)}</td>
                    <td><strong>Q{fmt(s.stock_value)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'inventory' && (
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Alimento</th><th>Cantidad</th><th>Fecha</th><th>Lote</th><th style={{ width: 80 }}>Acciones</th></tr></thead>
            <tbody>
              {inventory.length === 0 ? <tr><td colSpan={5} className="text-center">Sin registros</td></tr>
                : inventory.map((i: any) => (
                  <tr key={i.id}>
                    <td>{i.feed_type_name}</td>
                    <td><strong>{i.stock_quantity}</strong></td>
                    <td>{i.entry_date}</td>
                    <td>{i.batch_number || '-'}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon" title="Editar" onClick={() => openEdit('inventory', i)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon btn-icon-danger" title="Eliminar" onClick={() => setDeleteConfirm({ id: i.id, type: 'inventory' })}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'consumption' && (
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Alimento</th><th>Cantidad</th><th>Fecha</th><th>Cerdo</th><th style={{ width: 80 }}>Acciones</th></tr></thead>
            <tbody>
              {consumption.length === 0 ? <tr><td colSpan={5} className="text-center">Sin registros</td></tr>
                : consumption.map((c: any) => (
                  <tr key={c.id}>
                    <td>{c.feed_type_name}</td>
                    <td><strong>{c.quantity}</strong></td>
                    <td>{c.date}</td>
                    <td>{c.pig_name || '-'}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon" title="Editar" onClick={() => openEdit('consumption', c)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon btn-icon-danger" title="Eliminar" onClick={() => setDeleteConfirm({ id: c.id, type: 'consumption' })}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'feedtypes' && (
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Nombre</th><th>Proveedor</th><th>Costo unit.</th><th style={{ width: 80 }}>Acciones</th></tr></thead>
            <tbody>
              {types.length === 0 ? <tr><td colSpan={4} className="text-center">Sin tipos</td></tr>
                : types.map((t: any) => (
                  <tr key={t.id}>
                    <td><strong>{t.name}</strong></td>
                    <td>{t.supplier || '-'}</td>
                    <td>Q{fmt(t.unit_cost)}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon" title="Editar" onClick={() => openEdit('feedtype', t)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon btn-icon-danger" title="Eliminar" onClick={() => setDeleteConfirm({ id: t.id, type: 'feedtype' })}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={modalTitle()}>
        {renderForm()}
      </Modal>

      <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} title="Confirmar eliminación" width="400px">
        <p>¿Estás seguro de eliminar este registro?</p>
        <div className="form-actions" style={{ marginTop: 20 }}>
          <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
          <button className="btn btn-danger" onClick={handleDelete}>Eliminar</button>
        </div>
      </Modal>
    </div>
  )
}
