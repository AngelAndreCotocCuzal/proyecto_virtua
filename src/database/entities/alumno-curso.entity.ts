import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Alumno } from './alumno.entity';
import { Curso } from './curso.entity';

@Entity()
export class AlumnoCurso {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Alumno, (alumno) => alumno.alumno_cursos)
  alumno!: Alumno;

  @ManyToOne(() => Curso, (curso) => curso.alumno_cursos)
  curso!: Curso;
}