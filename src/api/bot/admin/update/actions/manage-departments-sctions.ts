import { Action, Ctx, Update } from 'nestjs-telegraf';
import {
  mainMessageAdmin,
  manageDepartmentKeys,
  backToDepartments,
  departmentKeys,
  childDepartments,
  editDepartment,
} from 'src/common/constants/admin';
import { ContextType } from 'src/common/types';
import { Buttons } from 'src/api/bot/buttons/buttons.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from 'src/core/entity/departments.entity';
import { DepartmentRepository } from 'src/core/repository/department.repository';
import { Markup } from 'telegraf';

@Update()
export class ManageDepartmentsActions {
  constructor(
    private readonly buttons: Buttons,
    @InjectRepository(Department)
    private readonly departmentRepo: DepartmentRepository,
  ) {}
  @Action('addNewDepartment')
  async addNewDepartment(@Ctx() ctx: ContextType) {
    await ctx.scene.enter('AddDepartmentScene');
  }

  @Action('departmentList')
  async departmentList(@Ctx() ctx: ContextType) {
    const departments =
      await this.buttons.generateDepartmentKeys('departmentInfo');

    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: {
        inline_keyboard: [
          ...departments.buttons,
          ...backToDepartments.inline_keyboard,
        ],
      },
    });
  }

  @Action(/departmentInfo/)
  async departmentInfo(@Ctx() ctx: ContextType) {
    const [, department_name] = (ctx.update as any).callback_query.data.split(
      ':',
    );
    ctx.session.currentDepartment = department_name;
    const department = await this.departmentRepo.findOne({
      where: { department_name },
      relations: ['child_departments'],
    });
    const buttons = [...departmentKeys.inline_keyboard];
    if (department.child_departments.length !== 0) {
      buttons.unshift(childDepartments.inline_keyboard[0]);
    }
    await ctx.editMessageText(`<b>${department.department_name}</b>`, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  }

  @Action('backToDepartmentsList')
  async backToDepartmentsList(@Ctx() ctx: ContextType) {
    const departments =
      await this.buttons.generateDepartmentKeys('departmentInfo');
    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: {
        inline_keyboard: [
          ...departments.buttons,
          ...backToDepartments.inline_keyboard,
        ],
      },
    });
  }

  async deleteDepartmentRecursive(departmentName: string) {
    const childDepartments = await this.departmentRepo.find({
      where: { parent_name: departmentName },
    });

    for (const child of childDepartments) {
      await this.deleteDepartmentRecursive(child.department_name);
    }

    await this.departmentRepo.delete({ department_name: departmentName });
  }

  @Action('deleteDepartment')
  async deleteDepartment(@Ctx() ctx: ContextType) {
    await this.deleteDepartmentRecursive(ctx.session.currentDepartment);
    await ctx.answerCbQuery(`Bo'lim va barcha quyi bo‘limlar o‘chirildi.`);

    const buttons = await this.buttons.generateDepartmentKeys('departmentInfo');
    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: {
        inline_keyboard: [
          ...buttons.buttons,
          ...backToDepartments.inline_keyboard,
        ],
      },
    });
  }

  @Action('addChildDEpartment')
  async addChildDEpartment(@Ctx() ctx: ContextType) {
    await ctx.scene.enter('AddChildDepartmentScene');
  }

  @Action('backToDepartments')
  async backToDepartments(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: manageDepartmentKeys,
    });
  }

  @Action('childs')
  async childs(@Ctx() ctx: ContextType) {
    const parent_id = ctx.session.currentDepartment;
    const departments = await this.buttons.generateChildDepartmentKeys(
      parent_id,
      'departmentInfo',
    );
    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: {
        inline_keyboard: [
          ...departments.buttons,
          [Markup.button.callback('◀️ Ortga', 'backFromChilds')],
        ],
      },
    });
  }

  @Action('back')
  async back(@Ctx() ctx: ContextType) {
    console.log('back');
    switch (ctx.session.currentDepartment) {
      case 'Oʻquv Boʻlimi':
      case 'HR Boʻlimi': {
        const buttons =
          await this.buttons.generateDepartmentKeys('departmentInfo');
        await ctx.editMessageText(mainMessageAdmin, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              ...backToDepartments.inline_keyboard,
            ],
          },
        });
        break;
      }
      case 'Oʻqitish va rivojlantirish':
      case 'HR ish yuritish':
      case 'Recruiting': {
        const department = await this.departmentRepo.findOne({
          where: { department_name: 'HR Boʻlimi' },
          relations: ['child_departments'],
        });
        ctx.session.currentDepartment = 'HR Boʻlimi';
        const buttons = [...departmentKeys.inline_keyboard];
        if (department.child_departments.length !== 0) {
          buttons.unshift(childDepartments.inline_keyboard[0]);
        }
        await ctx.editMessageText(`<b>${department.department_name}</b>`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: buttons,
          },
        });
        break;
      }
      case 'Metodika ishlari boʻlimi':
      case 'Nazorat va rejalashtirish':
      case 'Ustozlar':
        const department = await this.departmentRepo.findOne({
          where: { department_name: 'Oʻquv Boʻlimi' },
          relations: ['child_departments'],
        });
        ctx.session.currentDepartment = 'Oʻquv Boʻlimi';
        const buttons = [...departmentKeys.inline_keyboard];
        if (department.child_departments.length !== 0) {
          buttons.unshift(childDepartments.inline_keyboard[0]);
        }
        await ctx.editMessageText(`<b>${department.department_name}</b>`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: buttons,
          },
        });
        break;
      case 'Marketing yoʻnalishi':
      case 'Dizayn yoʻnalishi':
      case 'Dasturlash yoʻnalishi': {
        const department = await this.departmentRepo.findOne({
          where: { department_name: 'Ustozlar' },
          relations: ['child_departments'],
        });
        ctx.session.currentDepartment = 'Ustozlar';
        const buttons = [...departmentKeys.inline_keyboard];
        if (department.child_departments.length !== 0) {
          buttons.unshift(childDepartments.inline_keyboard[0]);
        }
        await ctx.editMessageText(`<b>${department.department_name}</b>`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: buttons,
          },
        });
        break;
      }
      case 'Dasturlash Bootcamp':
      case 'Dasturlash Standart': {
        const department = await this.departmentRepo.findOne({
          where: { department_name: 'Dasturlash yoʻnalishi' },
          relations: ['child_departments'],
        });
        ctx.session.currentDepartment = 'Dasturlash yoʻnalishi';
        const buttons = [...departmentKeys.inline_keyboard];
        if (department.child_departments.length !== 0) {
          buttons.unshift(childDepartments.inline_keyboard[0]);
        }
        await ctx.editMessageText(`<b>${department.department_name}</b>`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: buttons,
          },
        });
        break;
      }
      case 'Full Stack':
      case 'Backend':
      case 'Frontend': {
        const department = await this.departmentRepo.findOne({
          where: { department_name: 'Dasturlash Bootcamp' },
          relations: ['child_departments'],
        });
        ctx.session.currentDepartment = 'Dasturlash Bootcamp';
        const buttons = [...departmentKeys.inline_keyboard];
        if (department.child_departments.length !== 0) {
          buttons.unshift(childDepartments.inline_keyboard[0]);
        }
        await ctx.editMessageText(`<b>${department.department_name}</b>`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: buttons,
          },
        });
        break;
      }
      case 'Python':
      case 'ReactJS': {
        const department = await this.departmentRepo.findOne({
          where: { department_name: 'Dasturlash Standart' },
          relations: ['child_departments'],
        });
        ctx.session.currentDepartment = 'Dasturlash Standart';
        const buttons = [...departmentKeys.inline_keyboard];
        if (department.child_departments.length !== 0) {
          buttons.unshift(childDepartments.inline_keyboard[0]);
        }
        await ctx.editMessageText(`<b>${department.department_name}</b>`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: buttons,
          },
        });
        break;
      }
      case 'Dizayn Bootcamp':
      case 'Dizayn Standart': {
        const department = await this.departmentRepo.findOne({
          where: { department_name: 'Dizayn yoʻnalishi' },
          relations: ['child_departments'],
        });
        ctx.session.currentDepartment = 'Dizayn yoʻnalishi';
        const buttons = [...departmentKeys.inline_keyboard];
        if (department.child_departments.length !== 0) {
          buttons.unshift(childDepartments.inline_keyboard[0]);
        }
        await ctx.editMessageText(`<b>${department.department_name}</b>`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: buttons,
          },
        });
        break;
      }
      case 'Graphic Design':
      case 'Motion Graphics': {
        const department = await this.departmentRepo.findOne({
          where: { department_name: 'Dizayn Standart' },
          relations: ['child_departments'],
        });
        ctx.session.currentDepartment = 'Dizayn Standart';
        const buttons = [...departmentKeys.inline_keyboard];
        if (department.child_departments.length !== 0) {
          buttons.unshift(childDepartments.inline_keyboard[0]);
        }
        await ctx.editMessageText(`<b>${department.department_name}</b>`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: buttons,
          },
        });
        break;
      }
      case 'SMM Pro': {
        const department = await this.departmentRepo.findOne({
          where: { department_name: 'Marketing yoʻnalishi' },
          relations: ['child_departments'],
        });
        ctx.session.currentDepartment = 'Marketing yoʻnalishi';
        const buttons = [...departmentKeys.inline_keyboard];
        if (department.child_departments.length !== 0) {
          buttons.unshift(childDepartments.inline_keyboard[0]);
        }
        await ctx.editMessageText(`<b>${department.department_name}</b>`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: buttons,
          },
        });
        break;
      }
      default:
        await ctx.editMessageText(mainMessageAdmin, {
          reply_markup: manageDepartmentKeys,
        });
        break;
    }
  }

  @Action('backFromChilds')
  async backFromChilds(@Ctx() ctx: ContextType) {
    const department = await this.departmentRepo.findOne({
      where: { department_name: ctx.session.currentDepartment },
      relations: ['child_departments'],
    });
    const buttons = [...departmentKeys.inline_keyboard];
    if (department.child_departments.length !== 0) {
      buttons.unshift(childDepartments.inline_keyboard[0]);
    }
    await ctx.editMessageText(`<b>${department.department_name}</b>`, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  }

  // @Action('editDepartment')
  // async editDepartment(@Ctx() ctx: ContextType) {
  //   await ctx.editMessageText(`<b>${ctx.session.currentDepartment}</b>`, {
  //     parse_mode: 'HTML',
  //     reply_markup: editDepartment,
  //   });
  // }

  // @Action('managePosition')
  // async managePosition(@Ctx() ctx: ContextType) {
  //   await ctx.editMessageText(`<b>${ctx.session.currentDepartment}</b>`, {
  //     parse_mode: 'HTML',
  //     reply_markup: departmentPositions,
  //   });
  // }

  @Action('backToDepartment')
  async backToDepartment(@Ctx() ctx: ContextType) {
    const department = await this.departmentRepo.findOne({
      where: { department_name: ctx.session.currentDepartment },
      relations: ['child_departments'],
    });
    const buttons = [...departmentKeys.inline_keyboard];
    if (department.child_departments.length !== 0) {
      buttons.unshift(childDepartments.inline_keyboard[0]);
    }
    await ctx.editMessageText(`<b>${department.department_name}</b>`, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  }

  @Action('backToManageDepartment')
  async backToManageDepartment(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(`<b>${ctx.session.currentDepartment}</b>`, {
      reply_markup: editDepartment,
      parse_mode: 'HTML',
    });
  }
}
