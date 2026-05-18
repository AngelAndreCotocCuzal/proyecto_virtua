import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsistenciaService } from './asistencia.service';
import { AsistenciaController } from './asistencia.controller';
import { Asistencia } from '../database/entities/asistencia.entity';
import { Sesion } from '../database/entities/sesion.entity';
import { Alumno } from '../database/entities/alumno.entity';
import { AuthModule } from '../auth/auth.module';
import { ControlModule } from '../control/control.module';

@Module({
  imports: [TypeOrmModule.forFeature([Asistencia, Sesion, Alumno]), AuthModule, ControlModule],
  providers: [AsistenciaService],
  controllers: [AsistenciaController],
  exports: [AsistenciaService],
})
export class AsistenciaModule {}
