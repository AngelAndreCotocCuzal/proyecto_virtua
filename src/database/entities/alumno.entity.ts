import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AlumnoCurso } from './alumno-curso.entity';

@Entity()
export class Alumno {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  carnet!: string;

  @Column()
  nombre!: string;

  @Column()
  password_hash!: string;

  @OneToMany(() => AlumnoCurso, (alumnoCurso) => alumnoCurso.alumno)
  alumno_cursos!: AlumnoCurso[];

  @CreateDateColumn()
  creado_en!: Date;
}