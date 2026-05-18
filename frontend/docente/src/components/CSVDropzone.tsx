import React, { useCallback, useState } from 'react'

export default function CSVDropzone({ token }: any){
  const [msg, setMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const onDrop = useCallback(async (e:any)=>{
    e.preventDefault();
    if(isLoading) return
    const file = e.dataTransfer.files[0]
    if(!file) return
    const fd = new FormData(); fd.append('archivo', file)
    setIsLoading(true)
    try{
      const res = await fetch('http://192.168.0.5:3000/api/alumno/importar-csv', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
      const payload = await res.json().catch(async ()=>({ raw: await res.text() }))
      if(!res.ok) throw new Error(payload?.message || payload?.error || 'Error al importar CSV')

      const creados = Number(payload?.creados ?? 0)
      const omitidos = Number(payload?.omitidos ?? 0)
      const errores = Array.isArray(payload?.errores) ? payload.errores.length : 0

      if(omitidos > 0 || errores > 0){
        setMsg(`Importación finalizada: ${creados} alumnos registrados, ${omitidos} duplicados ignorados y ${errores} filas corruptas`)
      }else{
        setMsg('Éxito total')
      }
    }catch(e:any){ setMsg('Error: '+(e.message||'')) }
    finally{ setIsLoading(false) }
  },[token])

  return (
    <div onDrop={onDrop} onDragOver={e=>e.preventDefault()} className={`border-2 border-dashed p-6 rounded text-center ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
      <div>{isLoading ? 'Importando CSV...' : 'Arrastra y suelta el CSV aquí'}</div>
      {msg && <div className="mt-2 text-sm">{msg}</div>}
    </div>
  )
}
