import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CursosModule } from './cursos/cursos.module';
import { AlumnosModule } from './alumnos/alumnos.module';
import { SesionesModule } from './sesiones/sesiones.module';
import { AsistenciaModule } from './asistencia/asistencia.module';
import { AgenteModule } from './agente/agente.module';
import { ControlModule } from './control/control.module';
import { VeyonModule } from './veyon/veyon.module';
import { Docente } from './database/entities/docente.entity';
import { Alumno } from './database/entities/alumno.entity';
import { Curso } from './database/entities/curso.entity';
import { AlumnoCurso } from './database/entities/alumno-curso.entity';
import { Sesion } from './database/entities/sesion.entity';
import { Asistencia } from './database/entities/asistencia.entity';
import { PcConectada } from './database/entities/pc-conectada.entity';
import { ControlState } from './control/control.state';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DB_PATH || 'examos.db',
      entities: [Docente, Alumno, Curso, AlumnoCurso, Sesion, Asistencia, PcConectada],
      synchronize: true,
    }),
    AuthModule,
    CursosModule,
    AlumnosModule,
    SesionesModule,
    AsistenciaModule,
    AgenteModule,
    ControlModule,
    VeyonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}