import React, { useState } from 'react'

export default function Reportes({ token }: any){
  const [sesionId, setSesionId] = useState('')
  const [msg, setMsg] = useState('')
  const descargar = async ()=>{
    try{
      const res = await fetch(`http://192.168.0.5:3000/api/asistencia/reporte/${sesionId}`, { headers: { Authorization: `Bearer ${token}` } })
      if(!res.ok) throw new Error(await res.text())
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `asistencia_${sesionId}.csv`; a.click(); URL.revokeObjectURL(url)
      setMsg('Descarga iniciada')
    }catch(e:any){ setMsg('Error: '+(e.message||'')) }
  }
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Exportar Asistencia</h2>
      <input className="border px-3 py-2 mr-2" placeholder="ID Sesión" value={sesionId} onChange={e=>setSesionId(e.target.value)} />
      <button className="px-3 py-2 bg-slate-800 text-white rounded" onClick={descargar}>Descargar CSV</button>
      {msg && <div className="mt-2 text-sm">{msg}</div>}
    </div>
  )
}
