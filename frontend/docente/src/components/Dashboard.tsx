import React, { useEffect, useState, useRef } from 'react'
import Sidebar from './Sidebar'
import Toast from './Toast'
import { getJson, postJson, requestJson } from '../utils/api'

export default function Dashboard({ token, onLogout }: any){
  const [view, setView] = useState('home')
  const [pcs, setPcs] = useState<any[]>([])
  const [pendientes, setPendientes] = useState<any[]>([])
  const [misCursos, setMisCursos] = useState<any[]>([])
  const [sesionActivaId, setSesionActivaId] = useState<number | null>(null)
  const [selectedAlumnos, setSelectedAlumnos] = useState<Record<number, boolean>>({})
  const [toast, setToast] = useState('')
  const pollRef = useRef<any>(null)

  // 1. Monitorear las PCs, Alumnos Pendientes y el Estado Global en Memoria
  async function fetchDashboardData(){
    try {
      // Consultar PCs conectadas
      const resPcs = await getJson('/control/pcs-conectadas', token)
      if(resPcs.ok) setPcs(await resPcs.json())

      // Consultar Alumnos Pendientes de asistencia
      const resPendientes = await getJson('/asistencia/pendientes', token)
      if(resPendientes.ok) setPendientes(await resPendientes.json())

      // Consultar el estado global para saber si hay una sesión activa en tiempo real
      const resEstado = await getJson('/control/estado', token)
      if(resEstado.ok) {
        const estado = await resEstado.json()
        setSesionActivaId(estado.sesion_activa_id)
      }
    } catch(e) { }
  }

  useEffect(() => {
    fetchDashboardData()
    pollRef.current = setInterval(fetchDashboardData, 5000)
    return () => clearInterval(pollRef.current)
  }, [])

  // 2. Cargar catálogo de cursos asignados al docente
  async function fetchCursos() {
    try {
      const r = await getJson('/cursos', token)
      if(r.ok) {
        const j = await r.json()
        setMisCursos(j || [])
      } else {
        setMisCursos([])
      }
    } catch(e) { setMisCursos([]) }
  }

  useEffect(() => { fetchCursos() }, [])

  // Alternar selección usando el ID del ALUMNO (Requerido por tu Backend)
  function toggleSelect(alumnoId: number){ 
    setSelectedAlumnos(s => ({ ...s, [alumnoId]: !s[alumnoId] })) 
  }

  // 3. Confirmar Únicamente los Alumnos Seleccionados vía Checkbox
  async function confirmarSeleccionados(){
    const alumnoIds = Object.entries(selectedAlumnos).filter(([_, v]) => v).map(([k]) => parseInt(k))
    if(alumnoIds.length === 0){ 
      setToast('No hay alumnos seleccionados')
      setTimeout(() => setToast(''), 3000)
      return 
    }
    
    try {
      // Como el backend procesa de forma individual, ejecutamos las peticiones concurrentemente con Promise.all
      setToast('Confirmando seleccionados...')
      await Promise.all(
        alumnoIds.map(id => postJson('/asistencia/confirmar', token, { alumnoId: id }))
      )
      setToast('Asistencias seleccionadas confirmadas')
      setSelectedAlumnos({}) // Limpiar selección
      setTimeout(() => setToast(''), 3000)
      fetchDashboardData()
    } catch(e: any) { 
      setToast('Error al confirmar seleccionados')
      setTimeout(() => setToast(''), 4000) 
    }
  }

  // 4. Confirmar TODOS los alumnos de un solo golpe
  async function confirmarTodos(){
    try {
      const res = await postJson('/asistencia/confirmar', token, { todos: true })
      if(!res.ok) throw new Error(await res.text())
      setToast('Todas las asistencias han sido confirmadas')
      setTimeout(() => setToast(''), 3000)
      fetchDashboardData()
    } catch(e: any) {
      setToast('Error al confirmar todos')
      setTimeout(() => setToast(''), 4000)
    }
  }

  // Botones de acciones globales (Examen, USB, Hardening)
  async function controlAction(path: string){
    try { 
      const res = await postJson(path, token)
      if(!res.ok) throw new Error(await res.text())
      const j = await res.json()
      setToast(j.message || 'Acción ejecutada con éxito')
      setTimeout(() => setToast(''), 3000) 
    } catch(e: any) { 
      setToast('Error al ejecutar comando de control')
      setTimeout(() => setToast(''), 3000) 
    }
  }

  // Disparador del Módulo Veyon Automatizado
  async function aplicarVeyon(){
    try { 
      const res = await postJson('/veyon/aplicar', token)
      if(!res.ok) throw new Error(await res.text())
      const j = await res.json()
      setToast(j.message || 'Veyon sincronizado con éxito')
      setTimeout(() => setToast(''), 4000) 
    } catch(e: any) { 
      setToast('Error aplicando Veyon CLI')
      setTimeout(() => setToast(''), 4000) 
    }
  }

  return (
    <div className="flex">
      <Sidebar view={view} setView={setView} onLogout={onLogout} />
      <div className="flex-1 p-6">
        
        {/* Cabecera de Control General */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Panel Principal</h1>
            <p className="text-sm text-slate-500">
              Estado de Sesión: {sesionActivaId ? <span className="text-green-600 font-bold">CLASE EN CURSO (ID: {sesionActivaId})</span> : <span className="text-red-500 font-bold">SIN SESIÓN ACTIVA</span>}
            </p>
          </div>
          <div className="space-x-2">
            <button className="px-3 py-1 bg-slate-800 text-white rounded disabled:opacity-50" disabled={!sesionActivaId} onClick={() => controlAction('/control/examen/activar')}>Activar Examen</button>
            <button className="px-3 py-1 bg-slate-600 text-white rounded disabled:opacity-50" disabled={!sesionActivaId} onClick={() => controlAction('/control/examen/desactivar')}>Desactivar Examen</button>
            <button className="px-3 py-1 bg-amber-600 text-white rounded disabled:opacity-50" disabled={!sesionActivaId} onClick={() => controlAction('/control/usb/bloquear')}>Bloquear USB</button>
            <button className="px-3 py-1 bg-amber-400 text-white rounded disabled:opacity-50" disabled={!sesionActivaId} onClick={() => controlAction('/control/usb/liberar')}>Liberar USB</button>
            <button className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50" disabled={!sesionActivaId} onClick={() => controlAction('/control/hardening/total')}>Hardening Total</button>
            <button className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50" disabled={!sesionActivaId} onClick={aplicarVeyon}>Sincronizar Veyon</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Tarjeta de Cursos y Activación de Sesión */}
          <div className="col-span-2 bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">Mis Cursos Asignados</h2>
            <div className="space-y-2">
              {misCursos.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between border-b py-2">
                  <div>
                    <div className="font-medium text-slate-800">{c.nombre}</div>
                    <div className="text-sm text-slate-500">{c.dia_semana} • {c.hora_inicio} - {c.hora_fin}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    
                    {/* BOTÓN CRUCIAL: Abre la clase y setea el controlState.sesion_activa_id en el Servidor */}
                    <button 
                      className="px-3 py-1 bg-emerald-600 text-white rounded text-sm font-medium hover:bg-emerald-700"
                      onClick={async () => {
                        try {
                          const res = await postJson('/sesion/activar', token, { cursoId: c.id })
                          if(!res.ok) throw new Error(await res.text())
                          setToast(`Clase iniciada correctamente para: ${c.nombre}`)
                          setTimeout(() => setToast(''), 3000)
                          fetchDashboardData()
                        } catch(err) {
                          setToast('Error al iniciar la sesión de clase')
                          setTimeout(() => setToast(''), 3000)
                        }
                      }}
                    >
                      Iniciar Clase
                    </button>

                    <button className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm hover:bg-slate-300" onClick={async () => {
                      try {
                        const res = await requestJson('PATCH', `/cursos/${c.id}`, token, { habilitado: !c.habilitado })
                        if(!res.ok) throw new Error(await res.text())
                        fetchCursos()
                        setToast('Estado del curso actualizado')
                        setTimeout(() => setToast(''), 3000)
                      } catch(err) { setToast('Error al actualizar curso') ; setTimeout(() => setToast(''), 3000) }
                    }}>{c.habilitado ? 'Deshabilitar' : 'Habilitar'}</button>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel de Hardware (PCs Conectadas por el Agente Python) */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">PCs en Red Local (Agente)</h2>
            <div className="grid grid-cols-1 gap-2 max-h-96 overflow-auto">
              {pcs.length === 0 ? <p className="text-sm text-slate-400">No hay agentes reportando tráfico...</p> : 
                pcs.map(p => (
                  <div key={p.id || p.ip} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <div className="font-medium text-slate-700">{p.nombre || p.pc_nombre || 'Estudiante ExamOS'}</div>
                      <div className="text-sm text-slate-500">{p.ip} • <span className="font-mono text-xs">{p.mac || '—'}</span></div>
                    </div>
                    <div className={`px-2 py-0.5 text-xs font-bold rounded-full ${p.en_linea ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {p.en_linea ? 'ONLINE' : 'OFFLINE'}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Panel de Software (Alumnos Logueados Pendientes de Confirmación) */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">Asistencia por Confirmar</h2>
            <div className="space-y-2 max-h-80 overflow-auto">
              {pendientes.length === 0 ? <p className="text-sm text-slate-400">No hay alumnos en la sala de espera.</p> :
                pendientes.map(a => (
                  <div key={a.id} className="flex items-center justify-between border-b py-2">
                    <div>
                      <div className="font-medium text-slate-800">{a.alumno?.nombre ?? 'Estudiante'}</div>
                      <div className="text-xs font-mono text-slate-500">Carnet: {a.alumno?.carnet ?? '—'} | IP: {a.ip || '—'}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300"
                        checked={!!selectedAlumnos[a.alumno?.id]} 
                        onChange={() => toggleSelect(a.alumno?.id)} 
                        disabled={!a.alumno?.id}
                      />
                      <button 
                        className="text-sm text-indigo-600 font-semibold hover:text-indigo-800" 
                        onClick={async () => { 
                          if(!a.alumno?.id) return;
                          const res = await postJson('/asistencia/confirmar', token, { alumnoId: a.alumno.id }); 
                          if(res.ok){ 
                            setToast('Asistencia Confirmada'); 
                            setTimeout(() => setToast(''), 2000); 
                            fetchDashboardData();
                          } 
                        }}
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
            {pendientes.length > 0 && (
              <div className="mt-4 flex space-x-2 border-t pt-3">
                <button className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700" onClick={confirmarSeleccionados}>Confirmar seleccionados</button>
                <button className="px-3 py-1 bg-slate-500 text-white rounded text-sm hover:bg-slate-600" onClick={confirmarTodos}>Confirmar todos</button>
              </div>
            )}
          </div>

        </div>
      </div>
      {toast && <Toast message={toast} />}
    </div>
  )
}