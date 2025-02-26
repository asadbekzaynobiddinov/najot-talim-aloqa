import { Module } from '@nestjs/common';
import { AdminActions } from './update/actions';
import { AdminCommands } from './update/commands';
import { AddDepartmentScene } from './update/scenes/add-department-scene';
import { AddChildDepartmentScene } from './update/scenes/add-child-department.scene';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from 'src/core/entity/departments.entity';
import { Buttons } from '../buttons/buttons.service';
import { User } from 'src/core/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Department, User])],
  providers: [
    AdminActions,
    AdminCommands,
    AddDepartmentScene,
    AddChildDepartmentScene,
    Buttons,
  ],
})
export class AdminModule {}
