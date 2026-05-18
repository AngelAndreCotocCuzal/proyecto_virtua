import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso } from '../database/entities/curso.entity';
import { Docente } from '../database/entities/docente.entity';
import { AlumnoCurso } from '../database/entities/alumno-curso.entity';
import { Alumno } from '../database/entities/alumno.entity';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';

@Injectable()
export class CursosService {
  constructor(
    @InjectRepository(Curso)
    private cursoRepo: Repository<Curso>,

    @InjectRepository(Docente)
    private docenteRepo: Repository<Docente>,

    @InjectRepository(AlumnoCurso)
    private alumnoCursoRepo: Repository<AlumnoCurso>,

    @InjectRepository(Alumno)
    private alumnoRepo: Repository<Alumno>,
  ) {}

  async crear(dto: CreateCursoDto, docenteId: number): Promise<Curso> {
    const docente = await this.docenteRepo.findOne({ where: { id: docenteId } });
    if (!docente) throw new NotFoundException('Docente no encontrado');

    const curso = this.cursoRepo.create({ ...dto, docente });
    return this.cursoRepo.save(curso);
  }

  async findAll(docenteId: number): Promise<Curso[]> {
    return this.cursoRepo.find({
      where: { docente: { id: docenteId } },
      relations: ['docente', 'alumno_cursos', 'alumno_cursos.alumno'],
      order: { dia_semana: 'ASC', hora_inicio: 'ASC' },
    });
  }

  async findOne(id: number, docenteId: number): Promise<Curso> {
    const curso = await this.cursoRepo.findOne({
      where: { id, docente: { id: docenteId } },
      relations: ['docente', 'alumno_cursos', 'alumno_cursos.alumno'],
    });
    if (!curso) throw new NotFoundException('Curso no encontrado');
    return curso;
  }

  async actualizar(id: number, dto: UpdateCursoDto, docenteId: number): Promise<Curso> {
    const curso = await this.findOne(id, docenteId);
    Object.assign(curso, dto);
    return this.cursoRepo.save(curso);
  }

  async eliminar(id: number, docenteId: number): Promise<{ mensaje: string }> {
    const curso = await this.findOne(id, docenteId);
    await this.cursoRepo.remove(curso);
    return { mensaje: 'Curso eliminado correctamente' };
  }

  async asignarAlumno(cursoId: number, alumnoId: number, docenteId: number) {
    const curso = await this.findOne(cursoId, docenteId);
    const alumno = await this.alumnoRepo.findOne({ where: { id: alumnoId } });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');

    const yaAsignado = await this.alumnoCursoRepo.findOne({
      where: { curso: { id: cursoId }, alumno: { id: alumnoId } },
    });
    if (yaAsignado) throw new BadRequestException('El alumno ya está asignado a este curso');

    const asignacion = this.alumnoCursoRepo.create({ curso, alumno });
    await this.alumnoCursoRepo.save(asignacion);
    return { mensaje: 'Alumno asignado correctamente' };
  }

  async desasignarAlumno(cursoId: number, alumnoId: number, docenteId: number) {
    await this.findOne(cursoId, docenteId);
    const asignacion = await this.alumnoCursoRepo.findOne({
      where: { curso: { id: cursoId }, alumno: { id: alumnoId } },
    });
    if (!asignacion) throw new NotFoundException('Asignación no encontrada');
    await this.alumnoCursoRepo.remove(asignacion);
    return { mensaje: 'Alumno desasignado correctamente' };
  }

  async obtenerAlumnosDeCurso(cursoId: number, docenteId: number) {
    await this.findOne(cursoId, docenteId);
    const asignaciones = await this.alumnoCursoRepo.find({
      where: { curso: { id: cursoId } },
      relations: ['alumno'],
    });
    return asignaciones.map((a) => ({
      id: a.alumno.id,
      carnet: a.alumno.carnet,
      nombre: a.alumno.nombre,
    }));
  }

  async cursosDelDiaParaAlumno(alumnoId: number) {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    const hoy = dias[new Date().getDay()];

    const asignaciones = await this.alumnoCursoRepo.find({
      where: { alumno: { id: alumnoId } },
      relations: ['curso', 'curso.docente', 'curso.sesiones'],
    });

    return asignaciones
      .filter((a) => a.curso.dia_semana === hoy)
      .filter((a) => a.curso.habilitado !== false)
      .map((a) => {
        const sesionActiva = a.curso.sesiones?.find((s) => s.activa) || null;
        return {
          id: a.curso.id,
          nombre: a.curso.nombre,
          hora_inicio: a.curso.hora_inicio,
          hora_fin: a.curso.hora_fin,
          docente: a.curso.docente?.nombre || 'Sin asignar',
          iso_requerida: a.curso.iso_requerida,
          disponible: !!sesionActiva,
          sesion_id: sesionActiva?.id || null,
        };
      });
  }
}