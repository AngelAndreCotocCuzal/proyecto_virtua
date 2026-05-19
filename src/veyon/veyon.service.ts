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

  async aplicarVeyon() {
    const sesionId = this.controlState.sesion_activa_id;
    if (!sesionId) throw new BadRequestException('No hay sesión activa para exportar a Veyon');

    // 1. Obtener asistencias de la sesión actual
    const asistencias = await this.asistenciaRepo.find({ 
      where: { sesion: { id: sesionId } }, 
      relations: ['alumno'] 
    });

    if (asistencias.length === 0) {
      throw new BadRequestException('No hay alumnos registrados en la sesión todavía.');
    }

    // Mapear MACs a nombres de alumnos
    const macToAlumnoName: Record<string, string> = {};
    const macsValidas: string[] = [];
    
    for (const a of asistencias) {
      if (a.mac) {
        const normalizedMac = a.mac.toLowerCase().trim();
        macToAlumnoName[normalizedMac] = a.alumno ? a.alumno.nombre : 'Desconocido';
        macsValidas.push(normalizedMac);
      }
    }

    // 2. Obtener las PCs que el Agente Python mantiene "en_linea"
    const pcsEnLinea = await this.pcRepo.find({ where: { en_linea: true } });

    // Filtrar las PCs que correspondan a los alumnos
    const pcsFiltradas = pcsEnLinea.filter(pc => macsValidas.includes(pc.mac.toLowerCase().trim()));

    if (pcsFiltradas.length === 0) {
      throw new BadRequestException('Veyon no se actualizó: No hay PCs físicas en línea coincidiendo con las asistencias.');
    }

    // 3. Construir CSV para Veyon
    const salaVirtual = 'ExamOS_Sala';
    let csvContent = '';
    
    for (const pc of pcsFiltradas) {
      const alumnoNombre = macToAlumnoName[pc.mac.toLowerCase().trim()] || 'Estudiante';
      const nombreLimpio = alumnoNombre.replace(/,/g, ' '); 
      csvContent += `${salaVirtual},${nombreLimpio},${pc.ip},${pc.mac}\n`;
    }

    // 4. Crear archivo temporal
    const filePath = join(tmpdir(), `veyon_sync_${Date.now()}.csv`);
    await fs.writeFile(filePath, csvContent, 'utf8');

    // IMPORTANTE: Asegúrate de tener VEYON_CLI_PATH="C:\Program Files\Veyon\veyon-cli.exe" en tu archivo .env
    const cliPath = process.env.VEYON_CLI_PATH; 
    if (!cliPath) {
      await fs.unlink(filePath).catch(() => {});
      throw new InternalServerErrorException('Falta la variable VEYON_CLI_PATH en el archivo .env');
    }

    try {
      // 5. Ejecutar Veyon CLI 
      // Vaciamos la red de Veyon primero para que no haya pantallas duplicadas o "fantasmas"
      try {
        await execFileAsync(cliPath, ['networkobjects', 'clear'], { timeout: 15000 });
      } catch (clearErr) {
        // A veces clear devuelve un código no-cero si ya estaba vacío, lo ignoramos de forma segura.
      }

      // Importar el nuevo mapa forzando el formato de columnas exacto de Veyon
      const { stderr } = await execFileAsync(
        cliPath, 
        ['networkobjects', 'import', filePath, 'format', '%location%,%name%,%host%,%mac%'], 
        { timeout: 20000 }
      );

      // Limpiar archivo temporal
      await fs.unlink(filePath).catch(() => {});

      return { message: `Sincronización exitosa. Se inyectaron ${pcsFiltradas.length} pantallas en Veyon Master.` };

    } catch (err: any) {
      await fs.unlink(filePath).catch(() => {});
      console.error("Veyon Sync Error:", err);
      throw new InternalServerErrorException(`Fallo al inyectar datos en Veyon CLI: ${err.message}`);
    }
  }
}