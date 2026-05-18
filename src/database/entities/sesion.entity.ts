import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Asistencia } from './asistencia.entity';
import { Curso } from './curso.entity';
import { Docente } from './docente.entity';

@Entity()
export class Sesion {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Curso, (curso) => curso.sesiones)
  curso!: Curso;

  @ManyToOne(() => Docente)
  docente!: Docente;

  @Column({ type: 'date' })
  fecha!: string;

  @Column({ default: false })
  activa!: boolean;

  @OneToMany(() => Asistencia, (asistencia) => asistencia.sesion)
  asistencias!: Asistencia[];

  @CreateDateColumn()
  creado_en!: Date;
}