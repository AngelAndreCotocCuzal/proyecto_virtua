import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SesionesService } from './sesiones.service';
import { SesionesController } from './sesiones.controller';
import { Sesion } from '../database/entities/sesion.entity';
import { Curso } from '../database/entities/curso.entity';
import { Docente } from '../database/entities/docente.entity';
import { AuthModule } from '../auth/auth.module';
import { ControlModule } from '../control/control.module';

@Module({
  imports: [TypeOrmModule.forFeature([Sesion, Curso, Docente]), AuthModule, ControlModule],
  providers: [SesionesService],
  controllers: [SesionesController],
  exports: [SesionesService],
})
export class SesionesModule {}
