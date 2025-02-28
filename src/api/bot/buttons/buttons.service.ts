import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatus } from 'src/common/enum';
import { Department } from 'src/core/entity/departments.entity';
import { User } from 'src/core/entity/user.entity';
import { DepartmentRepository } from 'src/core/repository/department.repository';
import { UserRepository } from 'src/core/repository/user.repository';
import { Markup } from 'telegraf';
import { IsNull, Like } from 'typeorm';

@Injectable()
export class Buttons {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepo: DepartmentRepository,
    @InjectRepository(User)
    private readonly userRepo: UserRepository,
  ) {}

  async generateDepartmentKeys(callback: string): Promise<any> {
    const departments = await this.departmentRepo.find({
      where: { is_active: true, parent_name: IsNull() },
      relations: ['child_departments'],
    });

    const buttons = [];

    for (const department of departments) {
      buttons.push([
        Markup.button.callback(
          department.department_name,
          `${callback}:${department.department_name}`,
        ),
      ]);
    }

    return { buttons };
  }

  async generateChildDepartmentKeys(
    parent_name: string,
    callback: string,
  ): Promise<any> {
    const departments = await this.departmentRepo.findOne({
      where: { department_name: parent_name },
      relations: ['child_departments'],
    });

    const buttons = [];

    for (const department of departments.child_departments) {
      buttons.push([
        Markup.button.callback(
          department.department_name,
          `${callback}:${department.department_name}`,
        ),
      ]);
    }

    return { buttons };
  }

  async generateUsersKeys(
    callback: string,
    page: number,
    navigationCallback: string,
    status?: UserStatus,
    department?: string,
  ) {
    interface WhereI {
      status?: UserStatus;
      department?: any;
    }
    const where: WhereI = {};
    if (status) {
      where.status = status;
    }
    if (department) {
      where.department = Like(`%${department}%`);
    }

    const take = 10;
    const skip = (page - 1) * take;

    const users = await this.userRepo.find({
      where,
      take,
      skip,
      order: { created_at: 'DESC' },
    });

    if (users.length == 0) {
      return false;
    }

    const text = users
      .map(
        (user, index) => `${index + 1}. ${user.first_name} ${user.last_name}`,
      )
      .join('\n');

    const buttons = [];
    for (let i = 0; i < users.length; i += 5) {
      buttons.push(
        users.slice(i, i + 5).map((p, index) => ({
          text: (skip + i + index + 1).toString(),
          callback_data: `${callback}=${p.id}`,
        })),
      );
    }

    const navigationButtons = [];
    if (page > 1)
      navigationButtons.push({
        text: '⬅️ Oldingi',
        callback_data: `${navigationCallback}=${page - 1}`,
      });
    if (users.length === take)
      navigationButtons.push({
        text: '➡️ Keyingi',
        callback_data: `${navigationCallback}=${page + 1}`,
      });

    if (navigationButtons.length) {
      buttons.push(navigationButtons);
    }
    return {
      text,
      buttons,
    };
  }
}
