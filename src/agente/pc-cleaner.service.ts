import { Injectable, OnModuleInit, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PcConectada } from '../database/entities/pc-conectada.entity';

@Injectable()
export class PcCleanerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PcCleanerService.name);
  private intervalRef: NodeJS.Timeout | null = null;

  constructor(@InjectRepository(PcConectada) private pcRepo: Repository<PcConectada>) {}

  onModuleInit() {
    // Ejecutar cada 15 segundos
    this.intervalRef = setInterval(() => this.clean(), 15000);
    this.logger.log('PcCleanerService iniciado (interval 15s)');
  }

  onModuleDestroy() {
    if (this.intervalRef) clearInterval(this.intervalRef);
  }

  private async clean() {
    try {
      const pcs = await this.pcRepo.find({ where: { en_linea: true } });
      const now = Date.now();
      for (const pc of pcs) {
        const last = new Date(pc.ultimo_heartbeat).getTime();
        if (now - last > 20000) {
          pc.en_linea = false;
          await this.pcRepo.save(pc);
          this.logger.log(`Pc ${pc.mac} marcada como offline por heartbeat expirado`);
        }
      }
    } catch (err) {
      this.logger.error('Error en PcCleanerService.clean', err as any);
    }
  }
}
