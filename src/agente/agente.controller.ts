import { Body, Controller, Get, Post } from '@nestjs/common';
import { AgenteService } from './agente.service';
import { RegisterAgenteDto } from './dto/register-agente.dto';
import { HeartbeatDto } from './dto/heartbeat.dto';

@Controller('agente') // ¡Regresamos a 'agente'! NestJS le agregará el '/api' automáticamente gracias a main.ts
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