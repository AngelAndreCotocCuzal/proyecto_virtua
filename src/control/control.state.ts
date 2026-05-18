import { Injectable } from '@nestjs/common';

@Injectable()
export class ControlState {
  examen_activo = false;
  usb_bloqueado = false;
  hardening_total = false;
  sesion_activa_id: number | null = null;
}