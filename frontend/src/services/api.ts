import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem('refresh_token')
      if (refresh && error.config.url !== '/auth/token/refresh/') {
        try {
          const res = await axios.post('/api/auth/token/refresh/', { refresh })
          localStorage.setItem('access_token', res.data.access)
          error.config.headers.Authorization = `Bearer ${res.data.access}`
          return api(error.config)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      } else {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const auth = {
  login: (username: string, password: string) =>
    api.post('/auth/login/', { username, password }),
  me: () => api.get('/auth/users/me/'),
  list: () => api.get('/auth/users/'),
  create: (data: any) => api.post('/auth/users/', data),
  update: (id: number, data: any) => api.put(`/auth/users/${id}/`, data),
  delete: (id: number) => api.delete(`/auth/users/${id}/`),
  changePassword: (data: { old_password: string; new_password: string }) =>
    api.post('/auth/users/change_password/', data),
}

export const pigs = {
  list: (params?: any) => api.get('/animals/pigs/', { params }),
  detail: (id: number) => api.get(`/animals/pigs/${id}/`),
  create: (data: any) => api.post('/animals/pigs/', data),
  update: (id: number, data: any) => api.put(`/animals/pigs/${id}/`, data),
  delete: (id: number) => api.delete(`/animals/pigs/${id}/`),
  weights: (id: number) => api.get(`/animals/pigs/${id}/weights/`),
  offspring: (id: number) => api.get(`/animals/pigs/${id}/offspring/`),
}

export const breeds = {
  list: () => api.get('/animals/breeds/'),
  create: (data: any) => api.post('/animals/breeds/', data),
}

export const locations = {
  list: () => api.get('/animals/locations/'),
}

export const weights = {
  create: (data: any) => api.post('/animals/weights/', data),
}

export const reproduction = {
  heatDetections: {
    list: (params?: any) => api.get('/reproduction/heat-detections/', { params }),
    create: (data: any) => api.post('/reproduction/heat-detections/', data),
    update: (id: number, data: any) => api.put(`/reproduction/heat-detections/${id}/`, data),
    delete: (id: number) => api.delete(`/reproduction/heat-detections/${id}/`),
  },
  matings: {
    list: (params?: any) => api.get('/reproduction/matings/', { params }),
    create: (data: any) => api.post('/reproduction/matings/', data),
    update: (id: number, data: any) => api.put(`/reproduction/matings/${id}/`, data),
    delete: (id: number) => api.delete(`/reproduction/matings/${id}/`),
  },
  gestations: {
    list: (params?: any) => api.get('/reproduction/gestations/', { params }),
    create: (data: any) => api.post('/reproduction/gestations/', data),
    update: (id: number, data: any) => api.put(`/reproduction/gestations/${id}/`, data),
    delete: (id: number) => api.delete(`/reproduction/gestations/${id}/`),
  },
  farrowings: {
    list: (params?: any) => api.get('/reproduction/farrowings/', { params }),
    create: (data: any) => api.post('/reproduction/farrowings/', data),
    update: (id: number, data: any) => api.put(`/reproduction/farrowings/${id}/`, data),
    delete: (id: number) => api.delete(`/reproduction/farrowings/${id}/`),
  },
  weanings: {
    list: (params?: any) => api.get('/reproduction/weanings/', { params }),
    create: (data: any) => api.post('/reproduction/weanings/', data),
    update: (id: number, data: any) => api.put(`/reproduction/weanings/${id}/`, data),
    delete: (id: number) => api.delete(`/reproduction/weanings/${id}/`),
  },
  sowSummary: () => api.get('/reproduction/sow-summary/'),
}

export const health = {
  vaccines: {
    list: () => api.get('/health/vaccines/'),
    create: (data: any) => api.post('/health/vaccines/', data),
  },
  records: {
    list: (params?: any) => api.get('/health/records/', { params }),
    create: (data: any) => api.post('/health/records/', data),
  },
  treatments: {
    list: (params?: any) => api.get('/health/treatments/', { params }),
    create: (data: any) => api.post('/health/treatments/', data),
  },
  mortality: {
    list: (params?: any) => api.get('/health/mortality/', { params }),
    create: (data: any) => api.post('/health/mortality/', data),
  },
}

export const feeding = {
  feedTypes: {
    list: () => api.get('/feeding/feed-types/'),
    create: (data: any) => api.post('/feeding/feed-types/', data),
    update: (id: number, data: any) => api.put(`/feeding/feed-types/${id}/`, data),
    delete: (id: number) => api.delete(`/feeding/feed-types/${id}/`),
  },
  inventory: {
    list: () => api.get('/feeding/inventory/'),
    create: (data: any) => api.post('/feeding/inventory/', data),
    update: (id: number, data: any) => api.put(`/feeding/inventory/${id}/`, data),
    delete: (id: number) => api.delete(`/feeding/inventory/${id}/`),
  },
  consumption: {
    list: (params?: any) => api.get('/feeding/consumption/', { params }),
    create: (data: any) => api.post('/feeding/consumption/', data),
    update: (id: number, data: any) => api.put(`/feeding/consumption/${id}/`, data),
    delete: (id: number) => api.delete(`/feeding/consumption/${id}/`),
  },
  stock: () => api.get('/feeding/stock/'),
}

export const sales = {
  customers: {
    list: () => api.get('/sales/customers/'),
    create: (data: any) => api.post('/sales/customers/', data),
  },
  sales: {
    list: (params?: any) => api.get('/sales/sales/', { params }),
    create: (data: any) => api.post('/sales/sales/', data),
  },
  growOut: {
    list: () => api.get('/sales/grow-out-batches/'),
    create: (data: any) => api.post('/sales/grow-out-batches/', data),
  },
}

export const reports = {
  dashboard: () => api.get('/reports/dashboard/'),
  sowProductivity: () => api.get('/reports/dashboard/sow_productivity/'),
  monthlyStats: (year?: number) =>
    api.get('/reports/dashboard/monthly_stats/', { params: { year } }),
}

export default api
