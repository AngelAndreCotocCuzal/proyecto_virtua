import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAlumnoStrategy } from './strategies/jwt-alumno.strategy';
import { JwtDocenteStrategy } from './strategies/jwt-docente.strategy';
import { AlumnoCurso } from '../database/entities/alumno-curso.entity';
import { Alumno } from '../database/entities/alumno.entity';
import { Docente } from '../database/entities/docente.entity';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'examos_secret_key_2026',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '8h' },
    }),
    TypeOrmModule.forFeature([Docente, Alumno, AlumnoCurso]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtDocenteStrategy, JwtAlumnoStrategy],
  exports: [AuthService, JwtDocenteStrategy, JwtAlumnoStrategy, JwtModule],
})
export class AuthModule {}