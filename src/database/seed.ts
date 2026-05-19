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

  const horarios = [
    { hora_inicio: '08:30', hora_fin: '09:50' },
    { hora_inicio: '11:50', hora_fin: '13:10' },
  ];

  const diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

  const cursosData = diasSemana.flatMap((dia_semana, index) => [
    {
      nombre: 'Programación Web',
      dia_semana,
      ...horarios[0],
      iso_requerida: `progra-web-${index + 1}`,
    },
    {
      nombre: 'Virtualización',
      dia_semana,
      ...horarios[1],
      iso_requerida: `virtualizacion-${index + 1}`,
    },
  ]);

  const cursos: Curso[] = [];
  for (const cursoData of cursosData) {
    let curso = await cursoRepo.findOne({
      where: { nombre: cursoData.nombre, dia_semana: cursoData.dia_semana },
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
    { carnet: '2023001', nombre: 'Daniel Sajvin' },
    { carnet: '2023002', nombre: 'Angel Cotoc' },
    { carnet: '2023003', nombre: 'Allan Perez' },
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
    } else {
      alumno.nombre = alumnoData.nombre;
      alumno.password_hash = alumnoPasswordHash;
    }

    alumno = await alumnoRepo.save(alumno);

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