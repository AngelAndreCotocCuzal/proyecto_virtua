import { Body, Controller, Get, Post } from '@nestjs/common';
import { AgenteService } from './agente.service';
import { RegisterAgenteDto } from './dto/register-agente.dto';
import { HeartbeatDto } from './dto/heartbeat.dto';

@Controller('api/agente') // Cambiado de 'agente' a 'api/agente' para hacer match con la ISO
export class AgenteController {
  constructor(private readonly agenteService: AgenteService) {}

  @Post('register')
  register(@Body() dto: RegisterAgenteDto) {
    return this.agenteService.register(dto.mac, dto.ip, dto.alumnoId);
  }

  @Get('estado')
  estado() {
    return this.agenteService.estado();
  }

  @Post('heartbeat')
  heartbeat(@Body() dto: HeartbeatDto) {
    return this.agenteService.heartbeat(dto.mac, dto.ip);
  }
}