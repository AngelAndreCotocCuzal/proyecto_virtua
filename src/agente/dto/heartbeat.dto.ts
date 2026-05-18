import { IsIP, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class HeartbeatDto {
  @IsNotEmpty()
  @IsString()
  mac!: string;

  @IsOptional()
  @IsIP()
  ip?: string;
}
