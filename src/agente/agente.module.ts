import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgenteService } from './agente.service';
import { PcCleanerService } from './pc-cleaner.service';
import { AgenteController } from './agente.controller';
import { ControlController } from './control.controller';
import { PcConectada } from '../database/entities/pc-conectada.entity';
import { Alumno } from '../database/entities/alumno.entity';
import { AuthModule } from '../auth/auth.module';
import { ControlModule } from '../control/control.module';

@Module({
  imports: [TypeOrmModule.forFeature([PcConectada, Alumno]), AuthModule, ControlModule],
  providers: [AgenteService, PcCleanerService],
  controllers: [AgenteController, ControlController],
  exports: [AgenteService],
})
export class AgenteModule {}
