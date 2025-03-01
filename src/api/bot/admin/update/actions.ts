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
  editDepartment,
  // departmentPositions,
  userKeysForAdmin,
  editUserKeys,
} from 'src/common/constants/admin';
import { ContextType } from 'src/common/types';
import { Buttons } from '../../buttons/buttons.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from 'src/core/entity/departments.entity';
import { DepartmentRepository } from 'src/core/repository/department.repository';
import { Markup } from 'telegraf';
import { User } from 'src/core/entity/user.entity';
import { UserRepository } from 'src/core/repository/user.repository';
import { UserRole, UserStatus } from 'src/common/enum';

@Update()
export class AdminActions {
  constructor(
    private readonly buttons: Buttons,
    @InjectRepository(Department)
    private readonly departmentRepo: DepartmentRepository,
    @InjectRepository(User) private readonly userRepo: UserRepository,
  ) {}
  /*


    Adminnning menyu tugmalari
    va ularning bajaradigan funksiyalari


   */

  @Action('manageUsers')
  async manageUsers(@Ctx() ctx: ContextType) {
    const countOfNotRegisteredUsers = await this.userRepo.count({
      where: { status: UserStatus.INACTIVE },
    });
    const countOfRegisteredUsers = await this.userRepo.count({
      where: { status: UserStatus.ACTIVE },
    });
    await ctx.editMessageText(
      waitingUsersMessage +
        countOfNotRegisteredUsers +
        '\n' +
        allUsersMessage +
        countOfRegisteredUsers,
      {
        reply_markup: manageUsersKeys,
      },
    );
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
    const result = await this.buttons.generateUsersKeys(
      'vaitingUsers',
      1,
      'NavVatingUsers',
      UserStatus.INACTIVE,
    );
    if (!result) {
      await ctx.answerCbQuery(
        `Ro'yxatdan o'tishni kutayotganlar mavjud emas !`,
        { show_alert: true },
      );
      return;
    }
    ctx.session.adminPage = 1;
    await ctx.editMessageText(result.text, {
      reply_markup: {
        inline_keyboard: [
          ...result.buttons,
          ...backToManageUsers.inline_keyboard,
        ],
      },
    });
  }

  @Action(/vaitingUsers/)
  async vaitingUsers(@Ctx() ctx: ContextType) {
    const [, id] = (ctx.update as any).callback_query.data.split('=');
    ctx.session.selectedUser = id;
    const user = await this.userRepo.findOne({ where: { id } });
    await ctx.editMessageText(
      `<b>Raqami: </b>${user.phone_number}\n` +
        `<b>Bo'lim iyerarxiyasi:</b>` +
        user.department,
      {
        reply_markup: {
          inline_keyboard: [
            [Markup.button.callback('Tasdiqlash', 'acceptRequest')],
            [Markup.button.callback('Bekor Qilish', 'rejectRequest')],
            [Markup.button.callback('◀️ Ortga', 'backToRequestList')],
          ],
        },
        parse_mode: 'HTML',
      },
    );
  }

  @Action('backToRequestList')
  async backToRequestList(@Ctx() ctx: ContextType) {
    const result = await this.buttons.generateUsersKeys(
      'vaitingUsers',
      +ctx.session.adminPage || 1,
      'NavVatingUsers',
      UserStatus.INACTIVE,
    );
    if (!result) {
      const countOfNotRegisteredUsers = await this.userRepo.count({
        where: { status: UserStatus.INACTIVE },
      });
      const countOfRegisteredUsers = await this.userRepo.count({
        where: { status: UserStatus.ACTIVE },
      });
      await ctx.editMessageText(
        waitingUsersMessage +
          countOfNotRegisteredUsers +
          '\n' +
          allUsersMessage +
          countOfRegisteredUsers,
        {
          reply_markup: manageUsersKeys,
        },
      );
      return;
    }
    await ctx.editMessageText(result.text, {
      reply_markup: {
        inline_keyboard: [
          ...result.buttons,
          ...backToManageUsers.inline_keyboard,
        ],
      },
    });
  }

