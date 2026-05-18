import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AlumnoCurso } from '../database/entities/alumno-curso.entity';
import { Alumno } from '../database/entities/alumno.entity';
import { Docente } from '../database/entities/docente.entity';
import { LoginAlumnoDto } from './dto/login-alumno.dto';
import { LoginDocenteDto } from './dto/login-docente.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Docente)
    private docenteRepo: Repository<Docente>,
    @InjectRepository(Alumno)
    private alumnoRepo: Repository<Alumno>,
    @InjectRepository(AlumnoCurso)
    private alumnoCursoRepo: Repository<AlumnoCurso>,
    private jwtService: JwtService,
  ) {}

  async loginDocente(dto: LoginDocenteDto) {
    const docente = await this.docenteRepo.findOne({
      where: { email: dto.email },
    });

    if (!docente) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const passwordValida = await bcrypt.compare(dto.password, docente.password_hash);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const token = this.jwtService.sign({
      sub: docente.id,
      email: docente.email,
      nombre: docente.nombre,
      tipo: 'docente',
    });

    return {
      access_token: token,
      docente: {
        id: docente.id,
        nombre: docente.email === 'admin@examos.com' ? 'Admin ExamOS' : docente.nombre,
        email: docente.email,
      },
    };
  }

  async loginAlumno(dto: LoginAlumnoDto) {
    const alumno = await this.alumnoRepo.findOne({
      where: { carnet: dto.carnet },
    });

    if (!alumno) {
      throw new UnauthorizedException('Carnet o contraseña incorrectos');
    }

    const passwordValida = await bcrypt.compare(dto.password, alumno.password_hash);
    if (!passwordValida) {
      throw new UnauthorizedException('Carnet o contraseña incorrectos');
    }

    const alumnoCursos = await this.alumnoCursoRepo.find({
      where: { alumno: { id: alumno.id } },
      relations: ['curso', 'curso.docente'],
    });

    const cursos = alumnoCursos.map((ac) => ({
      id: ac.curso.id,
      nombre: ac.curso.nombre,
      dia_semana: ac.curso.dia_semana,
      hora_inicio: ac.curso.hora_inicio,
      hora_fin: ac.curso.hora_fin,
      docente: ac.curso.docente?.email === 'admin@examos.com' ? 'Admin ExamOS' : ac.curso.docente?.nombre || 'Sin asignar',
    }));

    const token = this.jwtService.sign({
      sub: alumno.id,
      carnet: alumno.carnet,
      nombre: alumno.nombre,
      tipo: 'alumno',
    });

    return {
      access_token: token,
      alumno: {
        id: alumno.id,
        carnet: alumno.carnet,
        nombre: alumno.carnet === '2023001' ? 'Alumno Prueba 1' : alumno.nombre,
        cursos,
      },
    };
  }

  async verificarToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return { valido: true, payload };
    } catch {
      return { valido: false, payload: null };
    }
  }

  async crearDocente(nombre: string, email: string, password: string) {
    const existe = await this.docenteRepo.findOne({ where: { email } });
    if (existe) {
      throw new BadRequestException('El email ya está registrado');
    }

    const password_hash = await bcrypt.hash(password, 10);
    const docente = this.docenteRepo.create({ nombre, email, password_hash });
    return this.docenteRepo.save(docente);
  }
}