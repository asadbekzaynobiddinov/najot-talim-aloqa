import { Update, Command, Ctx } from 'nestjs-telegraf';
import { mainMessageAdmin, adminMenu } from 'src/common/constants/admin';
import { ContextType } from 'src/common/types';

@Update()
export class AdminCommands {
  @Command('admin')
  async admin(@Ctx() ctx: ContextType) {
    await ctx.reply(mainMessageAdmin, { reply_markup: adminMenu });
  }
}
