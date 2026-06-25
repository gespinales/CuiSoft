import { useState, useEffect } from 'react'
import { reports } from '../services/api'
import { PiggyBank, Baby, Syringe, Warehouse, TrendingUp, DollarSign } from 'lucide-react'
import { fmt } from '../utils/format'

interface DashboardData {
  total_sows: number
  active_sows: number
  pregnant_sows: number
  total_boars: number
  total_piglets: number
  piglets_last_30_days: number
  weaned_last_30_days: number
  mortality_last_30_days: number
  active_growers: number
  pending_vaccinations: number
  feed_stock_value: number
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [finSummary, setFinSummary] = useState<any>(null)

  useEffect(() => {
    reports.dashboard().then((res) => setData(res.data))
    reports.financialSummary().then((res) => setFinSummary(res.data))
  }, [])

  if (!data) return <div className="loading">Cargando dashboard...</div>

  const cards = [
    { icon: PiggyBank, label: 'Cerdas Activas', value: data.active_sows, color: '#3b82f6' },
    { icon: Baby, label: 'Gestantes', value: data.pregnant_sows, color: '#8b5cf6' },
    { icon: Baby, label: 'Lechones (30d)', value: data.piglets_last_30_days, color: '#10b981' },
    { icon: TrendingUp, label: 'Destetados (30d)', value: data.weaned_last_30_days, color: '#f59e0b' },
    { icon: Syringe, label: 'Vacunación Pendiente', value: data.pending_vaccinations, color: '#ef4444' },
    { icon: Warehouse, label: 'Engorde Activo', value: data.active_growers, color: '#14b8a6' },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Resumen general de la granja</p>
      </div>

      <div className="cards-grid">
        {cards.map((card) => (
          <div key={card.label} className="card" style={{ borderTopColor: card.color }}>
            <div className="card-icon" style={{ backgroundColor: card.color + '20', color: card.color }}>
              <card.icon size={24} />
            </div>
            <div className="card-content">
              <p className="card-value">{card.value}</p>
              <p className="card-label">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Inventario General</h3>
          <div className="stat-list">
            <div className="stat-row">
              <span>Total cerdas</span>
              <strong>{data.total_sows}</strong>
            </div>
            <div className="stat-row">
              <span>Verracos</span>
              <strong>{data.total_boars}</strong>
            </div>
            <div className="stat-row">
              <span>Total lechones</span>
              <strong>{data.total_piglets}</strong>
            </div>
            <div className="stat-row">
              <span>Mortalidad (30d)</span>
              <strong className="text-danger">{data.mortality_last_30_days}</strong>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Finanzas</h3>
          <div className="stat-list">
            <div className="stat-row">
              <span>Valor inventario alimento</span>
              <strong>Q{fmt(data.feed_stock_value)}</strong>
            </div>
            {finSummary && (
              <>
                <div className="stat-row">
                  <span>Ingresos (mes)</span>
                  <strong className="text-success">Q{fmt(finSummary.month_income)}</strong>
                </div>
                <div className="stat-row">
                  <span>Costos (mes)</span>
                  <strong className="text-danger">Q{fmt(finSummary.month_costs)}</strong>
                </div>
                <div className="stat-row">
                  <span>Ganancia Neta (mes)</span>
                  <strong className={finSummary.month_net >= 0 ? 'text-success' : 'text-danger'}>
                    Q{fmt(finSummary.month_net)}
                  </strong>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
