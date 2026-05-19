import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PcConectada } from '../database/entities/pc-conectada.entity';
import { Alumno } from '../database/entities/alumno.entity';
import { ControlState } from '../control/control.state';

@Injectable()
export class AgenteService {
  constructor(
    @InjectRepository(PcConectada)
    private pcRepo: Repository<PcConectada>,
    @InjectRepository(Alumno)
    private alumnoRepo: Repository<Alumno>,
    private controlState: ControlState,
  ) {}

  async register(mac: string, ip: string, alumnoId?: number) {
    let alumno: Alumno | null = null;
    if (alumnoId) {
      alumno = await this.alumnoRepo.findOne({ where: { id: alumnoId } });
      if (!alumno) throw new NotFoundException('Alumno no encontrado');
    }

    let pc = await this.pcRepo.findOne({ where: { mac } });
    if (!pc) {
      pc = this.pcRepo.create({ mac, ip, alumno: alumno ?? null, en_linea: true, ultimo_heartbeat: new Date() });
    } else {
      pc.ip = ip;
      pc.alumno = alumno ?? pc.alumno;
      pc.en_linea = true;
      pc.ultimo_heartbeat = new Date();
    }
    return this.pcRepo.save(pc);
  }

  estado() {
    return {
      examen_activo: this.controlState.examen_activo,
      usb_bloqueado: this.controlState.usb_bloqueado,
      hardening_total: this.controlState.hardening_total,
      sesion_activa_id: this.controlState.sesion_activa_id,
    };
  }

  async heartbeat(mac: string, ip?: string) {
    const pc = await this.pcRepo.findOne({ where: { mac }, relations: ['alumno'] });
    if (!pc) throw new NotFoundException('PC no registrada');
    if (ip) pc.ip = ip;
    pc.ultimo_heartbeat = new Date();
    pc.en_linea = true;
    return this.pcRepo.save(pc);
  }

  async limpiarSala() {
    await this.pcRepo.clear();
    return { mensaje: 'Sala de red limpiada correctamente' };
  }

  async listPcs() {
    const pcs = await this.pcRepo.find({ relations: ['alumno'] });
    return pcs.map((p) => ({ id: p.id, mac: p.mac, ip: p.ip, en_linea: p.en_linea, ultimo_heartbeat: p.ultimo_heartbeat, alumno: p.alumno ? { id: p.alumno.id, carnet: p.alumno.carnet, nombre: p.alumno.nombre } : null }));
  }
}
