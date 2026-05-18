import { IsOptional, IsString } from 'class-validator';

export class LoginAsistenciaDto {
  @IsOptional()
  @IsString()
  ip?: string;

  @IsOptional()
  @IsString()
  mac?: string;
}
