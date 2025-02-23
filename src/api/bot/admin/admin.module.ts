import { Module } from '@nestjs/common';
import { AdminActions } from './update/actions';
import { AdminCommands } from './update/commands';
import { AddDepartmentScene } from './update/scenes/add-department-scene';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from 'src/core/entity/departments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Department])],
  providers: [AdminActions, AdminCommands, AddDepartmentScene],
})
export class AdminModule {}
