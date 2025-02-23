import { Module } from '@nestjs/common';
import { AdminActions } from './update/actions';
import { AdminCommands } from './update/commands';

@Module({
  providers: [AdminActions, AdminCommands],
})
export class AdminModule {}
