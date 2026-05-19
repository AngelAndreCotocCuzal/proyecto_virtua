import React, { useEffect, useState } from 'react'
import { getJson, postJson } from '../utils/api'

type EstadoControl = {
  examen_activo: boolean
  usb_bloqueado: boolean
  hardening_total: boolean
  sesion_activa_id: number | null
}

type ToggleCardProps = {
  title: string
  description: string
  checked: boolean
  disabled?: boolean
  loading?: boolean
  onToggle: (checked: boolean) => void | Promise<void>
}

function ToggleCard({ title, description, checked, disabled, loading, onToggle }: ToggleCardProps) {
  const id = title.replace(/\s+/g, '-').toLowerCase()

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>

        <label htmlFor={id} className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
          <input
            id={id}
            type="checkbox"
            className="peer sr-only"
            checked={checked}
            disabled={disabled || loading}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <div className="h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-blue-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-200" />
          <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-full" />
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>{checked ? 'Activo' : 'Inactivo'}</span>
        {loading && <span className="font-medium text-slate-700">Actualizando...</span>}
      </div>
    </div>
  )
}

export default function ModoExamen({ token }: { token: string }) {
  const [estado, setEstado] = useState<EstadoControl>({
    examen_activo: false,
    usb_bloqueado: false,
    hardening_total: false,
    sesion_activa_id: null,
  })
  const [loadingEstado, setLoadingEstado] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [busyAction, setBusyAction] = useState<string | null>(null)

  async function cargarEstado() {
    setLoadingEstado(true)
    try {
      const res = await getJson('/agente/estado', token)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setEstado({
        examen_activo: !!data.examen_activo,
        usb_bloqueado: !!data.usb_bloqueado,
        hardening_total: !!data.hardening_total,
        sesion_activa_id: data.sesion_activa_id ?? null,
      })
    } catch {
      setToast('No se pudo leer el estado inicial')
    } finally {
      setLoadingEstado(false)
    }
  }

  useEffect(() => {
    void cargarEstado()
  }, [])

  async function ejecutarAccion(actionKey: string, endpoint: string, nextValue: boolean) {
    setBusyAction(actionKey)
    setToast(null)
    try {
      const res = await postJson(endpoint, token)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setEstado({
        examen_activo: !!data.examen_activo,
        usb_bloqueado: !!data.usb_bloqueado,
        hardening_total: !!data.hardening_total,
        sesion_activa_id: data.sesion_activa_id ?? null,
      })
      setToast(data.message || 'Estado actualizado')
    } catch (error: any) {
      setToast(error?.message || 'Error al actualizar el estado')
      setEstado((current) => ({ ...current, [actionKey]: !nextValue }))
    } finally {
      setBusyAction(null)
      setTimeout(() => setToast(null), 2500)
    }
  }

  async function toggleExamen(checked: boolean) {
    if (checked && !estado.sesion_activa_id) {
      setToast('No hay sesión activa para iniciar examen')
      setTimeout(() => setToast(null), 2500)
      return
    }
    await ejecutarAccion('examen_activo', checked ? '/control/examen/activar' : '/control/examen/desactivar', checked)
  }

  async function toggleUsb(checked: boolean) {
    await ejecutarAccion('usb_bloqueado', checked ? '/control/usb/bloquear' : '/control/usb/liberar', checked)
  }

  async function toggleHardening(checked: boolean) {
    if (!checked) {
      setToast('Hardening Total solo se activa con el backend actual')
      setTimeout(() => setToast(null), 3000)
      return
    }
    await ejecutarAccion('hardening_total', '/control/hardening/total', checked)
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Modo Examen</h1>
          <p className="mt-1 text-sm text-slate-500">Control centralizado de la sesión, USB y hardening del laboratorio.</p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {loadingEstado ? 'Leyendo estado...' : estado.sesion_activa_id ? `Sesión activa #${estado.sesion_activa_id}` : 'Sin sesión activa'}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ToggleCard
          title="Activar Examen"
          description="Bloquea el flujo normal de clase para pasar a modo evaluación."
          checked={estado.examen_activo}
          disabled={loadingEstado}
          loading={busyAction === 'examen_activo'}
          onToggle={toggleExamen}
        />

        <ToggleCard
          title="Bloquear USB"
          description="Evita que los alumnos usen memorias o dispositivos externos."
          checked={estado.usb_bloqueado}
          disabled={loadingEstado}
          loading={busyAction === 'usb_bloqueado'}
          onToggle={toggleUsb}
        />

        <ToggleCard
          title="Hardening Total"
          description="Corta la conexión a internet externa de todas las PCs y aplica el perfil de seguridad completo."
          checked={estado.hardening_total}
          disabled={loadingEstado}
          loading={busyAction === 'hardening_total'}
          onToggle={toggleHardening}
        />
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
