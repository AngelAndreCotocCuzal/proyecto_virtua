import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Alumno } from '../database/entities/alumno.entity';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';

@Injectable()
export class AlumnosService {
  constructor(
    @InjectRepository(Alumno)
    private alumnoRepo: Repository<Alumno>,
  ) {}

  async crear(dto: CreateAlumnoDto): Promise<Omit<Alumno, 'password_hash'>> {
    const existe = await this.alumnoRepo.findOne({ where: { carnet: dto.carnet } });
    if (existe) throw new BadRequestException('El carnet ya está registrado');

    const password_hash = await bcrypt.hash(dto.password, 10);
    const alumno = this.alumnoRepo.create({
      carnet: dto.carnet,
      nombre: dto.nombre,
      password_hash,
    });
    const saved = await this.alumnoRepo.save(alumno);
    const { password_hash: _, ...result } = saved;
    return result;
  }

  async findAll(): Promise<Omit<Alumno, 'password_hash'>[]> {
    const alumnos = await this.alumnoRepo.find({
      relations: ['alumno_cursos', 'alumno_cursos.curso'],
      order: { nombre: 'ASC' },
    });
    return alumnos.map(({ password_hash: _, ...a }) => a);
  }

  async findOne(id: number): Promise<Omit<Alumno, 'password_hash'>> {
    const alumno = await this.alumnoRepo.findOne({
      where: { id },
      relations: ['alumno_cursos', 'alumno_cursos.curso'],
    });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');
    const { password_hash: _, ...result } = alumno;
    return result;
  }

  async actualizar(id: number, dto: UpdateAlumnoDto) {
    const alumno = await this.alumnoRepo.findOne({ where: { id } });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');

    if (dto.nombre) alumno.nombre = dto.nombre;
    if (dto.password) alumno.password_hash = await bcrypt.hash(dto.password, 10);

    const saved = await this.alumnoRepo.save(alumno);
    const { password_hash: _, ...result } = saved;
    return result;
  }

  async eliminar(id: number): Promise<{ mensaje: string }> {
    const alumno = await this.alumnoRepo.findOne({ where: { id } });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');
    await this.alumnoRepo.remove(alumno);
    return { mensaje: 'Alumno eliminado correctamente' };
  }

  async importarDesdeCSV(contenidoCSV: string): Promise<{
    creados: number;
    omitidos: number;
    errores: string[];
  }> {
    const lineas = contenidoCSV
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const datos = lineas.slice(1);
    let creados = 0;
    let omitidos = 0;
    const errores: string[] = [];

    for (const linea of datos) {
      const partes = linea.split(',').map((p) => p.trim());
      if (partes.length < 3) {
        errores.push(`Línea inválida: "${linea}"`);
        continue;
      }

      const [carnet, nombre, password] = partes;

      try {
        const existe = await this.alumnoRepo.findOne({ where: { carnet } });
        if (existe) {
          omitidos++;
          continue;
        }

        const password_hash = await bcrypt.hash(password, 10);
        const alumno = this.alumnoRepo.create({ carnet, nombre, password_hash });
        await this.alumnoRepo.save(alumno);
        creados++;
      } catch (error: any) {
        errores.push(`Error en carnet ${carnet}: ${error.message}`);
      }
    }

    return { creados, omitidos, errores };
  }

  async importarConCurso(
    contenidoCSV: string,
    AlumnoCursoRepo: Repository<any>,
    CursoRepo: Repository<any>,
  ): Promise<{
    creados: number;
    asignados: number;
    omitidos: number;
    errores: string[];
  }> {
    const lineas = contenidoCSV
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const datos = lineas.slice(1);
    let creados = 0;
    let asignados = 0;
    let omitidos = 0;
    const errores: string[] = [];

    for (const linea of datos) {
      const partes = linea.split(',').map((p) => p.trim());
      if (partes.length < 3) {
        errores.push(`Línea inválida: "${linea}"`);
        continue;
      }

      const [carnet, nombre, password, curso_id_str] = partes;

      try {
        let alumno = await this.alumnoRepo.findOne({ where: { carnet } });
        if (!alumno) {
          const password_hash = await bcrypt.hash(password, 10);
          alumno = this.alumnoRepo.create({ carnet, nombre, password_hash });
          alumno = await this.alumnoRepo.save(alumno);
          creados++;
        } else {
          omitidos++;
        }

        if (curso_id_str) {
          const cursoId = parseInt(curso_id_str, 10);
          const curso = await CursoRepo.findOne({ where: { id: cursoId } });
          if (curso) {
            const yaAsignado = await AlumnoCursoRepo.findOne({
              where: { alumno: { id: alumno.id }, curso: { id: cursoId } },
            });
            if (!yaAsignado) {
              const asignacion = AlumnoCursoRepo.create({ alumno, curso });
              await AlumnoCursoRepo.save(asignacion);
              asignados++;
            }
          }
        }
      } catch (error: any) {
        errores.push(`Error en carnet ${carnet}: ${error.message}`);
      }
    }

    return { creados, asignados, omitidos, errores };
  }
}