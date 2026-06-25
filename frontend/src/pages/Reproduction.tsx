import { useState, useEffect } from 'react'
import { reproduction } from '../services/api'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { fmt, formatDate } from '../utils/format'
import Modal from '../components/Modal'
import HeatForm from '../components/HeatForm'
import MatingForm from '../components/MatingForm'
import GestationForm from '../components/GestationForm'
import FarrowingForm from '../components/FarrowingForm'
import WeaningForm from '../components/WeaningForm'

type Tab = 'sows' | 'heat' | 'matings' | 'gestations' | 'farrowings' | 'weanings'

export default function Reproduction() {
  const [tab, setTab] = useState<Tab>('sows')
  const [sows, setSows] = useState<any[]>([])
  const [heats, setHeats] = useState<any[]>([])
  const [matings, setMatings] = useState<any[]>([])
  const [gestations, setGestations] = useState<any[]>([])
  const [farrowings, setFarrowings] = useState<any[]>([])
  const [weanings, setWeanings] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; type: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = () => {
    setLoading(true)
    Promise.all([
      reproduction.sowSummary().then((r) => setSows(r.data)),
      reproduction.heatDetections.list().then((r) => setHeats(r.data.results || r.data)),
      reproduction.matings.list().then((r) => setMatings(r.data.results || r.data)),
      reproduction.gestations.list().then((r) => setGestations(r.data.results || r.data)),
      reproduction.farrowings.list().then((r) => setFarrowings(r.data.results || r.data)),
      reproduction.weanings.list().then((r) => setWeanings(r.data.results || r.data)),
    ]).finally(() => setLoading(false))
  }

  const openCreate = (type: string) => { setEditingRecord(null); setModalType(type); setModal(true) }
  const openEdit = (type: string, record: any) => { setEditingRecord(record); setModalType(type); setModal(true) }
  const handleSave = () => { setModal(false); setEditingRecord(null); loadData() }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      const { id, type } = deleteConfirm
      if (type === 'heat') await reproduction.heatDetections.delete(id)
      else if (type === 'mating') await reproduction.matings.delete(id)
      else if (type === 'gestation') await reproduction.gestations.delete(id)
      else if (type === 'farrowing') await reproduction.farrowings.delete(id)
      else if (type === 'weaning') await reproduction.weanings.delete(id)
    } catch {}
    setDeleteConfirm(null)
    loadData()
  }

  const modalTitle = () => {
    if (!editingRecord) {
      switch (modalType) {
        case 'heat': return 'Nuevo celo'
        case 'mating': return 'Nueva monta'
        case 'gestation': return 'Nueva gestación'
        case 'farrowing': return 'Nuevo parto'
        case 'weaning': return 'Nuevo destete'
        default: return 'Nuevo registro'
      }
    }
    return 'Editar registro'
  }

  const renderForm = () => {
    const commonProps = { onSave: handleSave, onCancel: () => setModal(false) }
    switch (modalType) {
      case 'heat': return <HeatForm record={editingRecord} {...commonProps} />
      case 'mating': return <MatingForm record={editingRecord} {...commonProps} />
      case 'gestation': return <GestationForm record={editingRecord} {...commonProps} />
      case 'farrowing': return <FarrowingForm record={editingRecord} {...commonProps} />
      case 'weaning': return <WeaningForm record={editingRecord} {...commonProps} />
      default: return null
    }
  }

  const getModalType = (t: Tab) => {
    if (t === 'heat') return 'heat'
    if (t === 'matings') return 'mating'
    if (t === 'gestations') return 'gestation'
    if (t === 'farrowings') return 'farrowing'
    if (t === 'weanings') return 'weaning'
    return ''
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'sows', label: 'Resumen de Cerdas' },
    { key: 'heat', label: 'Detect. Celo' },
    { key: 'matings', label: 'Montas' },
    { key: 'gestations', label: 'Gestaciones' },
    { key: 'farrowings', label: 'Partos' },
    { key: 'weanings', label: 'Destetes' },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Reproducción</h2>
          <p>Control de ciclo reproductivo de las cerdas</p>
        </div>
        {tab !== 'sows' && (
          <button className="btn btn-primary" onClick={() => openCreate(getModalType(tab))}>
            <Plus size={18} /> Nuevo registro
          </button>
        )}
      </div>

      <div className="tabs">
        {tabs.map((t) => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <p className="text-center" style={{ margin: 32 }}>Cargando...</p> : (
        <>
          {tab === 'sows' && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Cerda</th>
                    <th>Última Monta</th>
                    <th>Último Parto</th>
                    <th>Lechones</th>
                    <th>¿Gestante?</th>
                    <th>Parto Esperado</th>
                    <th>Ubicación</th>
                  </tr>
                </thead>
                <tbody>
                  {sows.length === 0 ? (
                    <tr><td colSpan={7} className="text-center">No hay cerdas registradas</td></tr>
                  ) : sows.map((sow) => (
                    <tr key={sow.sow_id}>
                      <td><strong>{sow.ear_tag}</strong></td>
                      <td>{formatDate(sow.last_mating_date)}</td>
                      <td>{formatDate(sow.last_farrowing_date)}</td>
                      <td>{sow.piglets_alive}</td>
                      <td>{sow.is_pregnant ? <span className="badge badge-success">Sí</span> : <span className="badge badge-secondary">No</span>}</td>
                      <td>{formatDate(sow.expected_farrowing)}</td>
                      <td>{sow.location || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'heat' && (
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Cerda</th><th>Fecha</th><th>Intensidad</th><th>Detectado por</th><th>¿Montada?</th><th style={{ width: 80 }}>Acciones</th></tr></thead>
                <tbody>
                  {heats.length === 0 ? <tr><td colSpan={6} className="text-center">Sin registros</td></tr>
                    : heats.map((h: any) => (
                      <tr key={h.id}>
                        <td>{h.sow_name}</td><td>{formatDate(h.heat_date)}</td><td>{h.intensity_display || h.intensity}</td><td>{h.detected_by || '-'}</td><td>{h.is_mated ? 'Sí' : 'No'}</td>
                        <td>
                          <div className="action-btns">
                            <button className="btn-icon" title="Editar" onClick={() => openEdit('heat', h)}><Edit2 size={16} /></button>
                            <button className="btn-icon btn-icon-danger" title="Eliminar" onClick={() => setDeleteConfirm({ id: h.id, type: 'heat' })}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'matings' && (
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Cerda</th><th>Verraco</th><th>Fecha</th><th>Tipo</th><th>Técnico</th><th>Exitosa</th><th style={{ width: 80 }}>Acciones</th></tr></thead>
                <tbody>
                  {matings.length === 0 ? <tr><td colSpan={7} className="text-center">Sin registros</td></tr>
                    : matings.map((m: any) => (
                      <tr key={m.id}>
                        <td>{m.sow_name}</td><td>{m.boar_name || '-'}</td><td>{formatDate(m.mating_date)}</td><td>{m.mating_type === 'natural' ? 'Natural' : 'IA'}</td><td>{m.technician || '-'}</td><td>{m.is_successful === null ? '-' : m.is_successful ? 'Sí' : 'No'}</td>
                        <td>
                          <div className="action-btns">
                            <button className="btn-icon" title="Editar" onClick={() => openEdit('mating', m)}><Edit2 size={16} /></button>
                            <button className="btn-icon btn-icon-danger" title="Eliminar" onClick={() => setDeleteConfirm({ id: m.id, type: 'mating' })}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'gestations' && (
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Cerda</th><th>Inicio</th><th>Parto Esperado</th><th>Estado</th><th>Confirmación</th><th style={{ width: 80 }}>Acciones</th></tr></thead>
                <tbody>
                  {gestations.length === 0 ? <tr><td colSpan={6} className="text-center">Sin registros</td></tr>
                    : gestations.map((g: any) => (
                      <tr key={g.id}>
                        <td>{g.sow_name}</td><td>{formatDate(g.start_date)}</td><td>{formatDate(g.expected_farrowing_date)}</td><td>{g.status_display || g.status}</td><td>{formatDate(g.confirmed_date)}</td>
                        <td>
                          <div className="action-btns">
                            <button className="btn-icon" title="Editar" onClick={() => openEdit('gestation', g)}><Edit2 size={16} /></button>
                            <button className="btn-icon btn-icon-danger" title="Eliminar" onClick={() => setDeleteConfirm({ id: g.id, type: 'gestation' })}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'farrowings' && (
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Cerda</th><th>Fecha</th><th>Vivos</th><th>Muertos</th><th>Momif.</th><th>Total</th><th>Asistido</th><th style={{ width: 80 }}>Acciones</th></tr></thead>
                <tbody>
                  {farrowings.length === 0 ? <tr><td colSpan={8} className="text-center">Sin registros</td></tr>
                    : farrowings.map((f: any) => (
                      <tr key={f.id}>
                        <td>{f.sow_name}</td><td>{formatDate(f.farrowing_date)}</td><td><strong>{f.piglets_alive}</strong></td><td>{f.piglets_stillborn}</td><td>{f.piglets_mummies}</td><td>{f.piglets_total}</td><td>{f.assisted ? 'Sí' : 'No'}</td>
                        <td>
                          <div className="action-btns">
                            <button className="btn-icon" title="Editar" onClick={() => openEdit('farrowing', f)}><Edit2 size={16} /></button>
                            <button className="btn-icon btn-icon-danger" title="Eliminar" onClick={() => setDeleteConfirm({ id: f.id, type: 'farrowing' })}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'weanings' && (
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Cerda</th><th>Fecha</th><th>Destetados</th><th>Peso Prom.</th><th>Edad (días)</th><th style={{ width: 80 }}>Acciones</th></tr></thead>
                <tbody>
                  {weanings.length === 0 ? <tr><td colSpan={6} className="text-center">Sin registros</td></tr>
                    : weanings.map((w: any) => (
                      <tr key={w.id}>
                        <td>{w.sow_name}</td><td>{formatDate(w.weaning_date)}</td><td><strong>{w.piglets_weaned}</strong></td><td>{w.avg_weight_kg ? `${fmt(w.avg_weight_kg)} kg` : '-'}</td><td>{w.age_days}</td>
                        <td>
                          <div className="action-btns">
                            <button className="btn-icon" title="Editar" onClick={() => openEdit('weaning', w)}><Edit2 size={16} /></button>
                            <button className="btn-icon btn-icon-danger" title="Eliminar" onClick={() => setDeleteConfirm({ id: w.id, type: 'weaning' })}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </>
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
