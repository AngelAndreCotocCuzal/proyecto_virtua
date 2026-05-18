import { Controller, Post, UseGuards } from '@nestjs/common';
import { VeyonService } from './veyon.service';
import { JwtDocenteGuard } from '../auth/guards/jwt-docente.guard';

@Controller('veyon')
export class VeyonController {
  constructor(private readonly veyonService: VeyonService) {}

  @UseGuards(JwtDocenteGuard)
  @Post('aplicar') // Cambiado a POST y renombrado a 'aplicar' para hacer match con el frontend
  async aplicarVeyon() {
    return this.veyonService.aplicarVeyon();
  }
}