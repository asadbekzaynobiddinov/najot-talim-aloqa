import { InjectRepository } from '@nestjs/typeorm';
import { Command, Ctx, Update } from 'nestjs-telegraf';
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
    if (!user) {
      await ctx.scene.enter('RegisterScene');
    }
  }
}
