import { Scene, SceneEnter, On, Ctx } from 'nestjs-telegraf';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { ContextType } from 'src/common/types';
import { appealMenu, mainMessageAdmin } from 'src/common/constants/admin';
import { Markup } from 'telegraf';

@Scene('GetAppealsText')
export class GetAppealsText {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}
  @SceneEnter()
  async onEnter(@Ctx() ctx: ContextType) {
    await ctx.editMessageText('Murojat matnini kiriting:');
  }

  @On('text')
  async onText(@Ctx() ctx: ContextType) {
    const text = (ctx.update as any).message.text;
    const appeal: any = await this.cache.get(`appeal${ctx.from.id}`);
    await this.cache.set(`appeal${ctx.from.id}`, { ...appeal, text });
    await ctx.reply(mainMessageAdmin, {
      reply_markup: {
        inline_keyboard: [
          ...appealMenu.inline_keyboard,
          [Markup.button.callback('◀️ Ortga', 'backToSendNews')],
        ],
      },
    });
    await ctx.scene.leave();
  }
}

@Scene('GetAppealsFile')
export class GetAppealsFile {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}
  @SceneEnter()
  async onEnter(@Ctx() ctx: ContextType) {
    await ctx.editMessageText('Murojat faylini yuboring:');
  }

  @On('document')
  async onText(@Ctx() ctx: ContextType) {
    const appeal: any = await this.cache.get(`appeal${ctx.from.id}`);
    const file = (ctx.update as any).message.document;
    await this.cache.set(`appeal${ctx.from.id}`, {
      ...appeal,
      file_id: file.file_id,
    });
    await ctx.reply(mainMessageAdmin, {
      reply_markup: {
        inline_keyboard: [
          ...appealMenu.inline_keyboard,
          [Markup.button.callback('◀️ Ortga', 'backToSendNews')],
        ],
      },
    });
    await ctx.scene.leave();
  }
}

@Scene('GetHeaderForAppeal')
export class GetHeaderForAppeal {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}
  @SceneEnter()
  async onEnter(@Ctx() ctx: ContextType) {
    await ctx.editMessageText('Murojat sarlavhasini kiriting:');
  }

  @On('text')
  async onText(@Ctx() ctx: ContextType) {
    const header = (ctx.update as any).message.text;
    const appeal: any = await this.cache.get(`appeal${ctx.from.id}`);
    await this.cache.set(`appeal${ctx.from.id}`, { ...appeal, header });
    await ctx.reply(mainMessageAdmin, {
      reply_markup: {
        inline_keyboard: [
          ...appealMenu.inline_keyboard,
          [Markup.button.callback('◀️ Ortga', 'backToSendNews')],
        ],
      },
    });
    await ctx.scene.leave();
  }
}
