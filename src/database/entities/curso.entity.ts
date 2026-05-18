import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AlumnoCurso } from './alumno-curso.entity';
import { Docente } from './docente.entity';
import { Sesion } from './sesion.entity';

@Entity()
export class Curso {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column()
  dia_semana!: string;

  @Column()
  hora_inicio!: string;

  @Column()
  hora_fin!: string;

  @Column({ type: 'text', nullable: true })
  iso_requerida!: string | null;

  @Column({ default: true })
  habilitado!: boolean;

  @ManyToOne(() => Docente, (docente) => docente.cursos)
  docente!: Docente;

  @OneToMany(() => AlumnoCurso, (alumnoCurso) => alumnoCurso.curso)
  alumno_cursos!: AlumnoCurso[];

  @OneToMany(() => Sesion, (sesion) => sesion.curso)
  sesiones!: Sesion[];

  @CreateDateColumn()
  creado_en!: Date;
}