import React, { useEffect, useState } from 'react'
import { getJson } from '../utils/api'

export default function CursosAdmin({ token }: any){
  const [cursos, setCursos] = useState<any[]>([])
  useEffect(()=>{ (async ()=>{ const r = await getJson('/curso', token); if(r.ok){ setCursos(await r.json()) } })() }, [])
  return (
    <div>CRUD Cursos — pendiente implementación backend exacta.</div>
  )
}
