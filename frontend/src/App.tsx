import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Pigs from './pages/Pigs'
import Reproduction from './pages/Reproduction'
import Health from './pages/Health'
import Feeding from './pages/Feeding'
import Sales from './pages/Sales'
import Users from './pages/Users'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/animals" element={<Pigs />} />
            <Route path="/reproduction" element={<Reproduction />} />
            <Route path="/health" element={<Health />} />
            <Route path="/feeding" element={<Feeding />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/users" element={<Users />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
