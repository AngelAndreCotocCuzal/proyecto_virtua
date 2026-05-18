import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Alumno } from './alumno.entity';
import { Sesion } from './sesion.entity';

@Entity()
export class Asistencia {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Sesion, (sesion) => sesion.asistencias)
  sesion!: Sesion;

  @ManyToOne(() => Alumno)
  alumno!: Alumno;

  @Column({ type: 'text', nullable: true })
  ip!: string | null;

  @Column({ type: 'text', nullable: true })
  mac!: string | null;

  @Column({ default: false })
  confirmada!: boolean;

  @CreateDateColumn({ type: 'datetime' })
  timestamp_login!: Date;

  @Column({ type: 'datetime', nullable: true })
  timestamp_confirmacion!: Date | null;
}