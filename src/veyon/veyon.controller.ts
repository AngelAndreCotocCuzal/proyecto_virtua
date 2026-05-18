import { Controller, Get, UseGuards } from '@nestjs/common';
import { VeyonService } from './veyon.service';
import { JwtDocenteGuard } from '../auth/guards/jwt-docente.guard';

@Controller('veyon')
export class VeyonController {
  constructor(private readonly veyonService: VeyonService) {}

  @UseGuards(JwtDocenteGuard)
  @Get('exportar')
  async exportar() {
    return this.veyonService.exportar();
  }
}
