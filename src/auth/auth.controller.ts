import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAlumnoDto } from './dto/login-alumno.dto';
import { LoginDocenteDto } from './dto/login-docente.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAlumnoGuard } from './guards/jwt-alumno.guard';
import { JwtDocenteGuard } from './guards/jwt-docente.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('docente/login')
  loginDocente(@Body() dto: LoginDocenteDto) {
    return this.authService.loginDocente(dto);
  }

  @Post('alumno/login')
  loginAlumno(@Body() dto: LoginAlumnoDto) {
    return this.authService.loginAlumno(dto);
  }

  @UseGuards(JwtDocenteGuard)
  @Get('docente/perfil')
  perfilDocente(@CurrentUser() user: any) {
    return {
      mensaje: 'Token válido',
      usuario: user,
    };
  }

  @UseGuards(JwtAlumnoGuard)
  @Get('alumno/perfil')
  perfilAlumno(@CurrentUser() user: any) {
    return {
      mensaje: 'Token válido',
      usuario: user,
    };
  }
}