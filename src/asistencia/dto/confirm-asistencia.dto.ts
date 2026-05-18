import { IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class ConfirmAsistenciaDto {
  @IsOptional()
  @IsNumber()
  sesionId?: number;

  @IsOptional()
  @IsNumber()
  alumnoId?: number;

  @IsOptional()
  @IsBoolean()
  todos?: boolean;
}
