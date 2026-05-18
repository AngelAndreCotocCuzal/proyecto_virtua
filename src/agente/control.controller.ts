import { Controller, Get, UseGuards } from '@nestjs/common';
import { AgenteService } from './agente.service';
import { JwtDocenteGuard } from '../auth/guards/jwt-docente.guard';

@Controller('control')
export class ControlController {
  constructor(private readonly agenteService: AgenteService) {}

  @UseGuards(JwtDocenteGuard)
  @Get('pcs-conectadas')
  pcsConectadas() {
    return this.agenteService.listPcs();
  }
}
