import React, { useEffect, useState, useRef } from 'react'
import Sidebar from './Sidebar'
import Toast from './Toast'
import { getJson, postJson, API_BASE } from '../utils/api'

export default function Dashboard({ token, onLogout }: any){
  const [view, setView] = useState('home')
  const [pcs, setPcs] = useState<any[]>([])
  const [pendientes, setPendientes] = useState<any[]>([])
  const [misCursos, setMisCursos] = useState<any[]>([])
  const [selected, setSelected] = useState<Record<number,boolean>>({})
  const [toast, setToast] = useState('')
  const pollRef = useRef<any>(null)

  async function fetchPcs(){
    try{ const r = await getJson('/control/pcs-conectadas', token); if(r.ok){ const j = await r.json(); setPcs(j) } }
    catch(e){ }
  }

  async function fetchPendientes(){
    try{ const r = await getJson('/asistencia/pendientes', token); if(r.ok){ const j = await r.json(); setPendientes(j) } }
    catch(e){ }
  }

  useEffect(()=>{ fetchPcs(); fetchPendientes(); pollRef.current = setInterval(()=>{ fetchPcs(); fetchPendientes(); },5000); return ()=>clearInterval(pollRef.current) }, [])

  useEffect(()=>{
    // cargar cursos del docente
    (async ()=>{
      try{
        const r = await fetch(`${API_BASE}/cursos`, { headers: { Authorization: `Bearer ${token}` } })
        if(!r.ok) return setMisCursos([])
        const j = await r.json()
        setMisCursos(j || [])
      }catch(e){ setMisCursos([]) }
    })()
  },[])

  function toggleSelect(id:number){ setSelected(s=>({ ...s, [id]: !s[id] })) }

  async function confirmarSeleccionados(){
    const ids = Object.entries(selected).filter(([k,v])=>v).map(([k])=>parseInt(k))
    if(ids.length===0){ setToast('No hay alumnos seleccionados'); setTimeout(()=>setToast(''),3000); return }
    try{
      const res = await postJson('/asistencia/confirmar', token, { alumnoIds: ids })
      if(!res.ok) throw new Error(await res.text())
      setToast('Asistencias confirmadas')
      setTimeout(()=>setToast(''),3000)
      fetchPendientes()
    }catch(e:any){ setToast('Error: '+(e.message||'')) ; setTimeout(()=>setToast(''),4000) }
  }

  async function controlAction(path:string){
    try{ const res = await postJson(path, token); if(!res.ok) throw new Error(await res.text()); const j = await res.json(); setToast(j.message || 'OK'); setTimeout(()=>setToast(''),3000) }catch(e:any){ setToast('Error'); setTimeout(()=>setToast(''),3000) }
  }

  async function aplicarVeyon(){
    try{ const res = await postJson('/veyon/aplicar', token); if(!res.ok) throw new Error(await res.text()); const j = await res.json(); setToast(j.message || 'Veyon aplicado'); setTimeout(()=>setToast(''),4000) }catch(e:any){ setToast('Error aplicando Veyon'); setTimeout(()=>setToast(''),4000) }
  }

  return (
    <div className="flex">
      <Sidebar view={view} setView={setView} onLogout={onLogout} />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Panel Principal</h1>
          <div className="space-x-2">
            <button className="px-3 py-1 bg-slate-800 text-white rounded" onClick={()=>controlAction('/control/examen/activar')}>Activar Examen</button>
            <button className="px-3 py-1 bg-slate-600 text-white rounded" onClick={()=>controlAction('/control/examen/desactivar')}>Desactivar Examen</button>
            <button className="px-3 py-1 bg-amber-600 text-white rounded" onClick={()=>controlAction('/control/usb/bloquear')}>Bloquear USB</button>
            <button className="px-3 py-1 bg-amber-400 text-white rounded" onClick={()=>controlAction('/control/usb/liberar')}>Liberar USB</button>
            <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={()=>controlAction('/control/hardening/total')}>Hardening Total</button>
            <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={aplicarVeyon}>Actualizar Servidor</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2 bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">Mis Cursos</h2>
            <div className="space-y-2">
              {misCursos.map((c:any)=> (
                <div key={c.id} className="flex items-center justify-between border-b py-2">
                  <div>
                    <div className="font-medium">{c.nombre}</div>
                    <div className="text-sm text-slate-500">{c.dia_semana} • {c.hora_inicio} - {c.hora_fin}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`px-2 py-1 rounded-full text-sm ${c.habilitado ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-700'}`}>{c.habilitado ? 'Habilitado' : 'Deshabilitado'}</div>
                    <button className="px-3 py-1 bg-slate-800 text-white rounded text-sm" onClick={async ()=>{
                      try{
                        const res = await fetch(`${API_BASE}/cursos/${c.id}`, { method: 'PATCH', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ habilitado: !c.habilitado }) })
                        if(!res.ok) throw new Error(await res.text())
                        const updated = await res.json()
                        setMisCursos(ms=>ms.map(m=> m.id===updated.id ? updated : m))
                        setToast(`Curso ${updated.habilitado ? 'habilitado' : 'deshabilitado'}`)
                        setTimeout(()=>setToast(''),3000)
                      }catch(err:any){ setToast('Error al actualizar curso'); setTimeout(()=>setToast(''),3000) }
                    }}>{c.habilitado ? 'Deshabilitar' : 'Habilitar'}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">PCs Conectadas</h2>
            <div className="grid grid-cols-1 gap-2">
              {pcs.map(p=> (
                <div key={p.id || p.ip} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-medium">{p.nombre || p.pc_nombre || 'PC'}</div>
                    <div className="text-sm text-slate-500">{p.ip} • {p.mac || '—'}</div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-sm ${p.en_linea ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-700'}`}>{p.en_linea ? 'ONLINE' : 'OFFLINE'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">Asistencia — Pendientes</h2>
            <div className="space-y-2 max-h-96 overflow-auto">
              {pendientes.map(a=> (
                <div key={a.id} className="flex items-center justify-between border-b py-2">
                  <div>
                    <div className="font-medium">{a.alumno?.nombre ?? a.carnet}</div>
                    <div className="text-sm text-slate-500">{a.alumno?.carnet ?? ''}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" checked={!!selected[a.id]} onChange={()=>toggleSelect(a.id)} />
                    <button className="text-sm text-slate-600" onClick={async ()=>{ const res = await postJson('/asistencia/confirmar', token, { alumnoIds: [a.alumno?.id] }); if(res.ok){ setToast('Confirmada'); setTimeout(()=>setToast(''),2000); fetchPendientes() } }}>Confirmar</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex space-x-2">
              <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={confirmarSeleccionados}>Confirmar seleccionados</button>
              <button className="px-3 py-1 bg-slate-500 text-white rounded" onClick={async ()=>{ const res = await postJson('/asistencia/confirmar', token, { confirmarTodos: true }); if(res.ok){ setToast('Confirmadas'); setTimeout(()=>setToast(''),2000); fetchPendientes() } }}>Confirmar todos</button>
            </div>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast} />}
    </div>
  )
}
