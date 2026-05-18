import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VeyonService } from './veyon.service';
import { VeyonController } from './veyon.controller';
import { PcConectada } from '../database/entities/pc-conectada.entity';
import { Asistencia } from '../database/entities/asistencia.entity';
import { Alumno } from '../database/entities/alumno.entity';
import { AuthModule } from '../auth/auth.module';
import { ControlModule } from '../control/control.module';

@Module({
  imports: [TypeOrmModule.forFeature([PcConectada, Asistencia, Alumno]), AuthModule, ControlModule],
  providers: [VeyonService],
  controllers: [VeyonController],
})
export class VeyonModule {}
