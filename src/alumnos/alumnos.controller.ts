import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AlumnosService } from './alumnos.service';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';
import { JwtDocenteGuard } from '../auth/guards/jwt-docente.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlumnoCurso } from '../database/entities/alumno-curso.entity';
import { Curso } from '../database/entities/curso.entity';

@UseGuards(JwtDocenteGuard)
@Controller('alumnos')
export class AlumnosController {
  constructor(
    private readonly alumnosService: AlumnosService,
    @InjectRepository(AlumnoCurso)
    private alumnoCursoRepo: Repository<AlumnoCurso>,
    @InjectRepository(Curso)
    private cursoRepo: Repository<Curso>,
  ) {}

  @Post()
  crear(@Body() dto: CreateAlumnoDto) {
    return this.alumnosService.crear(dto);
  }

  @Get()
  findAll() {
    return this.alumnosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.alumnosService.findOne(id);
  }

  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAlumnoDto) {
    return this.alumnosService.actualizar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.alumnosService.eliminar(id);
  }

  @Post('importar-csv')
  @UseInterceptors(FileInterceptor('archivo', { storage: memoryStorage() }))
  async importarCSV(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { error: 'No se recibió ningún archivo' };
    }
    const contenido = file.buffer.toString('utf-8');
    return this.alumnosService.importarDesdeCSV(contenido);
  }

  @Post('importar-csv-con-curso')
  @UseInterceptors(FileInterceptor('archivo', { storage: memoryStorage() }))
  async importarCSVConCurso(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { error: 'No se recibió ningún archivo' };
    }
    const contenido = file.buffer.toString('utf-8');
    return this.alumnosService.importarConCurso(
      contenido,
      this.alumnoCursoRepo,
      this.cursoRepo,
    );
  }
}