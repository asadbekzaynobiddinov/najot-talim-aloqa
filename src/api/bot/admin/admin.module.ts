import { Module } from '@nestjs/common';
import { AdminCommands } from './update/commands';
import { AddDepartmentScene } from './update/scenes/add-department-scene';
import { AddChildDepartmentScene } from './update/scenes/add-child-department.scene';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from 'src/core/entity/departments.entity';
import { Buttons } from '../buttons/buttons.service';
import { User } from 'src/core/entity/user.entity';
import { ChangeUsersPhone } from './update/scenes/change-users-phone';
import { GetAppealsFile, GetAppealsText } from './update/scenes/appeal-scene';
import { Appeals } from 'src/core/entity/appeal.entity';
import { ManageUsersActions } from './update/actions/manage-users-actions';
import { AdminMenuActions } from './update/actions/menu-actions';
import { ManageAppealsActions } from './update/actions/manage-appeals-actions';
import { ManageDepartmentsActions } from './update/actions/manage-departments-sctions';

@Module({
  imports: [TypeOrmModule.forFeature([Department, User, Appeals])],
  providers: [
    AdminCommands,
    AddDepartmentScene,
    AddChildDepartmentScene,
    ChangeUsersPhone,
    GetAppealsFile,
    GetAppealsText,
    Buttons,
    ManageAppealsActions,
    ManageDepartmentsActions,
    ManageUsersActions,
    AdminMenuActions,
  ],
})
export class AdminModule {}
