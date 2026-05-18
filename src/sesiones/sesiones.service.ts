import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sesion } from '../database/entities/sesion.entity';
import { Curso } from '../database/entities/curso.entity';
import { Docente } from '../database/entities/docente.entity';
import { ControlState } from '../control/control.state';

@Injectable()
export class SesionesService {
  constructor(
    @InjectRepository(Sesion)
    private sesionRepo: Repository<Sesion>,
    @InjectRepository(Curso)
    private cursoRepo: Repository<Curso>,
    @InjectRepository(Docente)
    private docenteRepo: Repository<Docente>,
    private controlState: ControlState,
  ) {}

  async activar(cursoId: number, docenteId: number) {
    const curso = await this.cursoRepo.findOne({ where: { id: cursoId }, relations: ['docente'] });
    if (!curso) throw new NotFoundException('Curso no encontrado');
    if (curso.docente.id !== docenteId) throw new NotFoundException('No autorizado para activar esta sesión');

    // Desactivar sesiones previas del mismo curso
    await this.sesionRepo.update({ curso: { id: cursoId }, activa: true } as any, { activa: false });

    const fecha = new Date().toISOString().slice(0, 10);
    const sesion = this.sesionRepo.create({ curso, docente: curso.docente, fecha, activa: true });
    const saved = await this.sesionRepo.save(sesion);

    this.controlState.sesion_activa_id = saved.id;
    return saved;
  }

  async getActiva() {
    const id = this.controlState.sesion_activa_id;
    if (!id) return null;
    const sesion = await this.sesionRepo.findOne({ where: { id }, relations: ['curso', 'docente', 'asistencias', 'asistencias.alumno'] });
    return sesion;
  }
}
