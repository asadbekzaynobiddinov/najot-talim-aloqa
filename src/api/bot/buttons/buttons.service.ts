import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from 'src/core/entity/departments.entity';
import { DepartmentRepository } from 'src/core/repository/department.repository';
import { Markup } from 'telegraf';
import { IsNull } from 'typeorm';

@Injectable()
export class Buttons {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepo: DepartmentRepository,
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
}
