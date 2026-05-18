import React, { useState } from 'react'
import { API_BASE } from '../utils/api'

export default function Login({ onLogin }: any){
  const [carnet, setCarnet] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async ()=>{
    setLoading(true); setErr(null)
    try{
      const res = await fetch(`${API_BASE}/auth/alumno/login`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ carnet, password }) })
      if(!res.ok) throw new Error('Credenciales inválidas')
      const j = await res.json()
      onLogin(j.access_token, j.alumno)
    }catch(e:any){ setErr(e.message ?? 'Error'); }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
        <h1 className="text-xl font-semibold mb-4">ExamOS - Inicio de Sesión</h1>
        <div className="space-y-3">
          <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Carnet" value={carnet} onChange={e=>setCarnet(e.target.value)} />
          <input type="password" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg px-4 py-2 w-full" onClick={submit} disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar al Portal'}</button>
          {err && <div className="text-red-600 text-sm">{err}</div>}
        </div>
      </div>
    </div>
  )
}
