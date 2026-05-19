import { Body, Controller, Post, UseGuards, Get, Param, ParseIntPipe, Ip } from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { JwtAlumnoGuard } from '../auth/guards/jwt-alumno.guard';
import { JwtDocenteGuard } from '../auth/guards/jwt-docente.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('asistencia')
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  @UseGuards(JwtAlumnoGuard)
  @Post('login')
  login(@CurrentUser() user: any, @Ip() clientIp: string) {
    // Detecta automáticamente la IP de la laptop en la red (ej: 192.168.0.12)
    // Limpiamos el prefijo IPv6 si NestJS mapea la dirección local localmente
    const cleanIp = clientIp.replace('::ffff:', '');
    return this.asistenciaService.loginAlumno(user.id, cleanIp);
  }

  @UseGuards(JwtDocenteGuard)
  @Get('pendientes')
  pendientes() {
    return this.asistenciaService.pendientes();
  }

  @UseGuards(JwtDocenteGuard)
  @Post('confirmar')
  confirmar(@Body() dto: any) {
    return this.asistenciaService.confirmar(dto.sesionId, dto.alumnoId, dto.todos);
  }

  @UseGuards(JwtDocenteGuard)
  @Get('reporte/:sesionId')
  async reporte(@Param('sesionId', ParseIntPipe) sesionId: number) {
    return this.asistenciaService.reporte(sesionId);
  }
}