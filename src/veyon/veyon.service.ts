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
import { In } from 'typeorm'; 

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

  async aplicarVeyon() {
    const sesionId = this.controlState.sesion_activa_id;
    if (!sesionId) throw new BadRequestException('No hay sesión activa para exportar a Veyon');

    // 1. Obtener asistencias confirmadas de la sesión actual
    const asistencias = await this.asistenciaRepo.find({ 
      where: { sesion: { id: sesionId }, confirmada: true }, 
      relations: ['alumno'] 
    });

    if (asistencias.length === 0) {
      throw new BadRequestException('No hay alumnos con asistencia confirmada todavía.');
    }

    // Mapear MACs a nombres de alumnos (normalizando a minúsculas)
    const macToAlumnoName: Record<string, string> = {};
    const macsValidas: string[] = [];
    
    for (const a of asistencias) {
      if (a.mac) {
        const normalizedMac = a.mac.toLowerCase().trim();
        macToAlumnoName[normalizedMac] = a.alumno ? a.alumno.nombre : 'Desconocido';
        macsValidas.push(normalizedMac);
      }
    }

    /// 2. Obtener las PCs que el Agente Python mantiene "en_linea"
    const pcsEnLinea = await this.pcRepo.find({ where: { en_linea: true } });

    // Filtrar las PCs que correspondan únicamente a los alumnos confirmados
    // 2. Buscar las PCs correspondientes a las MACs confirmadas sin importar si están marcadas como ONLINE/OFFLINE
    const pcsFiltradas = await this.pcRepo.find({
      where: { mac: In(macsValidas) }
    });

    if (pcsFiltradas.length === 0) {
      return { message: 'Veyon no se actualizó: No hay PCs en línea que coincidan con asistencias confirmadas.' };
    }

    // 3. Construir el archivo CSV con la estructura nativa que lee Veyon CLI
    // Formato por línea: Ubicación/Sala, Nombre del Objeto, IP/Hostname, MAC
    const salaVirtual = 'ExamOS_Sala';
    let csvContent = '';
    
    for (const pc of pcsFiltradas) {
      const alumnoNombre = macToAlumnoName[pc.mac.toLowerCase().trim()] || 'Estudiante';
      // Limpiar comas internas del nombre por seguridad en el formato CSV
      const nombreLimpio = alumnoNombre.replace(/,/g, ' '); 
      csvContent += `${salaVirtual},${nombreLimpio},${pc.ip},${pc.mac}\n`;
    }

    // 4. Escribir el archivo CSV temporal
    const filePath = join(tmpdir(), `veyon_sync_${Date.now()}.csv`);
    await fs.writeFile(filePath, csvContent, 'utf8');

    // Cambiado a VEYON_CLI_PATH (asegúrate de tenerlo así en tu archivo .env)
    const cliPath = process.env.VEYON_CLI_PATH; 
    if (!cliPath) {
      await fs.unlink(filePath).catch(() => {});
      throw new InternalServerErrorException('No se configuró la variable VEYON_CLI_PATH en el entorno.');
    }

    try {
      await fs.access(cliPath);
    } catch {
      await fs.unlink(filePath).catch(() => {});
      throw new InternalServerErrorException(`El ejecutable veyon-cli no se encuentra en la ruta: ${cliPath}`);
    }

    try {
      // 5. Ejecutar comando de Veyon CLI para limpiar computadoras previas (evita duplicidad de pantallas de otras clases)
      await execFileAsync(cliPath, ['networkobjects', 'clear'], { timeout: 10000 }).catch(() => {});

      // 6. Importar el nuevo mapa indicándole el orden de las columnas de nuestro CSV
      const { stderr } = await execFileAsync(
        cliPath, 
        ['networkobjects', 'import', filePath, '%location%,%name%,%host%,%mac%'], 
        { timeout: 20000 }
      );

      if (stderr && stderr.toString().trim().length > 0) {
        throw new Error(stderr.toString());
      }
    } catch (err: any) {
      await fs.unlink(filePath).catch(() => {});
      throw new InternalServerErrorException(`Error ejecutando Veyon CLI: ${err.message || err}`);
    }

    // 7. Limpieza del archivo temporal
    await fs.unlink(filePath).catch(() => {});

    return { message: `Veyon sincronizado con éxito. ${pcsFiltradas.length} pantallas cargadas.` };
  }
}