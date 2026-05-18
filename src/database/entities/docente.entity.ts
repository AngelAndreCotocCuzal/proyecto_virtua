import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Curso } from './curso.entity';

@Entity()
export class Docente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @OneToMany(() => Curso, (curso) => curso.docente)
  cursos!: Curso[];

  @CreateDateColumn()
  creado_en!: Date;
}