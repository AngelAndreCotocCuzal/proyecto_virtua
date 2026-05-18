import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlumnosController } from './alumnos.controller';
import { AlumnosService } from './alumnos.service';
import { Alumno } from '../database/entities/alumno.entity';
import { AlumnoCurso } from '../database/entities/alumno-curso.entity';
import { Curso } from '../database/entities/curso.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alumno, AlumnoCurso, Curso]),
    AuthModule,
  ],
  controllers: [AlumnosController],
  providers: [AlumnosService],
  exports: [AlumnosService],
})
export class AlumnosModule {}