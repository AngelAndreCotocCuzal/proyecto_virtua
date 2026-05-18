import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateAlumnoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}