import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Scene, SceneEnter, Action, Ctx } from 'nestjs-telegraf';
import { Buttons } from 'src/api/bot/buttons/buttons.service';
import { mainMessageAdmin } from 'src/common/constants/admin';
import { ContextType } from 'src/common/types';
import { Markup } from 'telegraf';

@Scene('RegisterScene')
export class RegisterScene {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly buttons: Buttons,
  ) {}

  @SceneEnter()
  async onEnter(@Ctx() ctx: ContextType) {
    await this.cache.set(`${ctx.from.id}`, {
      telegram_id: ctx.from.id,
      first_name: ctx.from.first_name,
      last_name: ctx.from.last_name,
    });
    await ctx.reply(
      `<b>Ism:</b> ${ctx.from.first_name}\n<b>Familya:</b> ${ctx.from.last_name}\nShunday qoldirasizmi ?`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [Markup.button.callback('Qoldirish', 'toLeave')],
            [Markup.button.callback(`O'zgartirish`, 'change')],
          ],
        },
      },
    );
  }

  @Action('toLeave')
  async toLeave(@Ctx() ctx: ContextType) {
    await ctx.scene.enter('AskDepartmentScene');
  }
}

@Scene('AskDepartmentScene')
export class AskDepartmentScene {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly buttons: Buttons,
  ) {}
  @SceneEnter()
  async onEnter(@Ctx() ctx: ContextType) {
    const buttons = await this.buttons.generateDepartmentKeys(
      'departmentForRegister',
    );
    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: {
        inline_keyboard: [...buttons.buttons],
      },
    });
  }
}
