import React, { useEffect, useState, useRef } from 'react'
import { API_BASE } from '../utils/api'

export default function CursoActivo({ token, alumno, curso, onExit }: any){
  const [confirmada, setConfirmada] = useState(false)
  const [examenActivo, setExamenActivo] = useState(false)
  const intervalRef = useRef<any>(null)

  useEffect(()=>{
    const handler = (e: KeyboardEvent) =>{
      if(e.key === 'F5' || e.key === 'F11' || (e.ctrlKey && (e.key === 'r' || e.key === 'R')) || e.key === 'Backspace'){
        e.preventDefault(); e.stopPropagation()
      }
    }
    window.addEventListener('keydown', handler)

    fetch(`${API_BASE}/asistencia/login`, { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ip: '' }) }).catch(()=>{})

    const poll = async ()=>{
      try{
        const s = await fetch(`${API_BASE}/sesion/activa`).then(r=>r.json())
        if(!s){ onExit(); return }
        const mi = (s.asistencias || []).find((a:any)=>a.alumno?.id === alumno?.id)
        setConfirmada(!!mi?.confirmada)
        const ctrl = await fetch(`${API_BASE}/control/estado`).then(r=>r.json())
        setExamenActivo(!!ctrl.examen_activo)
      }catch(e){ }
    }
    poll()
    intervalRef.current = setInterval(poll, 5000)

    return ()=>{ window.removeEventListener('keydown', handler); clearInterval(intervalRef.current) }
  },[])

  return (
    <div className="w-full h-screen p-6 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white border border-slate-200 shadow-sm rounded-xl p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Estás en clase de {curso.nombre}</h1>
        <div className={`inline-block px-3 py-1 rounded-full mb-6 ${examenActivo ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>{examenActivo ? 'Modo examen activo' : 'Sesión iniciada'}</div>
        <div className="mt-6">
          {!confirmada ? <div className="text-lg text-slate-700">Esperando confirmación de asistencia del docente...</div> : <div className="text-lg text-green-700">Asistencia Confirmada - Examen en progreso</div>}
        </div>
        <div className="mt-8">
          <button className="bg-slate-900 text-white rounded-lg px-4 py-2" onClick={onExit}>Salir</button>
        </div>
      </div>
    </div>
  )
}
