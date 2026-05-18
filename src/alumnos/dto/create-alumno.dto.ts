import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateAlumnoDto {
  @IsString()
  @IsNotEmpty()
  carnet!: string;

  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}