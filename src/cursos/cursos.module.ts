import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CursosController } from './cursos.controller';
import { CursosService } from './cursos.service';
import { Curso } from '../database/entities/curso.entity';
import { Docente } from '../database/entities/docente.entity';
import { AlumnoCurso } from '../database/entities/alumno-curso.entity';
import { Alumno } from '../database/entities/alumno.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Curso, Docente, AlumnoCurso, Alumno]),
    AuthModule,
  ],
  controllers: [CursosController],
  providers: [CursosService],
  exports: [CursosService],
})
export class CursosModule {}