import { Action, Ctx, Update } from 'nestjs-telegraf';
import {
  mainMessageAdmin,
  newsKeys,
  sendNewsKeys,
  backToSendNews,
  appealMenu,
  positionsKeys,
  newsStatusKeys,
  // newsStatusKeys,
} from 'src/common/constants/admin';
import { ContextType } from 'src/common/types';
import { InjectRepository } from '@nestjs/typeorm';
import { Markup } from 'telegraf';
import { User } from 'src/core/entity/user.entity';
import { UserRepository } from 'src/core/repository/user.repository';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Appeals } from 'src/core/entity/appeal.entity';
import { AppealRepository } from 'src/core/repository/appeal.repository';
import { Buttons } from 'src/api/bot/buttons/buttons.service';
import { Department } from 'src/core/entity/departments.entity';
import { DepartmentRepository } from 'src/core/repository/department.repository';
import { AppealStatus, UserRole, UserStatus } from 'src/common/enum';

@Update()
export class ManageAppealsActions {
  constructor(
    @InjectRepository(User) private readonly userRepo: UserRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @InjectRepository(Appeals) private readonly appealRepo: AppealRepository,
    @InjectRepository(Department)
    private readonly departmentRepo: DepartmentRepository,
    private readonly buttons: Buttons,
  ) {}
  @Action('sendNews')
  async sendNews(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, { reply_markup: sendNewsKeys });
  }

  @Action('forEverUsers')
  async forEverUsers(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: {
        inline_keyboard: [
          ...appealMenu.inline_keyboard,
          [Markup.button.callback('◀️ Ortga', 'backToSendNews')],
        ],
      },
    });
  }

  @Action('byDepatments')
  async byDepatments(@Ctx() ctx: ContextType) {
    const buttons = await this.buttons.generateDepartmentKeys(
      'departmentForSendAppeal',
    );
    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: {
        inline_keyboard: [
          ...buttons.buttons,
          ...backToSendNews.inline_keyboard,
        ],
      },
    });
  }

  @Action(/departmentForSendAppeal/)
  async departmentForSendAppeal(@Ctx() ctx: ContextType) {
    const [, department] = (ctx.update as any).callback_query.data.split(':');
    ctx.session.departmentForSendAppeal = department;
    const depInfo = await this.departmentRepo.findOne({
      where: { department_name: department },
      relations: ['child_departments'],
    });
    if (depInfo.child_departments.length != 0) {
      const buttons = await this.buttons.generateChildDepartmentKeys(
        department,
        'departmentForSendAppeal',
      );
      await ctx.editMessageText(mainMessageAdmin, {
        reply_markup: {
          inline_keyboard: [
            ...buttons.buttons,
            [
              Markup.button.callback(
                'Tanlash',
                'selectThisDepartmentForSendAppeal',
              ),
            ],
            [Markup.button.callback('◀️ Ortga', 'backFromSendAppeals')],
          ],
        },
      });
      return;
    }
    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: {
        inline_keyboard: [
          ...appealMenu.inline_keyboard,
          [Markup.button.callback('◀️ Ortga', 'backFromSendAppeals')],
        ],
      },
    });
  }

  @Action('backFromSendAppeals')
  async backFromSendAppeals(@Ctx() ctx: ContextType) {
    await this.cache.del(`appeal${ctx.from.id}`);
    switch (ctx.session.departmentForSendAppeal) {
      case 'HR Boʻlimi':
      case 'Oʻquv Boʻlimi': {
        const buttons = await this.buttons.generateDepartmentKeys(
          'departmentForSendAppeal',
        );
        await ctx.editMessageText(mainMessageAdmin, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [Markup.button.callback('◀️ Ortga', 'backToSendNews')],
            ],
          },
        });
        break;
      }
      case 'HR ish yuritish':
      case 'Recruiting':
      case 'Oʻqitish va rivojlantirish': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'HR Boʻlimi',
          'departmentForSendAppeal',
        );
        ctx.session.departmentForSendAppeal = 'HR Boʻlimi';
        await ctx.editMessageText(mainMessageAdmin, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [
                Markup.button.callback(
                  'Tanlash',
                  'selectThisDepartmentForSendAppeal',
                ),
              ],
              [Markup.button.callback('◀️ Ortga', 'backFromSendAppeals')],
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
          'departmentForSendAppeal',
        );
        ctx.session.departmentForSendAppeal = 'Oʻquv Boʻlimi';
        await ctx.editMessageText(mainMessageAdmin, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [
                Markup.button.callback(
                  'Tanlash',
                  'selectThisDepartmentForSendAppeal',
                ),
              ],
              [Markup.button.callback('◀️ Ortga', 'backFromSendAppeals')],
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
          'departmentForSendAppeal',
        );
        ctx.session.departmentForSendAppeal = 'Ustozlar';
        await ctx.editMessageText(mainMessageAdmin, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [
                Markup.button.callback(
                  'Tanlash',
                  'selectThisDepartmentForSendAppeal',
                ),
              ],
              [Markup.button.callback('◀️ Ortga', 'backFromSendAppeals')],
            ],
          },
        });
        break;
      }
      case 'Dasturlash Bootcamp':
      case 'Dasturlash Standart': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Dasturlash yoʻnalishi',
          'departmentForSendAppeal',
        );
        ctx.session.departmentForSendAppeal = 'Dasturlash yoʻnalishi';
        await ctx.editMessageText(mainMessageAdmin, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [
                Markup.button.callback(
                  'Tanlash',
                  'selectThisDepartmentForSendAppeal',
                ),
              ],
              [Markup.button.callback('◀️ Ortga', 'backFromSendAppeals')],
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
          'departmentForSendAppeal',
        );
        ctx.session.departmentForSendAppeal = 'Dasturlash Bootcamp';
        await ctx.editMessageText(mainMessageAdmin, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [
                Markup.button.callback(
                  'Tanlash',
                  'selectThisDepartmentForSendAppeal',
                ),
              ],
              [Markup.button.callback('◀️ Ortga', 'backFromSendAppeals')],
            ],
          },
        });
        break;
      }
      case 'Python':
      case 'ReactJS': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Dasturlash Standart',
          'departmentForSendAppeal',
        );
        ctx.session.departmentForSendAppeal = 'Dasturlash Standart';
        await ctx.editMessageText(mainMessageAdmin, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [
                Markup.button.callback(
                  'Tanlash',
                  'selectThisDepartmentForSendAppeal',
                ),
              ],
              [Markup.button.callback('◀️ Ortga', 'backFromSendAppeals')],
            ],
          },
        });
        break;
      }
      case 'Dizayn Bootcamp':
      case 'Dizayn Standart': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Dizayn yoʻnalishi',
          'departmentForSendAppeal',
        );
        ctx.session.departmentForSendAppeal = 'Dizayn yoʻnalishi';
        await ctx.editMessageText(mainMessageAdmin, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [
                Markup.button.callback(
                  'Tanlash',
                  'selectThisDepartmentForSendAppeal',
                ),
              ],
              [Markup.button.callback('◀️ Ortga', 'backFromSendAppeals')],
            ],
          },
        });
        break;
      }
      case 'Graphic Design':
      case 'Motion Graphics': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Dizayn Standart',
          'departmentForSendAppeal',
        );
        ctx.session.departmentForSendAppeal = 'Dizayn Standart';
        await ctx.editMessageText(mainMessageAdmin, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [
                Markup.button.callback(
                  'Tanlash',
                  'selectThisDepartmentForSendAppeal',
                ),
              ],
              [Markup.button.callback('◀️ Ortga', 'backFromSendAppeals')],
            ],
          },
        });
        break;
      }
      case 'SMM Pro': {
        const buttons = await this.buttons.generateChildDepartmentKeys(
          'Marketing yoʻnalishi',
          'departmentForSendAppeal',
        );
        ctx.session.departmentForSendAppeal = 'Marketing yoʻnalishi';
        await ctx.editMessageText(mainMessageAdmin, {
          reply_markup: {
            inline_keyboard: [
              ...buttons.buttons,
              [
                Markup.button.callback(
                  'Tanlash',
                  'selectThisDepartmentForSendAppeal',
                ),
              ],
              [Markup.button.callback('◀️ Ortga', 'backFromSendAppeals')],
            ],
          },
        });
        break;
      }
    }
  }

  @Action('selectThisDepartmentForSendAppeal')
  async selectThisDepartmentForSendAppeal(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: {
        inline_keyboard: [
          ...appealMenu.inline_keyboard,
          [Markup.button.callback('◀️ Ortga', 'backFromSendAppeals')],
        ],
      },
    });
  }

  @Action('byPositions')
  async byPositions(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: positionsKeys,
    });
  }

  @Action('forManagers')
  async forManagers(@Ctx() ctx: ContextType) {
    ctx.session.selectedRole = UserRole.MANAGER;
    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: {
        inline_keyboard: [
          ...appealMenu.inline_keyboard,
          [Markup.button.callback('◀️ Ortga', 'backFromPositions')],
        ],
      },
    });
  }

  @Action('forEmployees')
  async forEmployees(@Ctx() ctx: ContextType) {
    ctx.session.selectedRole = UserRole.MEMBER;
    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: {
        inline_keyboard: [
          ...appealMenu.inline_keyboard,
          [Markup.button.callback('◀️ Ortga', 'backFromPositions')],
        ],
      },
    });
  }

  @Action('backFromPositions')
  async backFromPositions(@Ctx() ctx: ContextType) {
    await this.cache.del(`appeal${ctx.from.id}`);
    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: positionsKeys,
    });
  }

  // @Action('forSelectedUsers')
  // async forSelectedUsers(@Ctx() ctx: ContextType) {
  //   await ctx.editMessageText(mainMessageAdmin, {
  //     reply_markup: backToSendNews,
  //   });
  // }

  @Action('backToSendNews')
  async backToSendNews(@Ctx() ctx: ContextType) {
    await this.cache.del(`appeal${ctx.from.id}`);
    await ctx.editMessageText(mainMessageAdmin, { reply_markup: sendNewsKeys });
  }

  @Action('backToNews')
  async backToNews(@Ctx() ctx: ContextType) {
    await this.cache.del(`appeal${ctx.from.id}`);
    await ctx.editMessageText(mainMessageAdmin, { reply_markup: newsKeys });
  }

  @Action('headerForAppeal')
  async headerForAppeal(@Ctx() ctx: ContextType) {
    await ctx.scene.enter('GetHeaderForAppeal');
  }

  @Action('textOfAppeal')
  async textOfAppeal(@Ctx() ctx: ContextType) {
    const appeal: any = await this.cache.get(`appeal${ctx.from.id}`);
    if (!appeal || !appeal.text) {
      await ctx.scene.enter('GetAppealsText');
      return;
    }
    await ctx.answerCbQuery(appeal.text, { show_alert: true });
  }

  @Action('addFile')
  async addFile(@Ctx() ctx: ContextType) {
    const appeal: any = await this.cache.get(`appeal${ctx.from.id}`);
    if (!appeal || !appeal.file_id) {
      await ctx.scene.enter('GetAppealsFile');
      return;
    }
    await ctx.answerCbQuery(`Murojat uchun file kiritib bolgansiz !`, {
      show_alert: true,
    });
  }

  @Action('sendAppeal')
  async sendAppeal(@Ctx() ctx: ContextType) {
    const appeal: any = await this.cache.get(`appeal${ctx.from.id}`);
    if (!appeal) {
      await ctx.answerCbQuery('Yuborish uchun muroat mavjud emas !', {
        show_alert: true,
      });
      return;
    }

    if (!appeal.header) {
      await ctx.answerCbQuery('Avval murojat sarlavhasini kiriting !', {
        show_alert: true,
      });
      return;
    }

    const { departmentForSendAppeal, selectedRole } = ctx.session;

    let userIdsQuery = this.userRepo.createQueryBuilder().select('telegram_id');

    if (departmentForSendAppeal) {
      userIdsQuery = userIdsQuery.where('department LIKE :department', {
        department: `%${departmentForSendAppeal}%`,
        status: UserStatus.ACTIVE,
      });
    }
    if (selectedRole) {
      userIdsQuery = userIdsQuery.andWhere('role = :role', {
        role: selectedRole,
      });
    }

    const userIds = await userIdsQuery.getRawMany();
    const userTelegramIds = userIds.map((user) => user.telegram_id);

    const newAppeal = this.appealRepo.create({
      text: appeal.text,
      file: appeal.file_id,
      header: appeal.header,
      unreadBy: userTelegramIds,
      readBy: [],
      department: departmentForSendAppeal,
      role: selectedRole,
    });

    await this.appealRepo.save(newAppeal);
    await this.cache.del(`appeal${ctx.from.id}`);
    await ctx.answerCbQuery(`Yangi Murojat:\n${newAppeal.text}`, {
      show_alert: true,
    });

    const messageOptions = {
      reply_markup: {
        inline_keyboard: [
          [Markup.button.callback(`O'qidim`, `readThisAppeal:${newAppeal.id}`)],
        ],
      },
    };

    const message = `<b>${newAppeal.header}</b>\n` + newAppeal.text;

    for (const userId of userTelegramIds) {
      if (newAppeal.file) {
        await ctx.telegram.sendDocument(userId, newAppeal.file, {
          caption: message,
          parse_mode: 'HTML',
          ...messageOptions,
        });
      } else {
        await ctx.telegram.sendMessage(userId, message, {
          ...messageOptions,
          parse_mode: 'HTML',
        });
      }
    }
  }

  @Action('newsStatus')
  async newsStatus(@Ctx() ctx: ContextType) {
    const result = await this.buttons.generateAppealKeys(
      'AppealsForAdmin',
      1,
      'AppNavForAd',
    );
    if (!result) {
      await ctx.answerCbQuery('Murojaatlar mavjud emas !');
      return;
    }
    await ctx.editMessageText(result.text, {
      reply_markup: {
        inline_keyboard: [
          ...result.buttons,
          [Markup.button.callback('◀️ Ortga', 'backToAppealsMenu')],
        ],
      },
    });
  }

  @Action(/AppNavForAd/)
  async AppNavForAd(@Ctx() ctx: ContextType) {
    const [, page] = (ctx.update as any).callback_query.data.split('=');
    ctx.session.appealPage = +page;
    const result = await this.buttons.generateAppealKeys(
      'AppealsForAdmin',
      +page,
      'AppNavForAd',
    );
    if (!result) {
      await ctx.answerCbQuery(`Boshqa murojaatlar yo'q`, { show_alert: true });
      return;
    }
    await ctx.editMessageText(result.text, {
      reply_markup: {
        inline_keyboard: [
          ...result.buttons,
          [Markup.button.callback('◀️ Ortga', 'backToAppealsMenu')],
        ],
      },
    });
  }

  @Action(/AppealsForAdmin/)
  async AppealsForAdmin(@Ctx() ctx: ContextType) {
    const [, id] = (ctx.update as any).callback_query.data.split('=');
    ctx.session.selectedAppeal = id;
    const appeal = await this.appealRepo.findOne({ where: { id } });
    if (!appeal.file) {
      await ctx.editMessageText(appeal.text, {
        reply_markup: {
          inline_keyboard: [...newsStatusKeys.inline_keyboard],
        },
      });
      return;
    }
    await ctx.deleteMessage();
    await ctx.sendDocument(appeal.file, {
      caption: appeal.text,
      reply_markup: {
        inline_keyboard: [...newsStatusKeys.inline_keyboard],
      },
    });
  }

  @Action('closeAppeal')
  async closeAppeal(@Ctx() ctx: ContextType) {
    await this.appealRepo.update(
      { id: ctx.session.selectedAppeal },
      { status: AppealStatus.CLOSED },
    );
    const result = await this.buttons.generateAppealKeys(
      'AppealsForAdmin',
      ctx.session.appealPage || 1,
      'AppNavForAd',
    );
    await ctx.answerCbQuery('Murojaat yopildi.', { show_alert: true });
    if (!result) {
      if ((ctx.update as any).callback_query.message.document) {
        await ctx.deleteMessage();
        await ctx.reply(mainMessageAdmin, {
          reply_markup: newsKeys,
        });
        return;
      }
      await ctx.editMessageText(mainMessageAdmin, {
        reply_markup: newsKeys,
      });
      return;
    }
    if ((ctx.update as any).callback_query.message.document) {
      await ctx.deleteMessage();
      await ctx.reply(result.text, {
        reply_markup: {
          inline_keyboard: [
            ...result.buttons,
            [Markup.button.callback('◀️ Ortga', 'backToAppealsMenu')],
          ],
        },
      });
      return;
    }
    await ctx.editMessageText(result.text, {
      reply_markup: {
        inline_keyboard: [
          ...result.buttons,
          [Markup.button.callback('◀️ Ortga', 'backToAppealsMenu')],
        ],
      },
    });
  }

  @Action('viewRead')
  async viewRead(@Ctx() ctx: ContextType) {
    const result = await this.buttons.generateUsersList(
      ctx.session.selectedAppeal,
      1,
      'readBy',
      'nfrfa',
    );
    if (!result) {
      await ctx.answerCbQuery(`Murojaatni o'qiganlar mavjud emas !`, {
        show_alert: true,
      });
      return;
    }
    if ((ctx.update as any).callback_query.message.document) {
      await ctx.deleteMessage();
      await ctx.reply(result.text, {
        reply_markup: {
          inline_keyboard: [
            ...result.buttons,
            [Markup.button.callback('◀️ Ortga', 'backToAppeal')],
          ],
        },
      });
      return;
    }
    await ctx.editMessageText(result.text, {
      reply_markup: {
        inline_keyboard: [
          ...result.buttons,
          [Markup.button.callback('◀️ Ortga', 'backToAppeal')],
        ],
      },
    });
  }

  @Action(/nfrfa/)
  async nfrfa(@Ctx() ctx: ContextType) {
    const [, page] = (ctx.update as any).callback_query.data.split('=');
    const result = await this.buttons.generateUsersList(
      ctx.session.selectedAppeal,
      +page,
      'readBy',
      'nfrfa',
    );

    if (!result) {
      await ctx.answerCbQuery('Boshqa mavjud emas !');
      return;
    }

    await ctx.editMessageText(result.text, {
      reply_markup: {
        inline_keyboard: [
          ...result.buttons,
          [Markup.button.callback('◀️ Ortga', 'backToAppeal')],
        ],
      },
    });
  }

  @Action('viewUnRead')
  async viewUnRead(@Ctx() ctx: ContextType) {
    const result = await this.buttons.generateUsersList(
      ctx.session.selectedAppeal,
      1,
      'unreadBy',
      'nfurfa',
    );
    if (!result) {
      await ctx.answerCbQuery(`Murojaatni o'qimaganlar mavjud emas !`, {
        show_alert: true,
      });
      return;
    }
    if ((ctx.update as any).callback_query.message.document) {
      await ctx.deleteMessage();
      await ctx.reply(result.text, {
        reply_markup: {
          inline_keyboard: [
            ...result.buttons,
            [Markup.button.callback('◀️ Ortga', 'backToAppeal')],
          ],
        },
      });
      return;
    }
    await ctx.editMessageText(result.text, {
      reply_markup: {
        inline_keyboard: [
          ...result.buttons,
          [Markup.button.callback('◀️ Ortga', 'backToAppeal')],
        ],
      },
    });
  }

  @Action(/nfurfa/)
  async nfurfa(@Ctx() ctx: ContextType) {
    const [, page] = (ctx.update as any).callback_query.data.split('=');
    const result = await this.buttons.generateUsersList(
      ctx.session.selectedAppeal,
      +page,
      'unreadBy',
      'nfurfa',
    );

    if (!result) {
      await ctx.answerCbQuery('Boshqa mavjud emas !');
      return;
    }

    await ctx.editMessageText(result.text, {
      reply_markup: {
        inline_keyboard: [
          ...result.buttons,
          [Markup.button.callback('◀️ Ortga', 'backToAppeal')],
        ],
      },
    });
  }

  @Action('backToAppeal')
  async backToAppeal(@Ctx() ctx: ContextType) {
    const appeal = await this.appealRepo.findOne({
      where: { id: ctx.session.selectedAppeal },
    });
    if (!appeal.file) {
      await ctx.editMessageText(appeal.text, {
        reply_markup: {
          inline_keyboard: [...newsStatusKeys.inline_keyboard],
        },
      });
      return;
    }
    await ctx.deleteMessage();
    await ctx.sendDocument(appeal.file, {
      caption: appeal.text,
      reply_markup: {
        inline_keyboard: [...newsStatusKeys.inline_keyboard],
      },
    });
  }

  @Action('backToAppealsMenu')
  async backToAppealsMenu(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, { reply_markup: newsKeys });
  }

  @Action('backToAppealsList')
  async backToAppealsList(@Ctx() ctx: ContextType) {
    const result = await this.buttons.generateAppealKeys(
      'AppealsForAdmin',
      ctx.session.appealPage || 1,
      'AppNavForAd',
    );
    if (!result) {
      await ctx.editMessageText(mainMessageAdmin, {
        reply_markup: newsKeys,
      });
      return;
    }
    if ((ctx.update as any).callback_query.message.document) {
      await ctx.deleteMessage();
      await ctx.reply(result.text, {
        reply_markup: {
          inline_keyboard: [
            ...result.buttons,
            [Markup.button.callback('◀️ Ortga', 'backToAppealsMenu')],
          ],
        },
      });
      return;
    }
    await ctx.editMessageText(result.text, {
      reply_markup: {
        inline_keyboard: [
          ...result.buttons,
          [Markup.button.callback('◀️ Ortga', 'backToAppealsMenu')],
        ],
      },
    });
  }
}
