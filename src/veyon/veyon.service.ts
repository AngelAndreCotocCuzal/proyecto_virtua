import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PcConectada } from '../database/entities/pc-conectada.entity';
import { Asistencia } from '../database/entities/asistencia.entity';
import { Alumno } from '../database/entities/alumno.entity';
import { ControlState } from '../control/control.state';
import { tmpdir } from 'os';
import { join } from 'path';
import { promises as fs } from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

@Injectable()
export class VeyonService {
  constructor(
    @InjectRepository(PcConectada)
    private pcRepo: Repository<PcConectada>,
    @InjectRepository(Asistencia)
    private asistenciaRepo: Repository<Asistencia>,
    @InjectRepository(Alumno)
    private alumnoRepo: Repository<Alumno>,
    private controlState: ControlState,
  ) {}

  async exportar() {
    const sesionId = this.controlState.sesion_activa_id;
    if (!sesionId) throw new BadRequestException('No hay sesión activa para exportar a Veyon');

    // Directiva: obtener asistencias confirmadas y cruzar por MAC con las PCs en línea
    const asistencias = await this.asistenciaRepo.find({ where: { sesion: { id: sesionId }, confirmada: true }, relations: ['alumno'] });

    // Mapear mac -> nombre de alumno desde asistencias
    const macToAlumnoName: Record<string, string> = {};
    const macs: string[] = [];
    for (const a of asistencias) {
      if (a.mac) {
        macToAlumnoName[a.mac] = a.alumno ? a.alumno.nombre : 'Desconocido';
        macs.push(a.mac);
      }
    }

    // Obtener PCs en línea cuyo MAC esté en la lista de asistencias
    const pcs = macs.length
      ? await this.pcRepo.createQueryBuilder('pc').where('pc.en_linea = :enlinea', { enlinea: true }).andWhere('pc.mac IN (:...macs)', { macs }).getMany()
      : [];

    const networkObjects = pcs.map((p) => ({ type: 'computer', name: macToAlumnoName[p.mac] ?? 'Desconocido', hostAddress: p.ip }));

    const payload = { NetworkObjects: networkObjects };

    // Create temp file
    const filePath = join(tmpdir(), `veyon_export_${Date.now()}.json`);
    await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');

    const cliPath = process.env.PlaintextVEYON_CLI_PATH;
    if (!cliPath) {
      await fs.unlink(filePath).catch(() => {});
      throw new InternalServerErrorException('No se encontró el ejecutable de veyon-cli. Verifique su archivo .env');
    }

    // Verificar que el ejecutable existe
    try {
      await fs.access(cliPath);
    } catch (err) {
      await fs.unlink(filePath).catch(() => {});
      throw new InternalServerErrorException('No se encontró el ejecutable de veyon-cli. Verifique su archivo .env');
    }

    // Ejecutar CLI (usa --clear para evitar duplicados si lo soporta)
    // Nota: este proceso puede requerir permisos elevados en Windows (ejecutar Node/Nest como Administrador)
    try {
      // args: import <file> --clear
      const { stdout, stderr } = await execFileAsync(cliPath, ['import', filePath, '--clear'], { timeout: 30000 });
      if (stderr && stderr.toString().trim().length > 0) {
        // registrar detalle y lanzar excepción
        const logPath = join(tmpdir(), `veyon_cli_stderr_${Date.now()}.log`);
        const content = `STDERR:\n${stderr}\n\nSTDOUT:\n${stdout}`;
        await fs.writeFile(logPath, content, 'utf8').catch(() => {});
        await fs.unlink(filePath).catch(() => {});
        throw new InternalServerErrorException(`Error al ejecutar veyon-cli. Ver log: ${logPath}`);
      }
    } catch (err) {
      await fs.unlink(filePath).catch(() => {});
      // intentar extraer stdout/stderr del error
      const stdout = (err as any)?.stdout ?? '';
      const stderr = (err as any)?.stderr ?? (err as any)?.message ?? '';
      const logPath = join(tmpdir(), `veyon_cli_error_${Date.now()}.log`);
      const content = `ERROR: ${String(err)}\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`;
      await fs.writeFile(logPath, content, 'utf8').catch(() => {});
      throw new InternalServerErrorException(`Error al ejecutar veyon-cli. Ver log: ${logPath}`);
    }

    await fs.unlink(filePath).catch(() => {});

    return { message: `Configuración de Veyon actualizada con ${networkObjects.length} computadoras` };
  }
}
