import React, { useState } from 'react'
import { postJson } from '../utils/api'

export default function LoginDocente({ onLogin }: any){
  const [email, setEmail] = useState('admin@examos.com')
  const [password, setPassword] = useState('admin123')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async ()=>{
    setLoading(true); setErr(null)
    try{
      const res = await postJson('/auth/docente/login', null, { email, password })
      if(!res.ok) throw new Error(await res.text())
      const j = await res.json()
      const token = j.access_token
      localStorage.setItem('docente_token', token)
      onLogin(token)
    }catch(e:any){ setErr(e.message ?? 'Error') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-4">Panel Docente — Login</h2>
        <input className="w-full border px-3 py-2 rounded mb-3" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full border px-3 py-2 rounded mb-3" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full bg-slate-900 text-white px-4 py-2 rounded" onClick={submit} disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</button>
        {err && <div className="text-red-600 mt-2">{err}</div>}
      </div>
    </div>
  )
}
