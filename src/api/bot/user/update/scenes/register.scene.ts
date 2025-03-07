import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Scene, SceneEnter, Action, Ctx, On } from 'nestjs-telegraf';
import { Buttons } from 'src/api/bot/buttons/buttons.service';
import { ContextType } from 'src/common/types';
import { Department } from 'src/core/entity/departments.entity';
import { User } from 'src/core/entity/user.entity';
import { DepartmentRepository } from 'src/core/repository/department.repository';
import { UserRepository } from 'src/core/repository/user.repository';
import { Markup } from 'telegraf';

@Scene('RegisterScene')
export class RegisterScene {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}
  @SceneEnter()
  async onEnter(@Ctx() ctx: ContextType) {
    await ctx.reply('Ismingizni kiriting: ');
  }

  @On('text')
  async onText(@Ctx() ctx: ContextType) {
    const first_name = (ctx.update as any).message.text;
    await this.cache.set(`${ctx.from.id}`, {
      telegram_id: ctx.from.id,
      first_name,
    });
    await ctx.scene.enter('AskLastName');
  }
}

@Scene('AskLastName')
export class AskLastName {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}
  @SceneEnter()
  async onEnter(@Ctx() ctx: ContextType) {
    await ctx.reply('Familyangizni kiriting: ');
  }

  @On('text')
  async onText(@Ctx() ctx: ContextType) {
    const last_name = (ctx.update as any).message.text;
    const user: any = await this.cache.get(`${ctx.from.id}`);
    await this.cache.set(`${ctx.from.id}`, { ...user, last_name });
    await ctx.reply('<b>Raqamni ulashish</b> tugmasini bosing:', {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [[Markup.button.contactRequest('Raqamni ulashish')]],
        one_time_keyboard: true,
        resize_keyboard: true,
        remove_keyboard: true,
      },
    });
  }

  @On('contact')
  async onContact(@Ctx() ctx: ContextType) {
    const phone_number = (ctx.update as any).message.contact.phone_number;
    const user: any = await this.cache.get(`${ctx.from.id}`);
    await this.cache.set(`${ctx.from.id}`, { ...user, phone_number });
    await ctx.scene.enter('AskDepartmentScene');
  }
}

