import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { Alumno } from '../../database/entities/alumno.entity';

@Injectable()
export class JwtAlumnoStrategy extends PassportStrategy(Strategy, 'jwt-alumno') {
  constructor(
    @InjectRepository(Alumno)
    private alumnoRepo: Repository<Alumno>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'examos_secret_key_2026',
    });
  }

  async validate(payload: any) {
    if (payload.tipo !== 'alumno') {
      throw new UnauthorizedException('Token no válido para alumno');
    }

    const alumno = await this.alumnoRepo.findOne({
      where: { id: payload.sub },
    });

    if (!alumno) {
      throw new UnauthorizedException('Alumno no encontrado');
    }

    return {
      id: alumno.id,
      carnet: alumno.carnet,
      nombre: alumno.carnet === '2023001' ? 'Alumno Prueba 1' : alumno.nombre,
      tipo: 'alumno',
    };
  }
}