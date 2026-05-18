import { Module } from '@nestjs/common';
import { ControlState } from './control.state';
import { ControlController } from './control.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [ControlState],
  controllers: [ControlController],
  exports: [ControlState],
})
export class ControlModule {}
