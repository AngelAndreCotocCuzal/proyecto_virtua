import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtDocenteGuard extends AuthGuard('jwt-docente') {}