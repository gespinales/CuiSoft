import { useState, useEffect } from 'react'
import { health } from '../services/api'
import { Plus } from 'lucide-react'
import { fmt, formatDate } from '../utils/format'
import Modal from '../components/Modal'
import VaccinationForm from '../components/VaccinationForm'
import TreatmentForm from '../components/TreatmentForm'
import MortalityForm from '../components/MortalityForm'
import VaccineForm from '../components/VaccineForm'

type Tab = 'vaccinations' | 'treatments' | 'mortality' | 'vaccines'

export default function Health() {
  const [tab, setTab] = useState<Tab>('vaccinations')
  const [vaccinations, setVaccinations] = useState<any[]>([])
  const [treatments, setTreatments] = useState<any[]>([])
  const [mortalities, setMortalities] = useState<any[]>([])
  const [vaccines, setVaccines] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [modalType, setModalType] = useState('')

  useEffect(() => {
    health.records.list().then((r) => setVaccinations(r.data.results || r.data))
    health.treatments.list().then((r) => setTreatments(r.data.results || r.data))
    health.mortality.list().then((r) => setMortalities(r.data.results || r.data))
    health.vaccines.list().then((r) => setVaccines(r.data.results || r.data))
  }, [])

  const openForm = (type: string) => { setModalType(type); setModal(true) }
  const handleSave = () => { setModal(false); window.location.reload() }

  const renderForm = () => {
    switch (modalType) {
      case 'vaccination': return <VaccinationForm onSave={handleSave} onCancel={() => setModal(false)} />
      case 'treatment': return <TreatmentForm onSave={handleSave} onCancel={() => setModal(false)} />
      case 'mortality': return <MortalityForm onSave={handleSave} onCancel={() => setModal(false)} />
      case 'vaccine': return <VaccineForm onSave={handleSave} onCancel={() => setModal(false)} />
      default: return null
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Salud</h2>
          <p>Control de vacunación, tratamientos y mortalidad</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {tab === 'vaccines' && (
            <button className="btn btn-primary" onClick={() => openForm('vaccine')}><Plus size={18} /> Nueva vacuna</button>
          )}
          {tab === 'vaccinations' && (
            <button className="btn btn-primary" onClick={() => openForm('vaccination')}><Plus size={18} /> Nueva vacunación</button>
          )}
          {tab === 'treatments' && (
            <button className="btn btn-primary" onClick={() => openForm('treatment')}><Plus size={18} /> Nuevo tratamiento</button>
          )}
          {tab === 'mortality' && (
            <button className="btn btn-primary" onClick={() => openForm('mortality')}><Plus size={18} /> Registrar mortalidad</button>
          )}
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'vaccinations' ? 'active' : ''}`} onClick={() => setTab('vaccinations')}>Vacunación</button>
        <button className={`tab ${tab === 'treatments' ? 'active' : ''}`} onClick={() => setTab('treatments')}>Tratamientos</button>
        <button className={`tab ${tab === 'mortality' ? 'active' : ''}`} onClick={() => setTab('mortality')}>Mortalidad</button>
        <button className={`tab ${tab === 'vaccines' ? 'active' : ''}`} onClick={() => setTab('vaccines')}>Vacunas</button>
      </div>

      {tab === 'vaccinations' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Cerdo</th><th>Vacuna</th><th>Fecha</th><th>Dosis</th><th>Aplicado por</th><th>Próxima dosis</th></tr>
            </thead>
            <tbody>
              {vaccinations.length === 0 ? (
                <tr><td colSpan={6} className="text-center">Sin registros de vacunación</td></tr>
              ) : vaccinations.map((v: any) => (
                <tr key={v.id}>
                  <td>{v.pig_name}</td><td>{v.vaccine_name}</td><td>{formatDate(v.application_date)}</td>
                  <td>{v.dose_ml ? `${fmt(v.dose_ml)} ml` : '-'}</td><td>{v.applied_by || '-'}</td>
                  <td>{formatDate(v.next_due_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'treatments' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Cerdo</th><th>Tipo</th><th>Medicamento</th><th>Inicio</th><th>Fin</th><th>Diagnóstico</th></tr>
            </thead>
            <tbody>
              {treatments.length === 0 ? (
                <tr><td colSpan={6} className="text-center">Sin tratamientos registrados</td></tr>
              ) : treatments.map((t: any) => (
                <tr key={t.id}>
                  <td>{t.pig_name}</td><td>{t.treatment_type}</td><td>{t.medication}</td>
                  <td>{formatDate(t.start_date)}</td><td>{formatDate(t.end_date)}</td><td>{t.diagnosis || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'mortality' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Cerdo</th><th>Fecha</th><th>Causa</th><th>Edad</th><th>Necropsia</th></tr>
            </thead>
            <tbody>
              {mortalities.length === 0 ? (
                <tr><td colSpan={5} className="text-center">Sin registros de mortalidad</td></tr>
              ) : mortalities.map((m: any) => (
                <tr key={m.id}>
                  <td>{m.pig_name}</td><td>{formatDate(m.death_date)}</td><td>{m.cause}</td>
                  <td>{m.age_days} días</td><td>{m.necropsy_performed ? 'Sí' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'vaccines' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Nombre</th><th>Laboratorio</th><th>Lote</th></tr>
            </thead>
            <tbody>
              {vaccines.length === 0 ? (
                <tr><td colSpan={3} className="text-center">No hay vacunas registradas</td></tr>
              ) : vaccines.map((v: any) => (
                <tr key={v.id}><td><strong>{v.name}</strong></td><td>{v.laboratory || '-'}</td><td>{v.lot_number || '-'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Nuevo registro">
        {renderForm()}
      </Modal>
    </div>
  )
}
