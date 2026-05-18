import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { Docente } from '../../database/entities/docente.entity';

@Injectable()
export class JwtDocenteStrategy extends PassportStrategy(Strategy, 'jwt-docente') {
  constructor(
    @InjectRepository(Docente)
    private docenteRepo: Repository<Docente>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'examos_secret_key_2026',
    });
  }

  async validate(payload: any) {
    if (payload.tipo !== 'docente') {
      throw new UnauthorizedException('Token no válido para docente');
    }

    const docente = await this.docenteRepo.findOne({
      where: { id: payload.sub },
    });

    if (!docente) {
      throw new UnauthorizedException('Docente no encontrado');
    }

    return {
      id: docente.id,
      email: docente.email,
      nombre: docente.email === 'admin@examos.com' ? 'Admin ExamOS' : docente.nombre,
      tipo: 'docente',
    };
  }
}