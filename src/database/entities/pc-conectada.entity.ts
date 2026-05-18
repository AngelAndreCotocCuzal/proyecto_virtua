import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Alumno } from './alumno.entity';

@Entity()
export class PcConectada {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  mac!: string;

  @Column()
  ip!: string;

  @ManyToOne(() => Alumno, { nullable: true })
  alumno!: Alumno | null;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  ultimo_heartbeat!: Date;

  @Column({ default: false })
  en_linea!: boolean;
}