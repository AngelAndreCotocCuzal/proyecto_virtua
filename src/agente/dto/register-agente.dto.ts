import { IsIP, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class RegisterAgenteDto {
  @IsNotEmpty()
  @IsString()
  mac!: string;

  @IsNotEmpty()
  @IsIP()
  ip!: string;

  @IsOptional()
  @IsNumber()
  alumnoId?: number;
}
