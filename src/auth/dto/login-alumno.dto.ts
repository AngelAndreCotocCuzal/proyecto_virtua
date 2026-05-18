import { IsString, MinLength } from 'class-validator';

export class LoginAlumnoDto {
  @IsString()
  carnet!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}