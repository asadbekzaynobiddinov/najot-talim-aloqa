import { InjectRepository } from '@nestjs/typeorm';
import { Command, Ctx, Update } from 'nestjs-telegraf';
import { mainMessageAdmin } from 'src/common/constants/admin';
import { userMenu } from 'src/common/constants/user/keys';
import { UserStatus } from 'src/common/enum';
import { ContextType } from 'src/common/types';
import { User } from 'src/core/entity/user.entity';
import { UserRepository } from 'src/core/repository/user.repository';

@Update()
export class BotUpdate {
  constructor(
    @InjectRepository(User) private readonly userRepo: UserRepository,
  ) {}

  @Command('start')
  async start(@Ctx() ctx: ContextType) {
    const user = await this.userRepo.findOne({
      where: { telegram_id: `${ctx.from.id}` },
    });
    console.log(user);
    if (!user) {
      await ctx.scene.enter('RegisterScene');
      return;
    }
    if (user.status == UserStatus.INACTIVE) {
      return 'Iltimos adminlar ruxsatini kuting !';
    }

    ctx.session.lastMessage = await ctx.reply(mainMessageAdmin, {
      reply_markup: userMenu,
    });
  }
}
