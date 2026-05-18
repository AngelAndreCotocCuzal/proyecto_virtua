import React from 'react'
import CSVDropzone from './CSVDropzone'

export default function AlumnosAdmin({ token }: any){
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Importar Alumnos (CSV)</h2>
      <CSVDropzone token={token} />
    </div>
  )
}
