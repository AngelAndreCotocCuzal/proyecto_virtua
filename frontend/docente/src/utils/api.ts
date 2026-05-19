export const API_BASE = 'http://192.168.0.5:3000/api'

type JsonBody = Record<string, unknown> | unknown[] | string | number | boolean | null | undefined

async function fetchWithFallback(path: string, init: RequestInit){
  const response = await fetch(`${API_BASE}${path}`, init)
  return response
}

export async function requestJson(method: string, path: string, token: string|null, body?: JsonBody){
  const hasBody = body !== undefined && body !== null
  return fetchWithFallback(path, {
    method,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: hasBody ? JSON.stringify(body) : undefined,
  })
}

export async function postJson(path: string, token: string|null, body?: JsonBody){
  return requestJson('POST', path, token, body)
}

export async function getJson(path: string, token: string|null){
  return fetchWithFallback(path, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}
