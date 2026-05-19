import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsistenciaService } from './asistencia.service';
import { AsistenciaController } from './asistencia.controller';
import { Asistencia } from '../database/entities/asistencia.entity';
import { Sesion } from '../database/entities/sesion.entity';
import { Alumno } from '../database/entities/alumno.entity';
import { PcConectada } from '../database/entities/pc-conectada.entity'; // Agregamos la importación
import { AuthModule } from '../auth/auth.module';
import { ControlModule } from '../control/control.module';

@Module({
  imports: [
    // Agregamos PcConectada al arreglo para habilitar su repositorio en el servicio
    TypeOrmModule.forFeature([Asistencia, Sesion, Alumno, PcConectada]), 
    AuthModule, 
    ControlModule
  ],
  providers: [AsistenciaService],
  controllers: [AsistenciaController],
  exports: [AsistenciaService],
})
export class AsistenciaModule {}