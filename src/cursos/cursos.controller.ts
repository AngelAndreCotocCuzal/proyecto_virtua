import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CursosService } from './cursos.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { JwtDocenteGuard } from '../auth/guards/jwt-docente.guard';
import { JwtAlumnoGuard } from '../auth/guards/jwt-alumno.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @UseGuards(JwtDocenteGuard)
  @Post()
  crear(@Body() dto: CreateCursoDto, @CurrentUser() user: any) {
    return this.cursosService.crear(dto, user.id);
  }

  @UseGuards(JwtDocenteGuard)
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.cursosService.findAll(user.id);
  }

  @UseGuards(JwtDocenteGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.cursosService.findOne(id, user.id);
  }

  @UseGuards(JwtDocenteGuard)
  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCursoDto,
    @CurrentUser() user: any,
  ) {
    return this.cursosService.actualizar(id, dto, user.id);
  }

  @UseGuards(JwtDocenteGuard)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.cursosService.eliminar(id, user.id);
  }

  @UseGuards(JwtDocenteGuard)
  @Post(':id/alumnos/:alumnoId')
  asignarAlumno(
    @Param('id', ParseIntPipe) id: number,
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @CurrentUser() user: any,
  ) {
    return this.cursosService.asignarAlumno(id, alumnoId, user.id);
  }

  @UseGuards(JwtDocenteGuard)
  @Delete(':id/alumnos/:alumnoId')
  desasignarAlumno(
    @Param('id', ParseIntPipe) id: number,
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @CurrentUser() user: any,
  ) {
    return this.cursosService.desasignarAlumno(id, alumnoId, user.id);
  }

  @UseGuards(JwtDocenteGuard)
  @Get(':id/alumnos')
  obtenerAlumnos(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.cursosService.obtenerAlumnosDeCurso(id, user.id);
  }

  @UseGuards(JwtAlumnoGuard)
  @Get('alumno/mis-cursos-hoy')
  misCursosHoy(@CurrentUser() user: any) {
    return this.cursosService.cursosDelDiaParaAlumno(user.id);
  }
}