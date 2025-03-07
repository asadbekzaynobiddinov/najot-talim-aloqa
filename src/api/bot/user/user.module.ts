import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheConfigModule } from 'src/api/cache.module';
import { User } from 'src/core/entity/user.entity';
import {
  AskDepartmentScene,
  AskLastName,
  RegisterScene,
} from './update/scenes/register.scene';
import { Department } from 'src/core/entity/departments.entity';
import { Buttons } from '../buttons/buttons.service';
import { Appeals } from 'src/core/entity/appeal.entity';
import { UserActions } from './update/actions';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Department, Appeals]),
    CacheConfigModule,
  ],
  providers: [
    RegisterScene,
    AskLastName,
    AskDepartmentScene,
    Buttons,
    UserActions,
  ],
})
export class UserModule {}
