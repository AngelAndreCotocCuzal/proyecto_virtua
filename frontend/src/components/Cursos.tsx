import React, { useEffect, useState } from 'react'
import { API_BASE } from '../utils/api'

export default function Cursos({ token, alumno, onLogout, onEnterCourse }: any){
  const [cursos, setCursos] = useState<any[]>([])
  const [activa, setActiva] = useState<any>(null)

  useEffect(()=>{
    // obtener cursos del día para el alumno
    fetch(`${API_BASE}/cursos/alumno/mis-cursos-hoy`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async r=> {
        if(!r.ok) return []
        const j = await r.json();
        return Array.isArray(j) ? j : []
      })
      .then(setCursos)
      .catch(()=>setCursos([]))

    fetch(`${API_BASE}/sesion/activa`)
      .then(async r=> { if(!r.ok) return null; return await r.json() })
      .then(setActiva)
      .catch(()=>setActiva(null))
  },[])

  return (
    <div className="w-full max-w-4xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg">Bienvenido, {alumno?.nombre ?? 'Alumno'}</div>
        <button className="text-sm text-slate-600" onClick={onLogout}>Cerrar Sesión</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cursos.map(c => {
          const disponible = activa && activa.curso && activa.curso.id === c.id
          return (
            <div key={c.id} className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="font-semibold text-lg">{c.nombre}</div>
                <div className="text-sm text-slate-500">{c.dia_semana} • {c.hora_inicio} - {c.hora_fin}</div>
              </div>
              <div className="mt-4">
                <button disabled={!disponible} onClick={()=>onEnterCourse(c)} className={`px-3 py-2 rounded-lg text-white ${disponible ? 'bg-green-600 hover:bg-green-500' : 'bg-slate-400 cursor-not-allowed'}`}>{disponible ? 'Ingresar' : 'No disponible'}</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
