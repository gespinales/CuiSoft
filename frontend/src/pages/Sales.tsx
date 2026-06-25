import { useState, useEffect } from 'react'
import { sales } from '../services/api'
import { Plus } from 'lucide-react'
import { fmt, formatDate } from '../utils/format'
import Modal from '../components/Modal'
import CustomerForm from '../components/CustomerForm'
import SaleForm from '../components/SaleForm'

type Tab = 'customers' | 'sales' | 'growout'

export default function SalesPage() {
  const [tab, setTab] = useState<Tab>('customers')
  const [customers, setCustomers] = useState<any[]>([])
  const [salesList, setSalesList] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [modalType, setModalType] = useState('')

  useEffect(() => {
    sales.customers.list().then((r) => setCustomers(r.data.results || r.data))
    sales.sales.list().then((r) => setSalesList(r.data.results || r.data))
    sales.growOut.list().then((r) => setBatches(r.data.results || r.data))
  }, [])

  const openForm = (type: string) => { setModalType(type); setModal(true) }
  const handleSave = () => { setModal(false); window.location.reload() }

  const renderForm = () => {
    switch (modalType) {
      case 'customer': return <CustomerForm onSave={handleSave} onCancel={() => setModal(false)} />
      case 'sale': return <SaleForm onSave={handleSave} onCancel={() => setModal(false)} />
      default: return null
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Ventas y Engorde</h2>
          <p>Gestión de clientes, ventas y lotes de engorde</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {tab === 'customers' && <button className="btn btn-primary" onClick={() => openForm('customer')}><Plus size={18} /> Nuevo cliente</button>}
          {tab === 'sales' && <button className="btn btn-primary" onClick={() => openForm('sale')}><Plus size={18} /> Nueva venta</button>}
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'customers' ? 'active' : ''}`} onClick={() => setTab('customers')}>Clientes</button>
        <button className={`tab ${tab === 'sales' ? 'active' : ''}`} onClick={() => setTab('sales')}>Ventas</button>
        <button className={`tab ${tab === 'growout' ? 'active' : ''}`} onClick={() => setTab('growout')}>Lotes de Engorde</button>
      </div>

      {tab === 'customers' && (
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Nombre</th><th>Teléfono</th><th>Email</th><th>Dirección</th></tr></thead>
            <tbody>
              {customers.length === 0 ? <tr><td colSpan={4} className="text-center">No hay clientes registrados</td></tr>
                : customers.map((c: any) => (
                  <tr key={c.id}><td><strong>{c.name}</strong></td><td>{c.phone || '-'}</td><td>{c.email || '-'}</td><td>{c.address || '-'}</td></tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'sales' && (
        <div className="table-container">
          <table className="table">
            <thead><tr><th>#</th><th>Cliente</th><th>Fecha</th><th>Monto</th><th>Estado</th><th>Pago</th></tr></thead>
            <tbody>
              {salesList.length === 0 ? <tr><td colSpan={6} className="text-center">No hay ventas registradas</td></tr>
                : salesList.map((s: any) => (
                  <tr key={s.id}>
                    <td>#{s.id}</td><td>{s.customer_name}</td><td>{formatDate(s.sale_date)}</td>
                    <td><strong>Q{fmt(s.total_amount)}</strong></td>
                    <td><span className={`badge ${s.status === 'completed' ? 'badge-success' : s.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>{s.status}</span></td>
                    <td>{s.payment_method || '-'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'growout' && (
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Lote</th><th>Cerdos</th><th>Inicio</th><th>Peso inicio</th><th>Peso objetivo</th><th>Estado</th></tr></thead>
            <tbody>
              {batches.length === 0 ? <tr><td colSpan={6} className="text-center">No hay lotes de engorde</td></tr>
                : batches.map((b: any) => (
                  <tr key={b.id}>
                    <td><strong>{b.name}</strong></td><td>{b.pigs_count}</td><td>{formatDate(b.start_date)}</td>
                    <td>{b.avg_start_weight ? `${fmt(b.avg_start_weight)} kg` : '-'}</td>
                    <td>{b.target_weight ? `${fmt(b.target_weight)} kg` : '-'}</td>
                    <td>{b.status}</td>
                  </tr>
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
