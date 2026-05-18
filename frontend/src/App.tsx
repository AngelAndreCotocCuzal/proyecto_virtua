import React, { useEffect, useState } from 'react'
import Login from './components/Login'
import Cursos from './components/Cursos'
import CursoActivo from './components/CursoActivo'
import { API_BASE } from './utils/api'

type View = 'LOGIN' | 'CURSOS' | 'CURSO_ACTIVO'

export default function App(){
  const [view, setView] = useState<View>('LOGIN')
  const [token, setToken] = useState<string | null>(localStorage.getItem('alumno_token'))
  const [alumno, setAlumno] = useState<any>(null)
  const [cursoSeleccionado, setCursoSeleccionado] = useState<any>(null)

  useEffect(()=>{
    if(!token) return

    const bootstrap = async ()=>{
      try{
        const perfilRes = await fetch(`${API_BASE}/auth/alumno/perfil`, { headers: { Authorization: `Bearer ${token}` } })
        if(!perfilRes.ok) throw new Error('no')
        const perfil = await perfilRes.json()
        setAlumno(perfil)

        const sesionRes = await fetch(`${API_BASE}/sesion/activa`, { headers: { Authorization: `Bearer ${token}` } })
        if(!sesionRes.ok) throw new Error('sesion')
        const sesionActiva = await sesionRes.json()

        if(sesionActiva){
          setView('CURSO_ACTIVO')
        }else{
          setView('CURSOS')
        }
      } catch (e) {
        setToken(null)
        localStorage.removeItem('alumno_token')
        setView('LOGIN')
      }
    }

    bootstrap()
  },[])

  useEffect(()=>{
    if(token) localStorage.setItem('alumno_token', token)
    else localStorage.removeItem('alumno_token')
  },[token])

  const onLogin = (tok: string, alumnoObj: any) => { setToken(tok); setAlumno(alumnoObj); setView('CURSOS') }

  return (
    <div className="min-h-screen flex items-center justify-center">
      {view === 'LOGIN' && <Login onLogin={onLogin} />}
      {view === 'CURSOS' && token && <Cursos token={token} alumno={alumno} onLogout={()=>{ setToken(null); setAlumno(null); setView('LOGIN') }} onEnterCourse={(c:any)=>{ setCursoSeleccionado(c); setView('CURSO_ACTIVO') }} />}
      {view === 'CURSO_ACTIVO' && token && cursoSeleccionado && <CursoActivo token={token} alumno={alumno} curso={cursoSeleccionado} onExit={()=>setView('CURSOS')} />}
    </div>
  )
}
