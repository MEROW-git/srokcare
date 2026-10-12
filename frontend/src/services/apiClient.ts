import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Attach Bearer token if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('fixkh_auth_token')
  const publicAuthRoute = ['/auth/register', '/auth/verify-registration', '/auth/login'].includes(config.url || '')
  if (token && !publicAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global response interceptor for handling 401 unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fixkh_auth_token')
      localStorage.removeItem('fixkh_auth_user')
    }
    return Promise.reject(error)
  }
)

export const isMockMode = (): boolean => {
  return import.meta.env.VITE_USE_MOCK_API !== 'false'
}