  @Action(/NavVatingUsers/)
  async NavVatingUsers(@Ctx() ctx: ContextType) {
    const [, page] = (ctx.update as any).callback_query.data.split('=');
    const result = await this.buttons.generateUsersKeys(
      'vaitingUsers',
      +page,
      'NavVatingUsers',
      UserStatus.INACTIVE,
    );
    if (!result) {
      const countOfNotRegisteredUsers = await this.userRepo.count({
        where: { status: UserStatus.INACTIVE },
      });
      const countOfRegisteredUsers = await this.userRepo.count({
        where: { status: UserStatus.ACTIVE },
      });
      await ctx.editMessageText(
        waitingUsersMessage +
          countOfNotRegisteredUsers +
          '\n' +
          allUsersMessage +
          countOfRegisteredUsers,
        {
          reply_markup: manageUsersKeys,
        },
      );
      return;
    }
    ctx.session.adminPage = +page;
    await ctx.editMessageText(result.text, {
      reply_markup: {
        inline_keyboard: [
          ...result.buttons,
          ...backToManageUsers.inline_keyboard,
        ],
      },
    });
  }

  @Action('acceptRequest')
  async acceptRequest(@Ctx() ctx: ContextType) {
    await this.userRepo.update(
      { id: ctx.session.selectedUser },
      { status: UserStatus.ACTIVE },
    );
    await ctx.answerCbQuery(`So'rov tasdiqlandi !`, { show_alert: true });
    const result = await this.buttons.generateUsersKeys(
      'vaitingUsers',
      +ctx.session.adminPage || 1,
      'NavVatingUsers',
      UserStatus.INACTIVE,
    );
    if (!result) {
      const countOfNotRegisteredUsers = await this.userRepo.count({
        where: { status: UserStatus.INACTIVE },
      });
      const countOfRegisteredUsers = await this.userRepo.count({
        where: { status: UserStatus.ACTIVE },
      });
      await ctx.editMessageText(
        waitingUsersMessage +
          countOfNotRegisteredUsers +
          '\n' +
          allUsersMessage +
          countOfRegisteredUsers,
        {
          reply_markup: manageUsersKeys,
        },
      );
      return;
    }
    await ctx.editMessageText(result.text, {
      reply_markup: {
        inline_keyboard: [
          ...result.buttons,
          ...backToManageUsers.inline_keyboard,
        ],
      },
    });
  }

  @Action('rejectRequest')
  async rejectRequest(@Ctx() ctx: ContextType) {
    await this.userRepo.delete({ id: ctx.session.selectedUser });
    const result = await this.buttons.generateUsersKeys(
      'vaitingUsers',
      +ctx.session.adminPage || 1,
      'NavVatingUsers',
      UserStatus.INACTIVE,
    );
    await ctx.answerCbQuery(`So'rov bekor qilindi !`, { show_alert: true });
    if (!result) {
      const countOfNotRegisteredUsers = await this.userRepo.count({
        where: { status: UserStatus.INACTIVE },
      });
      const countOfRegisteredUsers = await this.userRepo.count({
        where: { status: UserStatus.ACTIVE },
      });
      await ctx.editMessageText(
        waitingUsersMessage +
          countOfNotRegisteredUsers +
          '\n' +
          allUsersMessage +
          countOfRegisteredUsers,
        {
          reply_markup: manageUsersKeys,
        },
      );
      return;
    }
    await ctx.editMessageText(result.text, {
      reply_markup: {
        inline_keyboard: [
          ...result.buttons,
          ...backToManageUsers.inline_keyboard,
        ],
      },
    });
  }

  @Action('backToManageUsers')
  async backToManageUsers(@Ctx() ctx: ContextType) {
    const countOfNotRegisteredUsers = await this.userRepo.count({
      where: { status: UserStatus.INACTIVE },
    });
    const countOfRegisteredUsers = await this.userRepo.count({
      where: { status: UserStatus.ACTIVE },
    });
    await ctx.editMessageText(
      waitingUsersMessage +
        countOfNotRegisteredUsers +
        '\n' +
        allUsersMessage +
        countOfRegisteredUsers,
      {
        reply_markup: manageUsersKeys,
      },
    );
  }

