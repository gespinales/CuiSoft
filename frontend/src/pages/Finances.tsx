import { useState, useEffect } from 'react'
import { finances, reports } from '../services/api'
import { formatDate } from '../utils/format'
import WorkerPaymentForm from '../components/WorkerPaymentForm'
import ExpenseForm from '../components/ExpenseForm'
import Modal from '../components/Modal'

export default function Finances() {
  const [workerPayments, setWorkerPayments] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showWorkerForm, setShowWorkerForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [editingWorker, setEditingWorker] = useState<any>(null)
  const [editingExpense, setEditingExpense] = useState<any>(null)
  const [tab, setTab] = useState<'workers' | 'expenses'>('workers')
  const [deleting, setDeleting] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [wpRes, expRes, sumRes] = await Promise.all([
        finances.workerPayments.list(),
        finances.expenses.list(),
        reports.financialSummary(),
      ])
      setWorkerPayments(wpRes.data.results ?? wpRes.data)
      setExpenses(expRes.data.results ?? expRes.data)
      setSummary(sumRes.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDeleteWorker = async (id: number) => {
    if (!confirm('¿Eliminar este pago?')) return
    setDeleting(id)
    await finances.workerPayments.delete(id)
    setDeleting(null)
    load()
  }

  const handleDeleteExpense = async (id: number) => {
    if (!confirm('¿Eliminar este gasto?')) return
    setDeleting(id)
    await finances.expenses.delete(id)
    setDeleting(null)
    load()
  }

  if (loading && workerPayments.length === 0) {
    return <div className="loading">Cargando finanzas...</div>
  }

  return (
    <div className="page">
      <h1>Finanzas</h1>

      {summary && (
        <div className="cards-grid">
          <div className="card">
            <h3>Ingresos (Mes)</h3>
            <p className="stat-value positive">Q {summary.month_income.toFixed(2)}</p>
          </div>
          <div className="card">
            <h3>Costos (Mes)</h3>
            <p className="stat-value negative">Q {summary.month_costs.toFixed(2)}</p>
          </div>
          <div className="card">
            <h3>Ganancia Neta (Mes)</h3>
            <p className={`stat-value ${summary.month_net >= 0 ? 'positive' : 'negative'}`}>
              Q {summary.month_net.toFixed(2)}
            </p>
          </div>
          <div className="card">
            <h3>Ganancia Neta (Total)</h3>
            <p className={`stat-value ${summary.total_net >= 0 ? 'positive' : 'negative'}`}>
              Q {summary.total_net.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${tab === 'workers' ? 'active' : ''}`} onClick={() => setTab('workers')}>
          Pagos a Trabajadores
        </button>
        <button className={`tab ${tab === 'expenses' ? 'active' : ''}`} onClick={() => setTab('expenses')}>
          Gastos Varios
        </button>
      </div>

      <Modal open={showWorkerForm} onClose={() => { setShowWorkerForm(false); setEditingWorker(null) }}
        title={editingWorker ? 'Editar pago' : 'Nuevo pago'}>
        <WorkerPaymentForm
          record={editingWorker}
          onSave={() => { setShowWorkerForm(false); setEditingWorker(null); load() }}
          onCancel={() => { setShowWorkerForm(false); setEditingWorker(null) }}
        />
      </Modal>

      <Modal open={showExpenseForm} onClose={() => { setShowExpenseForm(false); setEditingExpense(null) }}
        title={editingExpense ? 'Editar gasto' : 'Nuevo gasto'}>
        <ExpenseForm
          record={editingExpense}
          onSave={() => { setShowExpenseForm(false); setEditingExpense(null); load() }}
          onCancel={() => { setShowExpenseForm(false); setEditingExpense(null) }}
        />
      </Modal>

      {tab === 'workers' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <button className="btn btn-primary" onClick={() => { setEditingWorker(null); setShowWorkerForm(true) }}>
              + Nuevo Pago
            </button>
          </div>
          {workerPayments.length === 0 ? (
            <p className="empty-state">No hay pagos registrados</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Trabajador</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                  <th>Frecuencia</th>
                  <th>Período</th>
                  <th>Notas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {workerPayments.map((wp) => (
                  <tr key={wp.id}>
                    <td>{wp.worker_name}</td>
                    <td>Q {Number(wp.amount).toFixed(2)}</td>
                    <td>{formatDate(wp.payment_date)}</td>
                    <td>{wp.frequency_display}</td>
                    <td>{formatDate(wp.period_start)} a {formatDate(wp.period_end)}</td>
                    <td>{wp.notes || '-'}</td>
                    <td>
                      <button className="btn btn-sm" onClick={() => { setEditingWorker(wp); setShowWorkerForm(true) }}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteWorker(wp.id)} disabled={deleting === wp.id}>
                        {deleting === wp.id ? '...' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {tab === 'expenses' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <button className="btn btn-primary" onClick={() => { setEditingExpense(null); setShowExpenseForm(true) }}>
              + Nuevo Gasto
            </button>
          </div>
          {expenses.length === 0 ? (
            <p className="empty-state">No hay gastos registrados</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                  <th>Notas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td>{exp.description || '-'}</td>
                    <td>{exp.category_display}</td>
                    <td>Q {Number(exp.amount).toFixed(2)}</td>
                    <td>{formatDate(exp.date)}</td>
                    <td>{exp.notes || '-'}</td>
                    <td>
                      <button className="btn btn-sm" onClick={() => { setEditingExpense(exp); setShowExpenseForm(true) }}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteExpense(exp.id)} disabled={deleting === exp.id}>
                        {deleting === exp.id ? '...' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  )
}
