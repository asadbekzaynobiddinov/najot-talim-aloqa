import { Action, Ctx, Update } from 'nestjs-telegraf';
import {
  adminMenu,
  allUsersMessage,
  waitingUsersMessage,
  mainMessageAdmin,
  manageDepartmentKeys,
  manageUsersKeys,
  newsKeys,
  sendNewsKeys,
  newsStatusKeys,
  backToManageUsers,
  backToSendNews,
  backToDepartments,
  departmentKeys,
  childDepartments,
} from 'src/common/constants/admin';
import { ContextType } from 'src/common/types';
import { Buttons } from '../../buttons/buttons.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from 'src/core/entity/departments.entity';
import { DepartmentRepository } from 'src/core/repository/department.repository';
import { Markup } from 'telegraf';

@Update()
export class AdminActions {
  constructor(
    private readonly buttons: Buttons,
    @InjectRepository(Department)
    private readonly departmentRepo: DepartmentRepository,
  ) {}
  /*


    Adminnning menyu tugmalari
    va ularning bajaradigan funksiyalari


   */

  @Action('manageUsers')
  async manageUsers(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(waitingUsersMessage + allUsersMessage, {
      reply_markup: manageUsersKeys,
    });
  }

  @Action('news')
  async news(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, { reply_markup: newsKeys });
  }

  @Action('departmentSettings')
  async departmentSettings(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: manageDepartmentKeys,
    });
  }

  /*
  

  Admin uchun menyuga qaytish tugmasi harakati


  */

  @Action('backToAdminMenu')
  async backToAdminMenu(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, { reply_markup: adminMenu });
  }

  /*
  

  Admin uchun foydalanuvchilar bilan ishlash 
  tugmalari va ularning funksiyalari 

  
  */

  @Action('registrationRequests')
  async registrationRequests(@Ctx() ctx: ContextType) {
    await ctx.editMessageText('Coming soon', {
      reply_markup: backToManageUsers,
    });
  }

  @Action('backToManageUsers')
  async backToManageUsers(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(waitingUsersMessage + allUsersMessage, {
      reply_markup: manageUsersKeys,
    });
  }

  @Action('viewUsers')
  async viewUsers(@Ctx() ctx: ContextType) {
    await ctx.editMessageText('Coming soon', {
      reply_markup: backToManageUsers,
    });
  }

  /*
  

  Yangiliklar va yangiliklarni
  jo'natish tugmalari va ularning bajaradigan 
  funksiyalari


  */

  @Action('sendNews')
  async sendNews(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, { reply_markup: sendNewsKeys });
  }

  @Action('forEverUsers')
  async forEverUsers(@Ctx() ctx: ContextType) {
    await ctx.editMessageText('Coming soon', { reply_markup: backToSendNews });
  }

  @Action('byDepatments')
  async byDepatments(@Ctx() ctx: ContextType) {
    await ctx.editMessageText('Coming soon', { reply_markup: backToSendNews });
  }

  @Action('byPositions')
  async byPositions(@Ctx() ctx: ContextType) {
    await ctx.editMessageText('Coming soon', { reply_markup: backToSendNews });
  }

  @Action('forSelectedUsers')
  async forSelectedUsers(@Ctx() ctx: ContextType) {
    await ctx.editMessageText('Coming soon', { reply_markup: backToSendNews });
  }

  @Action('backToSendNews')
  async backToSendNews(@Ctx() ctx: ContextType) {
    await ctx.editMessageText('Coming soon', { reply_markup: sendNewsKeys });
  }

  @Action('backToNews')
  async backToNews(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, { reply_markup: newsKeys });
  }

  /*
  
  
  Admin uchun yangiliklarning holatini
  korish tugmalari va ularni funksiyalari

  
  */

  @Action('newsStatus')
  async newsStatus(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: newsStatusKeys,
    });
  }

  /*
  

  Bo'limlar bilan ishlash tugmalari va
  ularni funksiyalari


  */

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

  @Action('deleteDepartment')
  async deleteDepartment(@Ctx() ctx: ContextType) {
    await this.departmentRepo.delete({
      department_name: ctx.session.currentDepartment,
    });
    await ctx.answerCbQuery(`Bo'lim o'chirildi.`);
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
    console.log(ctx.session.currentDepartment);
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
      case 'Python':
      case 'ReactJS': {
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
}
