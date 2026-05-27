import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, PiggyBank, Heart, Syringe, Wheat, DollarSign, Users, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/animals', icon: PiggyBank, label: 'Animales' },
  { to: '/reproduction', icon: Heart, label: 'Reproducción' },
  { to: '/health', icon: Syringe, label: 'Salud' },
  { to: '/feeding', icon: Wheat, label: 'Alimentación' },
  { to: '/sales', icon: DollarSign, label: 'Ventas' },
  { to: '/users', icon: Users, label: 'Usuarios', adminOnly: true },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { logout, user } = useAuth()

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <h1 className="sidebar-title">PigFarm ERP</h1>}
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          if (item.adminOnly && user?.role !== 'admin') return null
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          {!collapsed && (
            <div>
              <p className="user-name">{user?.first_name || user?.username}</p>
              <p className="user-role">{user?.role}</p>
            </div>
          )}
        </div>
        <button className="nav-item logout-btn" onClick={logout}>
          <LogOut size={20} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  )
}
