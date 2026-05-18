import { IsString, IsNotEmpty, IsOptional, Matches, IsBoolean } from 'class-validator';

export class CreateCursoDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  dia_semana!: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'hora_inicio debe tener formato HH:MM' })
  hora_inicio!: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'hora_fin debe tener formato HH:MM' })
  hora_fin!: string;

  @IsOptional()
  @IsString()
  iso_requerida?: string;

  @IsOptional()
  @IsBoolean()
  habilitado?: boolean;
}