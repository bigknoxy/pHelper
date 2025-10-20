import axios from 'axios'

import { getToken as tokenGet, clearToken } from './token'

// Token retrieval centralized in src/api/token.ts
function getToken() {
  return tokenGet()
}

const client = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

client.interceptors.request.use(config => {
  const token = getToken()
  if (token && config.headers) {
    // set Authorization header
    ;(config.headers as Record<string, string>).Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  res => res,
  err => {
    // Optionally handle errors globally
    if (err.response?.status === 401) {
      // e.g. redirect to login
    }
    return Promise.reject(err)
  }
)

export default client
