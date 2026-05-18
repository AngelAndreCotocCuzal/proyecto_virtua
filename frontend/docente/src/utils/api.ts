export const API_BASE = 'http://192.168.0.5:3000/api'

export async function postJson(path: string, token: string|null, body?: any){
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers: { 'Content-Type':'application/json', ...(token?{ Authorization: `Bearer ${token}` }: {}) }, body: body ? JSON.stringify(body) : undefined })
  return res
}

export async function getJson(path: string, token: string|null){
  const res = await fetch(`${API_BASE}${path}`, { headers: { ...(token?{ Authorization: `Bearer ${token}` }: {}) } })
  return res
}
