import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SesionesService } from './sesiones.service';
import { JwtDocenteGuard } from '../auth/guards/jwt-docente.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('sesion')
export class SesionesController {
  constructor(private readonly sesionesService: SesionesService) {}

  @UseGuards(JwtDocenteGuard)
  @Post('activar')
  activar(@Body('cursoId') cursoId: number, @CurrentUser() user: any) {
    return this.sesionesService.activar(cursoId, user.id);
  }

  @Get('activa')
  activa() {
    return this.sesionesService.getActiva();
  }
}
