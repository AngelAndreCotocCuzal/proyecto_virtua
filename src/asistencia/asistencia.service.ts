import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asistencia } from '../database/entities/asistencia.entity';
import { Sesion } from '../database/entities/sesion.entity';
import { Alumno } from '../database/entities/alumno.entity';
import { PcConectada } from '../database/entities/pc-conectada.entity'; // Importación añadida
import { ControlState } from '../control/control.state';

@Injectable()
export class AsistenciaService {
  constructor(
    @InjectRepository(Asistencia)
    private asistenciaRepo: Repository<Asistencia>,
    @InjectRepository(Sesion)
    private sesionRepo: Repository<Sesion>,
    @InjectRepository(Alumno)
    private alumnoRepo: Repository<Alumno>,
    @InjectRepository(PcConectada) // Inyección añadida para resolver las MACs de red
    private pcRepo: Repository<PcConectada>,
    private controlState: ControlState,
  ) {}

  async loginAlumno(alumnoId: number, ip: string) {
    const sessionId = this.controlState.sesion_activa_id;
    if (!sessionId) throw new NotFoundException('No hay sesión activa');

    const alumno = await this.alumnoRepo.findOne({ where: { id: alumnoId } });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');

    // 🚨 BUENA PRÁCTICA: Buscamos si Python ya reportó esta IP.
    const pc = await this.pcRepo.findOne({ where: { ip } });
    if (!pc) {
      // Si el alumno fue más rápido que el script de Python, le pedimos que espere.
      throw new BadRequestException('Sincronizando seguridad de red. Por favor, intenta ingresar en 5 segundos.');
    }

    // Si Python ya había registrado la máquina, vinculamos al alumno de forma segura
    pc.alumno = alumno;
    pc.en_linea = true;
    await this.pcRepo.save(pc);

    let asistencia = await this.asistenciaRepo.findOne({
      where: { sesion: { id: sessionId }, alumno: { id: alumnoId } }
    });

    if (!asistencia) {
      asistencia = this.asistenciaRepo.create({
        sesion: { id: sessionId },
        alumno,
        ip,
        mac: pc.mac, // 👈 Extraemos la MAC física desde la base de datos, no del navegador
        confirmada: false
      });
    } else {
      asistencia.ip = ip;
      asistencia.mac = pc.mac;
    }

    return this.asistenciaRepo.save(asistencia);
  }

  async pendientes() {
    const sesionId = this.controlState.sesion_activa_id;
    if (!sesionId) return [];
    const pendientes = await this.asistenciaRepo.find({ 
      where: { sesion: { id: sesionId }, confirmada: false }, 
      relations: ['alumno'] 
    });
    return pendientes.map((p) => ({ 
      id: p.id, 
      alumno: { id: p.alumno.id, carnet: p.alumno.carnet, nombre: p.alumno.nombre }, 
      ip: p.ip, 
      mac: p.mac, 
      timestamp_login: p.timestamp_login 
    }));
  }

  async confirmar(sesionId: number | undefined, alumnoId: number | undefined, todos = false) {
    const targetSesionId = sesionId ?? this.controlState.sesion_activa_id;
    if (!targetSesionId) throw new NotFoundException('Sesión no especificada ni activa');

    if (todos) {
      const update = await this.asistenciaRepo.find({ where: { sesion: { id: targetSesionId }, confirmada: false } });
      for (const a of update) {
        a.confirmada = true;
        a.timestamp_confirmacion = new Date();
        await this.asistenciaRepo.save(a);
      }
      return { confirmadas: update.length };
    }

    if (!alumnoId) throw new NotFoundException('AlumnoId requerido para confirmar individual');
    const asistencia = await this.asistenciaRepo.findOne({ where: { sesion: { id: targetSesionId }, alumno: { id: alumnoId } } });
    if (!asistencia) throw new NotFoundException('Asistencia no encontrada');
    asistencia.confirmada = true;
    asistencia.timestamp_confirmacion = new Date();
    await this.asistenciaRepo.save(asistencia);
    return { confirmadas: 1 };
  }

  async reporte(sesionId: number) {
    const asistencias = await this.asistenciaRepo.find({ where: { sesion: { id: sesionId } }, relations: ['alumno'] });
    return asistencias.map((a) => ({ 
      id: a.id, 
      alumno: { id: a.alumno.id, carnet: a.alumno.carnet, nombre: a.alumno.nombre }, 
      ip: a.ip, 
      mac: a.mac, 
      confirmada: a.confirmada, 
      timestamp_login: a.timestamp_login, 
      timestamp_confirmacion: a.timestamp_confirmacion 
    }));
  }
}