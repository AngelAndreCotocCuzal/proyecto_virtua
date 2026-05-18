import { Body, Controller, Get, Post, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
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
  login(@Body() dto: LoginAsistenciaDto, @CurrentUser() user: any) {
    return this.asistenciaService.loginAlumno(user.id, dto.ip, dto.mac);
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
