import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAlumnoGuard extends AuthGuard('jwt-alumno') {}