import { Action, Ctx, Update } from 'nestjs-telegraf';
import {
  mainMessageAdmin,
  newsKeys,
  sendNewsKeys,
  backToSendNews,
  appealMenu,
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

@Update()
export class ManageAppealsActions {
  constructor(
    @InjectRepository(User) private readonly userRepo: UserRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @InjectRepository(Appeals) private readonly appealRepo: AppealRepository,
  ) {}
  @Action('sendNews')
  async sendNews(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, { reply_markup: sendNewsKeys });
  }

  @Action('forEverUsers')
  async forEverUsers(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, { reply_markup: appealMenu });
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
    await ctx.editMessageText(mainMessageAdmin, { reply_markup: sendNewsKeys });
  }

  @Action('backToNews')
  async backToNews(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, { reply_markup: newsKeys });
  }

  @Action('textOfAppeal')
  async textOfAppeal(@Ctx() ctx: ContextType) {
    const appeal: any = await this.cache.get(`appeal${ctx.from.id}`);
    if (!appeal || !appeal.text) {
      await ctx.scene.enter('GetAppealsText');
      return;
    }
    await ctx.answerCbQuery(appeal.text);
  }

  @Action('addFile')
  async addFile(@Ctx() ctx: ContextType) {
    const appeal: any = await this.cache.get(`appeal${ctx.from.id}`);
    if (!appeal || !appeal.file_id) {
      await ctx.scene.enter('GetAppealsFile');
      return;
    }
    await ctx.answerCbQuery(`Murojat uchun file kiritib bolgansiz !`);
  }

  @Action('sendAppeal')
  async sendAppeal(@Ctx() ctx: ContextType) {
    const appeal: any = await this.cache.get(`appeal${ctx.from.id}`);
    if (!appeal) {
      await ctx.answerCbQuery('Yuborish uchun muroat mavjud emas !');
      return;
    }
    console.log(appeal);
    const newAppeal = this.appealRepo.create({
      text: appeal.text,
      file: appeal.file_id,
    });
    await this.appealRepo.save(newAppeal);
    await this.cache.del(`appeal${ctx.from.id}`);
    await ctx.answerCbQuery(`Yangi Murojat:\n${newAppeal.text}`);
    const userIds = await this.userRepo
      .createQueryBuilder()
      .select('telegram_id')
      .getRawMany();
    if (!newAppeal.file) {
      for (const usr of userIds) {
        await ctx.telegram.sendMessage(usr.telegram_id, newAppeal.text, {
          reply_markup: {
            inline_keyboard: [
              [Markup.button.callback(`O'qidim`, 'readThisAppeal')],
            ],
          },
        });
      }
      return;
    }
    for (const usr of userIds) {
      await ctx.telegram.sendDocument(usr.telegram_id, newAppeal.file, {
        caption: newAppeal.text,
        reply_markup: {
          inline_keyboard: [
            [Markup.button.callback(`O'qidim`, 'readThisAppeal')],
          ],
        },
      });
    }
  }
}
