import { auth } from './firebase'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

const buildHeaders = async (customHeaders) => {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  }

  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export const apiFetch = async (path, options = {}) => {
  const headers = await buildHeaders(options.headers)
  const config = { ...options, headers }

  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, config)
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = payload?.error || 'Request failed'
    throw new Error(message)
  }

  return payload
}
