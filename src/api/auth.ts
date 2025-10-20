import client from './client'

export async function register(email: string, password: string) {
  const res = await client.post('/auth/register', { email, password })
  return res.data
}

export async function login(email: string, password: string) {
  const res = await client.post('/auth/login', { email, password })
  return res.data
}
