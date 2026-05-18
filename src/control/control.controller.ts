import { Controller, Get, Post, UseGuards, BadRequestException } from '@nestjs/common';
import { ControlState } from './control.state';
import { JwtDocenteGuard } from '../auth/guards/jwt-docente.guard';

@Controller('control')
export class ControlController {
  constructor(private readonly controlState: ControlState) {}

  @Get('estado')
  estado() {
    return {
      examen_activo: this.controlState.examen_activo,
      usb_bloqueado: this.controlState.usb_bloqueado,
      hardening_total: this.controlState.hardening_total,
      sesion_activa_id: this.controlState.sesion_activa_id,
    };
  }

  @UseGuards(JwtDocenteGuard)
  @Post('examen/activar')
  activarExamen() {
    if (!this.controlState.sesion_activa_id) {
      throw new BadRequestException('No hay sesión activa para iniciar examen');
    }
    this.controlState.examen_activo = true;
    return this.estado();
  }

  @UseGuards(JwtDocenteGuard)
  @Post('examen/desactivar')
  desactivarExamen() {
    this.controlState.examen_activo = false;
    return this.estado();
  }

  @UseGuards(JwtDocenteGuard)
  @Post('usb/bloquear')
  bloquearUsb() {
    this.controlState.usb_bloqueado = true;
    return this.estado();
  }

  @UseGuards(JwtDocenteGuard)
  @Post('usb/liberar')
  liberarUsb() {
    this.controlState.usb_bloqueado = false;
    return this.estado();
  }

  @UseGuards(JwtDocenteGuard)
  @Post('hardening/total')
  hardeningTotal() {
    if (!this.controlState.sesion_activa_id) {
      throw new BadRequestException('No hay sesión activa para aplicar hardening total');
    }
    this.controlState.examen_activo = true;
    this.controlState.usb_bloqueado = true;
    this.controlState.hardening_total = true;
    return this.estado();
  }
}