@Scene('AskDepartmentScene')
export class AskDepartmentScene {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly buttons: Buttons,
    @InjectRepository(Department)
    private readonly departmentRepo: DepartmentRepository,
    @InjectRepository(User)
    private readonly userRepo: UserRepository,
  ) {}
  @SceneEnter()
  async onEnter(@Ctx() ctx: ContextType) {
    const buttons = await this.buttons.generateDepartmentKeys(
      'departmentForRegister',
    );

    if (ctx.callbackQuery) {
      await ctx.editMessageText(`Bo'limingizni tanlang:`, {
        reply_markup: {
          inline_keyboard: [...buttons.buttons],
        },
      });
      return;
    }
    ctx.reply(`Bo'limingizni tanlang:`, {
      reply_markup: {
        inline_keyboard: [...buttons.buttons],
      },
    });
  }

  @Action(/departmentForRegister/)
  async departmentForRegister(@Ctx() ctx: ContextType) {
    const [, department] = (ctx.update as any).callback_query.data.split(':');
    ctx.session.lastSelectedDepartment = department;
    const dep = ctx.session.userDepartment
      ? ctx.session.userDepartment + `:${department}`
      : '' + `:${department}`;
    ctx.session.userDepartment = dep;
    const depInfo = await this.departmentRepo.findOne({
      where: { department_name: department },
      relations: ['child_departments'],
    });
    if (depInfo.child_departments.length != 0) {
      const buttons = await this.buttons.generateChildDepartmentKeys(
        department,
        'departmentForRegister',
      );
      await ctx.editMessageText(`Bo'limingizni tanlang:`, {
        reply_markup: {
          inline_keyboard: [
            ...buttons.buttons,
            [
              Markup.button.callback(
                'Tanlash',
                'selectThisDepartmentForRegister',
              ),
            ],
            [Markup.button.callback('◀️ Ortga', 'backToRegister')],
          ],
        },
      });
      return;
    }
    const departments = dep.split(':');
    const user: any = await this.cache.get(`${ctx.from.id}`);

    const obj = {
      ...user,
      department: ctx.session.userDepartment.split(':').join(' '),
    };

    await this.cache.set(`${ctx.from.id}`, { ...obj });

    await ctx.editMessageText(
      `Ma'lumotlarni tasdiqlaylaysizmi:\n` +
        `<b>Ism:</b> ${obj.first_name}\n` +
        `<b>Familya:</b> ${obj.last_name}\n` +
        `<b>Raqam:</b> ${obj.phone_number}\n` +
        `<b>Bo'lim:</b> ${departments[departments.length - 1]}`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [Markup.button.callback('Tasdiqlash', 'accept')],
            [Markup.button.callback('Bekor qilish', 'reject')],
          ],
        },
      },
    );
  }

  @Action('selectThisDepartmentForRegister')
  async selectThisDepartmentForRegister(@Ctx() ctx: ContextType) {
    const departments = ctx.session.userDepartment.split(':');
    const user: any = await this.cache.get(`${ctx.from.id}`);

    const obj = {
      ...user,
      department: ctx.session.userDepartment.split(':').join(' '),
    };

    await this.cache.set(`${ctx.from.id}`, { ...obj });

    await ctx.editMessageText(
      `Ma'lumotlarni tasdiqlaylaysizmi:\n` +
        `<b>Ism:</b> ${obj.first_name}\n` +
        `<b>Familya:</b> ${obj.last_name}\n` +
        `<b>Raqam:</b> ${obj.phone_number}\n` +
        `<b>Bo'lim:</b> ${departments[departments.length - 1]}`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [Markup.button.callback('Tasdiqlash', 'accept')],
            [Markup.button.callback('Bekor qilish', 'reject')],
          ],
        },
      },
    );
  }

  @Action('accept')
  async accept(@Ctx() ctx: ContextType) {
    const user: any = await this.cache.get(`${ctx.from.id}`);
    const newUser = this.userRepo.create({
      telegram_id: `${user.telegram_id}`,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      department: user.department,
    });
    await this.cache.del(`${ctx.from.id}`);
    await this.userRepo.save(newUser);
    await ctx.deleteMessage();
    await ctx.reply(
      `Malumotlaringiz saqlandi iltimos tasdiqlanishini kuting !`,
      Markup.removeKeyboard(),
    );
    await ctx.scene.leave();
  }

  @Action('reject')
  async reject(@Ctx() ctx: ContextType) {
    await this.cache.del(`${ctx.from.id}`);
    ctx.session.currentDepartment = '';
    ctx.session.lastSelectedDepartment = '';
    ctx.session.userDepartment = '';
    await this.cache.del(`${ctx.from.id}`);
    await ctx.deleteMessage();
    await ctx.reply('Bekor qilindi !', Markup.removeKeyboard());
    await ctx.scene.leave();
  }

  @Action('backToRegister')
  async backToRegister(@Ctx() ctx: ContextType) {
    const dep = ctx.session.userDepartment
      .split(':')
      .slice(0, ctx.session.userDepartment.split(':').length - 1)
      .join(':');
    ctx.session.userDepartment = dep;
    switch (ctx.session.lastSelectedDepartment) {
      case 'HR Boʻlimi':
      case 'Oʻquv Boʻlimi': {
        const buttons = await this.buttons.generateDepartmentKeys(
          'departmentForRegister',
        );
        await ctx.editMessageText(`Bo'limingizni tanlang:`, {
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
          'departmentForRegister',
        );
        ctx.session.lastSelectedDepartment = 'HR Boʻlimi';
        await ctx.editMessageText(`Bo'limingizni tanlang:`, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [
                Markup.button.callback(
                  'Tanlash',
                  'selectThisDepartmentForRegister',
                ),
              ],
              [Markup.button.callback('◀️ Ortga', 'backToRegister')],
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
          'departmentForRegister',
        );
        ctx.session.lastSelectedDepartment = 'Oʻquv Boʻlimi';
        await ctx.editMessageText(`Bo'limingizni tanlang:`, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [
                Markup.button.callback(
                  'Tanlash',
                  'selectThisDepartmentForRegister',
                ),
              ],
              [Markup.button.callback('◀️ Ortga', 'backToRegister')],
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
          'departmentForRegister',
        );
        ctx.session.lastSelectedDepartment = 'Ustozlar';
        await ctx.editMessageText(`Bo'limingizni tanlang:`, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [
                Markup.button.callback(
                  'Tanlash',
                  'selectThisDepartmentForRegister',
                ),
              ],
              [Markup.button.callback('◀️ Ortga', 'backToRegister')],
            ],
          },
        });
        break;
      }
      case 'Dasturlash Bootcamp':
      case 'Dasturlash Standart': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Dasturlash yoʻnalishi',
          'departmentForRegister',
        );
        ctx.session.lastSelectedDepartment = 'Dasturlash yoʻnalishi';
        await ctx.editMessageText(`Bo'limingizni tanlang:`, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [
                Markup.button.callback(
                  'Tanlash',
                  'selectThisDepartmentForRegister',
                ),
              ],
              [Markup.button.callback('◀️ Ortga', 'backToRegister')],
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
          'departmentForRegister',
        );
        ctx.session.lastSelectedDepartment = 'Dasturlash Bootcamp';
        await ctx.editMessageText(`Bo'limingizni tanlang:`, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [
                Markup.button.callback(
                  'Tanlash',
                  'selectThisDepartmentForRegister',
                ),
              ],
              [Markup.button.callback('◀️ Ortga', 'backToRegister')],
            ],
          },
        });
        break;
      }
      case 'Python':
      case 'ReactJS': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Dasturlash Standart',
          'departmentForRegister',
        );
        ctx.session.lastSelectedDepartment = 'Dasturlash Standart';
        await ctx.editMessageText(`Bo'limingizni tanlang:`, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [
                Markup.button.callback(
                  'Tanlash',
                  'selectThisDepartmentForRegister',
                ),
              ],
              [Markup.button.callback('◀️ Ortga', 'backToRegister')],
            ],
          },
        });
        break;
      }
      case 'Dizayn Bootcamp':
      case 'Dizayn Standart': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Dizayn yoʻnalishi',
          'departmentForRegister',
        );
        ctx.session.lastSelectedDepartment = 'Dizayn yoʻnalishi';
        await ctx.editMessageText(`Bo'limingizni tanlang:`, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [
                Markup.button.callback(
                  'Tanlash',
                  'selectThisDepartmentForRegister',
                ),
              ],
              [Markup.button.callback('◀️ Ortga', 'backToRegister')],
            ],
          },
        });
        break;
      }
      case 'Graphic Design':
      case 'Motion Graphics': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Dizayn Standart',
          'departmentForRegister',
        );
        ctx.session.lastSelectedDepartment = 'Dizayn Standart';
        await ctx.editMessageText(`Bo'limingizni tanlang:`, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [
                Markup.button.callback(
                  'Tanlash',
                  'selectThisDepartmentForRegister',
                ),
              ],
              [Markup.button.callback('◀️ Ortga', 'backToRegister')],
            ],
          },
        });
        break;
      }
      case 'SMM Pro': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Marketing yoʻnalishi',
          'departmentForRegister',
        );
        ctx.session.lastSelectedDepartment = 'Marketing yoʻnalishi';
        await ctx.editMessageText(`Bo'limingizni tanlang:`, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [
                Markup.button.callback(
                  'Tanlash',
                  'selectThisDepartmentForRegister',
                ),
              ],
              [Markup.button.callback('◀️ Ortga', 'backToRegister')],
            ],
          },
        });
        break;
      }
    }
  }
}
