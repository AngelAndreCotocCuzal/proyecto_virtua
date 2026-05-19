import { Body, Controller, Post, UseGuards, Get, Param, ParseIntPipe, Ip} from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { JwtAlumnoGuard } from '../auth/guards/jwt-alumno.guard';
import { JwtDocenteGuard } from '../auth/guards/jwt-docente.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LoginAsistenciaDto } from './dto/login-asistencia.dto';
import { ConfirmAsistenciaDto } from './dto/confirm-asistencia.dto';

@Controller('asistencia')
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

@UseGuards(JwtAlumnoGuard)
  @Post('login')
  login(@CurrentUser() user: any, @Ip() clientIp: string) {
    // NestJS a veces lee las IPs locales de IPv4 dentro de un formato IPv6 (ej: ::ffff:192.168.0.12)
    // Con este replace la limpiamos para que quede puramente '192.168.0.12'
    const cleanIp = clientIp.replace('::ffff:', ''); 
    
    // Solo le pasamos el ID del alumno y la IP pura de red al servicio
    return this.asistenciaService.loginAlumno(user.id, cleanIp);
  }

  @UseGuards(JwtDocenteGuard)
  @Get('pendientes')
  pendientes() {
    return this.asistenciaService.pendientes();
  }

  @UseGuards(JwtDocenteGuard)
  @Post('confirmar')
  confirmar(@Body() dto: ConfirmAsistenciaDto) {
    return this.asistenciaService.confirmar(dto.sesionId, dto.alumnoId, dto.todos);
  }

  @UseGuards(JwtDocenteGuard)
  @Get('reporte/:sesionId')
  async reporte(@Param('sesionId', ParseIntPipe) sesionId: number) {
    return this.asistenciaService.reporte(sesionId);
  }
}