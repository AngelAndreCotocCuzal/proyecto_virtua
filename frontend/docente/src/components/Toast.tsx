import React from 'react'

export default function Toast({ message }: { message: string }){
  if(!message) return null
  return (
    <div className="fixed right-4 top-4 bg-slate-900 text-white px-4 py-2 rounded-lg shadow">{message}</div>
  )
}
