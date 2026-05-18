const API_BASES = [
  import.meta.env.VITE_DOCENTE_API_BASE,
  import.meta.env.VITE_API_BASE,
  'http://localhost:3000/api',
  'http://192.168.0.5:3000/api',
].filter((value): value is string => Boolean(value))

export const API_BASE = API_BASES[0]

type JsonBody = Record<string, unknown> | unknown[] | string | number | boolean | null | undefined

async function fetchWithFallback(path: string, init: RequestInit){
  let lastError: unknown = null

  for (const baseUrl of API_BASES){
    try{
      const response = await fetch(`${baseUrl}${path}`, init)
      return response
    }catch(error){
      lastError = error
    }
  }

  throw lastError ?? new Error('No se pudo conectar con el backend')
}

export async function requestJson(method: string, path: string, token: string|null, body?: JsonBody){
  return fetchWithFallback(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
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
