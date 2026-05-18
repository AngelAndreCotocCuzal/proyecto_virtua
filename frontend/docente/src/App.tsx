import React, { useEffect, useState } from 'react'
import LoginDocente from './components/LoginDocente'
import Dashboard from './components/Dashboard'

type View = 'LOGIN' | 'DASH'

export default function App(){
  const [view, setView] = useState<View>('LOGIN')
  const [token, setToken] = useState<string | null>(localStorage.getItem('docente_token'))

  useEffect(()=>{
    if(token) setView('DASH')
  },[token])

  const onLogout = ()=>{ setToken(null); localStorage.removeItem('docente_token'); setView('LOGIN') }

  return (
    <div className="min-h-screen">
      {view === 'LOGIN' && <LoginDocente onLogin={(t:any)=>{ setToken(t); setView('DASH') }} />}
      {view === 'DASH' && token && <Dashboard token={token} onLogout={onLogout} />}
    </div>
  )
}