  @Action('viewUsers')
  async viewUsers(@Ctx() ctx: ContextType) {
    const buttons = await this.buttons.generateDepartmentKeys(
      'departmentForViewUsers',
    );
    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: {
        inline_keyboard: [
          ...buttons.buttons,
          ...backToManageUsers.inline_keyboard,
        ],
      },
    });
  }

  @Action(/departmentForViewUsers/)
  async departmentForViewUsers(@Ctx() ctx: ContextType) {
    const [, department] = (ctx.update as any).callback_query.data.split(':');
    ctx.session.searchDepartment = department;
    const depInfo = await this.departmentRepo.findOne({
      where: { department_name: department },
      relations: ['child_departments'],
    });
    if (depInfo.child_departments.length != 0) {
      const buttons = await this.buttons.generateChildDepartmentKeys(
        department,
        'departmentForViewUsers',
      );
      await ctx.editMessageText(mainMessageAdmin, {
        reply_markup: {
          inline_keyboard: [
            ...buttons.buttons,
            [Markup.button.callback('◀️ Ortga', 'backToViewDepartment')],
          ],
        },
      });
      return;
    }
    const reslt = await this.buttons.generateUsersKeys(
      'ViewThisUser',
      1,
      'AdminNavigationForUser',
      UserStatus.ACTIVE,
      department,
    );
    if (!reslt) {
      await ctx.answerCbQuery('Hodimlar mavjud emas !', { show_alert: true });
      return;
    }
    await ctx.editMessageText(reslt.text, {
      reply_markup: {
        inline_keyboard: [
          ...reslt.buttons,
          [Markup.button.callback('◀️ Ortga', 'backToViewDepartment')],
        ],
      },
    });
  }

  @Action(/ViewThisUser/)
  async viewThisUser(@Ctx() ctx: ContextType) {
    const [, id] = (ctx.update as any).callback_query.data.split('=');
    ctx.session.selectedUser = id;
    const user = await this.userRepo.findOne({ where: { id } });
    await ctx.editMessageText(
      `<b>Ismi:</b> ${user.first_name}\n` +
        `<b>Familyasi:</b> ${user.last_name}\n` +
        `<b>Raqami:</b> ${user.phone_number}\n` +
        `<b>Lavozimi:</b> ${user.role}\n` +
        `<b>Bo'limi:</b> ${user.department}`,
      {
        parse_mode: 'HTML',
        reply_markup: userKeysForAdmin,
      },
    );
  }

  @Action('deleteUser')
  async deleteUser(@Ctx() ctx: ContextType) {
    await this.userRepo.delete({ id: ctx.session.selectedUser });
    const reslt = await this.buttons.generateUsersKeys(
      'ViewThisUser',
      ctx.session.adminPage || 1,
      'AdminNavigationForUser',
      UserStatus.ACTIVE,
      ctx.session.searchDepartment,
    );
    if (!reslt) {
      await ctx.editMessageText(mainMessageAdmin, {
        reply_markup: manageUsersKeys,
      });
      return;
    }
    await ctx.editMessageText(reslt.text, {
      reply_markup: {
        inline_keyboard: [
          ...reslt.buttons,
          [Markup.button.callback('◀️ Ortga', 'backToViewDepartment')],
        ],
      },
    });
  }

  @Action('editUser')
  async editUser(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, { reply_markup: editUserKeys });
  }

  @Action('backToUserInformation')
  async backToUserInformation(@Ctx() ctx: ContextType) {
    const user = await this.userRepo.findOne({
      where: { id: ctx.session.selectedUser },
    });
    await ctx.editMessageText(
      `<b>Ismi:</b> ${user.first_name}\n` +
        `<b>Familyasi:</b> ${user.last_name}\n` +
        `<b>Raqami:</b> ${user.phone_number}\n` +
        `<b>Lavozimi:</b> ${user.role}\n` +
        `<b>Bo'limi:</b> ${user.department}`,
      {
        parse_mode: 'HTML',
        reply_markup: userKeysForAdmin,
      },
    );
  }

  @Action('editUsersPhone')
  async editUsersPhone(@Ctx() ctx: ContextType) {
    await ctx.scene.enter('ChangeUsersPhone');
  }

  @Action('changeUsersPosition')
  async changeUsersPosition(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: {
        inline_keyboard: [
          [Markup.button.callback(`Bo'lim boshligi qilish`, 'makeManager')],
          [Markup.button.callback('◀️ Ortga', 'backToUserInformation')],
        ],
      },
    });
  }

  @Action('makeManager')
  async makeManager(@Ctx() ctx: ContextType) {
    await this.userRepo.update(
      { id: ctx.session.selectedUser },
      { role: UserRole.MANAGER },
    );
    await ctx.answerCbQuery(`Bu foydalanuvchi endi bo'lim boshlig'i`, {
      show_alert: true,
    });
    const user = await this.userRepo.findOne({
      where: { id: ctx.session.selectedUser },
    });
    await ctx.editMessageText(
      `<b>Ismi:</b> ${user.first_name}\n` +
        `<b>Familyasi:</b> ${user.last_name}\n` +
        `<b>Raqami:</b> ${user.phone_number}\n` +
        `<b>Lavozimi:</b> ${user.role}\n` +
        `<b>Bo'limi:</b> ${user.department}`,
      {
        parse_mode: 'HTML',
        reply_markup: userKeysForAdmin,
      },
    );
  }

  @Action('changeUsersDepartment')
  async changeUsersDepartment(@Ctx() ctx: ContextType) {
    const buttons = await this.buttons.generateDepartmentKeys(
      'keysForChangeDepartment',
    );
    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: {
        inline_keyboard: [
          ...buttons.buttons,
          [Markup.button.callback('◀️ Ortga', 'backToUserInformation')],
        ],
      },
    });
  }

  @Action(/keysForChangeDepartment/)
  async keysForChangeDepartment(@Ctx() ctx: ContextType) {
    const [, department] = (ctx.update as any).callback_query.data.split(':');
    console.log(department);
    ctx.session.searchDepartment = department;
    const dep = ctx.session.usersNewDepartment
      ? ctx.session.usersNewDepartment + `:${department}`
      : '' + `:${department}`;
    console.log(dep);
    ctx.session.usersNewDepartment = dep;
    const depInfo = await this.departmentRepo.findOne({
      where: { department_name: department },
      relations: ['child_departments'],
    });
    if (depInfo.child_departments.length != 0) {
      const buttons = await this.buttons.generateChildDepartmentKeys(
        department,
        'keysForChangeDepartment',
      );
      await ctx.editMessageText(mainMessageAdmin, {
        reply_markup: {
          inline_keyboard: [
            ...buttons.buttons,
            [Markup.button.callback('◀️ Ortga', 'backToChangeDepartment')],
          ],
        },
      });
      return;
    }
    const departments = dep.split(':');
    const user = await this.userRepo.findOne({
      where: { id: ctx.session.selectedUser },
    });
    user.department = ctx.session.usersNewDepartment.split(':').join(' ');
    await this.userRepo.save(user);
    await ctx.answerCbQuery(
      `Hodim ${departments[departments.length - 1]} bo'limiga o'tkazildi.`,
      {
        show_alert: true,
      },
    );
    ctx.session.usersNewDepartment = '';
    ctx.session.searchDepartment = departments[departments.length - 1];
    await ctx.editMessageText(
      `<b>Ismi:</b> ${user.first_name}\n` +
        `<b>Familyasi:</b> ${user.last_name}\n` +
        `<b>Raqami:</b> ${user.phone_number}\n` +
        `<b>Lavozimi:</b> ${user.role}\n` +
        `<b>Bo'limi:</b> ${user.department}`,
      {
        parse_mode: 'HTML',
        reply_markup: userKeysForAdmin,
      },
    );
  }

  @Action('backToChangeDepartment')
  async backToChangeDepartment(@Ctx() ctx: ContextType) {
    console.log(ctx.session.searchDepartment);
    const dep = ctx.session.usersNewDepartment
      .split(':')
      .slice(0, ctx.session.usersNewDepartment.split(':').length - 1)
      .join(':');
    ctx.session.usersNewDepartment = dep;
    switch (ctx.session.searchDepartment) {
      case 'HR Boʻlimi':
      case 'Oʻquv Boʻlimi': {
        const buttons = await this.buttons.generateDepartmentKeys(
          'keysForChangeDepartment',
        );
        await ctx.editMessageText(mainMessageAdmin, {
          reply_markup: {
            inline_keyboard: [...buttons.buttons],
          },
        });
        break;
      }
      case 'HR ish yuritish':
      case 'Recruiting':
      case 'Oʻqitish va rivojlantirish': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'HR Boʻlimi',
          'keysForChangeDepartment',
        );
        ctx.session.searchDepartment = 'HR Boʻlimi';
        await ctx.editMessageText(mainMessageAdmin, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [Markup.button.callback('◀️ Ortga', 'backToChangeDepartment')],
            ],
          },
        });
        break;
      }
      case 'Metodika ishlari boʻlimi':
      case 'Nazorat va rejalashtirish':
      case 'Ustozlar': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Oʻquv Boʻlimi',
          'keysForChangeDepartment',
        );
        ctx.session.searchDepartment = 'Oʻquv Boʻlimi';
        await ctx.editMessageText(mainMessageAdmin, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [Markup.button.callback('◀️ Ortga', 'backToChangeDepartment')],
            ],
          },
        });
        break;
      }
      case 'Marketing yoʻnalishi':
      case 'Dizayn yoʻnalishi':
      case 'Dasturlash yoʻnalishi': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Ustozlar',
          'keysForChangeDepartment',
        );
        ctx.session.searchDepartment = 'Ustozlar';
        await ctx.editMessageText(mainMessageAdmin, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [Markup.button.callback('◀️ Ortga', 'backToChangeDepartment')],
            ],
          },
        });
        break;
      }
      case 'Dasturlash Bootcamp':
      case 'Dasturlash Standart': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Dasturlash yoʻnalishi',
          'keysForChangeDepartment',
        );
        ctx.session.searchDepartment = 'Dasturlash yoʻnalishi';
        await ctx.editMessageText(mainMessageAdmin, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [Markup.button.callback('◀️ Ortga', 'backToChangeDepartment')],
            ],
          },
        });
        break;
      }
      case 'Full Stack':
      case 'Backend':
      case 'Frontend': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Dasturlash Bootcamp',
          'keysForChangeDepartment',
        );
        ctx.session.searchDepartment = 'Dasturlash Bootcamp';
        await ctx.editMessageText(mainMessageAdmin, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [Markup.button.callback('◀️ Ortga', 'backToChangeDepartment')],
            ],
          },
        });
        break;
      }
      case 'Python':
      case 'ReactJS': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Dasturlash Standart',
          'keysForChangeDepartment',
        );
        ctx.session.searchDepartment = 'Dasturlash Standart';
        await ctx.editMessageText(mainMessageAdmin, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [Markup.button.callback('◀️ Ortga', 'backToChangeDepartment')],
            ],
          },
        });
        break;
      }
      case 'Dizayn Bootcamp':
      case 'Dizayn Standart': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Dizayn yoʻnalishi',
          'keysForChangeDepartment',
        );
        ctx.session.searchDepartment = 'Dizayn yoʻnalishi';
        await ctx.editMessageText(mainMessageAdmin, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [Markup.button.callback('◀️ Ortga', 'backToChangeDepartment')],
            ],
          },
        });
        break;
      }
      case 'Graphic Design':
      case 'Motion Graphics': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Dizayn Standart',
          'keysForChangeDepartment',
        );
        ctx.session.searchDepartment = 'Dizayn Standart';
        await ctx.editMessageText(mainMessageAdmin, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [Markup.button.callback('◀️ Ortga', 'backToChangeDepartment')],
            ],
          },
        });
        break;
      }
      case 'SMM Pro': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Marketing yoʻnalishi',
          'keysForChangeDepartment',
        );
        ctx.session.searchDepartment = 'Marketing yoʻnalishi';
        await ctx.editMessageText(mainMessageAdmin, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [Markup.button.callback('◀️ Ortga', 'backToChangeDepartment')],
            ],
          },
        });
        break;
      }
    }
  }

  @Action('backToUsersList')
  async backToUsersList(@Ctx() ctx: ContextType) {
    const reslt = await this.buttons.generateUsersKeys(
      'ViewThisUser',
      ctx.session.adminPage || 1,
      'AdminNavigationForUser',
      UserStatus.ACTIVE,
      ctx.session.searchDepartment,
    );
    if (!reslt) {
      const countOfNotRegisteredUsers = await this.userRepo.count({
        where: { status: UserStatus.INACTIVE },
      });
      const countOfRegisteredUsers = await this.userRepo.count({
        where: { status: UserStatus.ACTIVE },
      });
      await ctx.editMessageText(
        waitingUsersMessage +
          countOfNotRegisteredUsers +
          '\n' +
          allUsersMessage +
          countOfRegisteredUsers,
        {
          reply_markup: manageUsersKeys,
        },
      );
      return;
    }
    await ctx.editMessageText(reslt.text, {
      reply_markup: {
        inline_keyboard: [
          ...reslt.buttons,
          [Markup.button.callback('◀️ Ortga', 'backToViewDepartment')],
        ],
      },
    });
  }

  @Action(/AdminNavigationForUser/)
  async AdminNavigationForUser(@Ctx() ctx: ContextType) {
    const [, page] = (ctx.update as any).callback_query.data.split('=');
    const result = await this.buttons.generateUsersKeys(
      'ViewThisUser',
      +page,
      'AdminNavigationForUser',
      UserStatus.INACTIVE,
    );
    if (!result) {
      await ctx.answerCbQuery('Hodimlar mavjud emas !', { show_alert: true });
      return;
    }
    ctx.session.adminPage = +page;
    await ctx.editMessageText(result.text, {
      reply_markup: {
        inline_keyboard: [
          ...result.buttons,
          [Markup.button.callback('◀️ Ortga', 'backToViewDepartment')],
        ],
      },
    });
  }

  @Action('backToViewDepartment')
  async backToViewDepartment(@Ctx() ctx: ContextType) {
    console.log(ctx.session.searchDepartment);
    switch (ctx.session.searchDepartment) {
      case 'HR Boʻlimi':
      case 'Oʻquv Boʻlimi': {
        const buttons = await this.buttons.generateDepartmentKeys(
          'departmentForViewUsers',
        );
        try {
          await ctx.editMessageText(mainMessageAdmin, {
            reply_markup: {
              inline_keyboard: [
                ...buttons.buttons,
                ...backToManageUsers.inline_keyboard,
              ],
            },
          });
        } catch (error) {
          console.log(error.message);
        }
        break;
      }
      case 'HR ish yuritish':
      case 'Recruiting':
      case 'Oʻqitish va rivojlantirish': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'HR Boʻlimi',
          'departmentForViewUsers',
        );
        ctx.session.searchDepartment = 'HR Boʻlimi';
        try {
          await ctx.editMessageText(mainMessageAdmin, {
            reply_markup: {
              inline_keyboard: [
                ...buttons.buttons,
                [Markup.button.callback('◀️ Ortga', 'backToViewDepartment')],
              ],
            },
          });
        } catch (error) {
          console.log(error.message);
        }
        break;
      }
      case 'Metodika ishlari boʻlimi':
      case 'Nazorat va rejalashtirish':
      case 'Ustozlar': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Oʻquv Boʻlimi',
          'departmentForViewUsers',
        );
        ctx.session.searchDepartment = 'Oʻquv Boʻlimi';
        try {
          await ctx.editMessageText(mainMessageAdmin, {
            reply_markup: {
              inline_keyboard: [
                ...buttons.buttons,
                [Markup.button.callback('◀️ Ortga', 'backToViewDepartment')],
              ],
            },
          });
        } catch (error) {
          console.log(error.message);
        }
        break;
      }
      case 'Marketing yoʻnalishi':
      case 'Dizayn yoʻnalishi':
      case 'Dasturlash yoʻnalishi': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Ustozlar',
          'departmentForViewUsers',
        );
        ctx.session.searchDepartment = 'Ustozlar';
        try {
          await ctx.editMessageText(mainMessageAdmin, {
            reply_markup: {
              inline_keyboard: [
                ...buttons.buttons,
                [Markup.button.callback('◀️ Ortga', 'backToViewDepartment')],
              ],
            },
          });
        } catch (error) {
          console.log(error.message);
        }
        break;
      }
      case 'Dasturlash Bootcamp':
      case 'Dasturlash Standart': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Dasturlash yoʻnalishi',
          'departmentForViewUsers',
        );
        ctx.session.searchDepartment = 'Dasturlash yoʻnalishi';
        try {
          await ctx.editMessageText(mainMessageAdmin, {
            reply_markup: {
              inline_keyboard: [
                ...buttons.buttons,
                [Markup.button.callback('◀️ Ortga', 'backToViewDepartment')],
              ],
            },
          });
        } catch (error) {
          console.log(error.message);
        }
        break;
      }
      case 'Full Stack':
      case 'Backend':
      case 'Frontend': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Dasturlash Bootcamp',
          'departmentForViewUsers',
        );
        ctx.session.searchDepartment = 'Dasturlash Bootcamp';
        try {
          await ctx.editMessageText(mainMessageAdmin, {
            reply_markup: {
              inline_keyboard: [
                ...buttons.buttons,
                [Markup.button.callback('◀️ Ortga', 'backToViewDepartment')],
              ],
            },
          });
        } catch (error) {
          console.log(error.message);
        }
        break;
      }
      case 'Python':
      case 'ReactJS': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Dasturlash Standart',
          'departmentForViewUsers',
        );
        ctx.session.searchDepartment = 'Dasturlash Standart';
        try {
          await ctx.editMessageText(mainMessageAdmin, {
            reply_markup: {
              inline_keyboard: [
                ...buttons.buttons,
                [Markup.button.callback('◀️ Ortga', 'backToViewDepartment')],
              ],
            },
          });
        } catch (error) {
          console.log(error.message);
        }
        break;
      }
      case 'Dizayn Bootcamp':
      case 'Dizayn Standart': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Dizayn yoʻnalishi',
          'departmentForViewUsers',
        );
        ctx.session.searchDepartment = 'Dizayn yoʻnalishi';
        try {
          await ctx.editMessageText(mainMessageAdmin, {
            reply_markup: {
              inline_keyboard: [
                ...buttons.buttons,
                [Markup.button.callback('◀️ Ortga', 'backToViewDepartment')],
              ],
            },
          });
        } catch (error) {
          console.log(error.message);
        }
        break;
      }
      case 'Graphic Design':
      case 'Motion Graphics': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Dizayn Standart',
          'departmentForViewUsers',
        );
        ctx.session.searchDepartment = 'Dizayn Standart';
        try {
          await ctx.editMessageText(mainMessageAdmin, {
            reply_markup: {
              inline_keyboard: [
                ...buttons.buttons,
                [Markup.button.callback('◀️ Ortga', 'backToViewDepartment')],
              ],
            },
          });
        } catch (error) {
          console.log(error.message);
        }
        break;
      }
      case 'SMM Pro': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Marketing yoʻnalishi',
          'departmentForViewUsers',
        );
        ctx.session.searchDepartment = 'Marketing yoʻnalishi';
        try {
          await ctx.editMessageText(mainMessageAdmin, {
            reply_markup: {
              inline_keyboard: [
                ...buttons.buttons,
                [Markup.button.callback('◀️ Ortga', 'backToViewDepartment')],
              ],
            },
          });
        } catch (error) {
          console.log(error.message);
        }
        break;
      }
      default:
        console.log('default');
        break;
    }
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
