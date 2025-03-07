import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { config } from 'src/config';

@Injectable()
export class LastMessageGuard implements CanActivate {
  private readonly bot: Telegraf;

  constructor() {
    this.bot = new Telegraf(config.BOT_TOKEN);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const [ctx] = context.getArgs();
    if (
      ctx.session.lastMessage &&
      ctx.update.callback_query.message.message_id !=
        ctx.session.lastMessage.message_id
    ) {
      await ctx.answerCbQuery(
        `So'ngi menyudan foydalaning !`,
        ctx.callbackQuery.id,
      );
      await ctx.deleteMessage(ctx.update.callback_query.message.message_id);
      return false;
    }
    return true;
  }
}
