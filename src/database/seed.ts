import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { AlumnoCurso } from './entities/alumno-curso.entity';
import { Alumno } from './entities/alumno.entity';
import { Curso } from './entities/curso.entity';
import { Docente } from './entities/docente.entity';

async function seed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const dataSource = app.get(DataSource);
  const docenteRepo = dataSource.getRepository(Docente);
  const cursoRepo = dataSource.getRepository(Curso);
  const alumnoRepo = dataSource.getRepository(Alumno);
  const alumnoCursoRepo = dataSource.getRepository(AlumnoCurso);

  const docentePasswordHash = await bcrypt.hash('admin123', 10);
  let docente = await docenteRepo.findOne({
    where: { email: 'admin@examos.com' },
  });

  if (!docente) {
    docente = docenteRepo.create({
      nombre: 'Administrador',
      email: 'admin@examos.com',
      password_hash: docentePasswordHash,
    });
    docente = await docenteRepo.save(docente);
  }

  const cursosData = [
    {
      nombre: 'Programación Web',
      dia_semana: 'Lunes',
      hora_inicio: '08:30',
      hora_fin: '09:50',
      iso_requerida: 'progra-web',
    },
    {
      nombre: 'Virtualización',
      dia_semana: 'Lunes',
      hora_inicio: '11:50',
      hora_fin: '13:10',
      iso_requerida: 'virtualizacion',
    },
  ];

  const cursos: Curso[] = [];
  for (const cursoData of cursosData) {
    let curso = await cursoRepo.findOne({
      where: { nombre: cursoData.nombre },
    });

    if (!curso) {
      curso = cursoRepo.create({
        ...cursoData,
        docente,
      });
      curso = await cursoRepo.save(curso);
    }

    cursos.push(curso);
  }

  const alumnoPasswordHash = await bcrypt.hash('alumno123', 10);
  const alumnosData = [
    { carnet: '2023001', nombre: 'Alumno 1' },
    { carnet: '2023002', nombre: 'Alumno 2' },
    { carnet: '2023003', nombre: 'Alumno 3' },
  ];

  const alumnos: Alumno[] = [];
  for (const alumnoData of alumnosData) {
    let alumno = await alumnoRepo.findOne({
      where: { carnet: alumnoData.carnet },
    });

    if (!alumno) {
      alumno = alumnoRepo.create({
        ...alumnoData,
        password_hash: alumnoPasswordHash,
      });
      alumno = await alumnoRepo.save(alumno);
    }

    alumnos.push(alumno);
  }

  for (const alumno of alumnos) {
    for (const curso of cursos) {
      const relationExists = await alumnoCursoRepo.findOne({
        where: {
          alumno: { id: alumno.id },
          curso: { id: curso.id },
        },
      });

      if (!relationExists) {
        const relation = alumnoCursoRepo.create({ alumno, curso });
        await alumnoCursoRepo.save(relation);
      }
    }
  }

  await app.close();
}

void seed().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});