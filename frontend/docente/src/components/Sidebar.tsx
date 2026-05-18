import React from 'react'

export default function Sidebar({ view, setView, onLogout }: any){
  return (
    <div className="w-64 bg-white border-r h-screen p-4">
      <div className="font-bold text-lg mb-6">ExamOS — Docente</div>
      <nav className="space-y-2">
        <button onClick={()=>setView('home')} className={`w-full text-left px-3 py-2 rounded ${view==='home'?'bg-slate-100':''}`}>Panel</button>
        <button onClick={()=>setView('cursos')} className={`w-full text-left px-3 py-2 rounded ${view==='cursos'?'bg-slate-100':''}`}>Cursos</button>
        <button onClick={()=>setView('alumnos')} className={`w-full text-left px-3 py-2 rounded ${view==='alumnos'?'bg-slate-100':''}`}>Alumnos / CSV</button>
        <button onClick={()=>setView('reportes')} className={`w-full text-left px-3 py-2 rounded ${view==='reportes'?'bg-slate-100':''}`}>Reportes</button>
      </nav>
      <div className="mt-auto pt-6">
        <button className="text-sm text-red-600" onClick={onLogout}>Cerrar sesión</button>
      </div>
    </div>
  )
}
