import { Scene, SceneEnter, On, Action, Ctx } from 'nestjs-telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/core/entity/user.entity';
import { UserRepository } from 'src/core/repository/user.repository';
import { ContextType } from 'src/common/types';
import { Markup } from 'telegraf';
import { userKeysForAdmin } from 'src/common/constants/admin';

@Scene('ChangeUsersPhone')
export class ChangeUsersPhone {
  constructor(
    @InjectRepository(User) private readonly userRepo: UserRepository,
  ) {}

  @SceneEnter()
  async onEnter(@Ctx() ctx: ContextType) {
    await ctx.editMessageText('Hodimning yangi raqamini kiriting:');
  }

  @On('text')
  async onText(@Ctx() ctx: ContextType) {
    const phone_number = (ctx.update as any).message.text;
    ctx.session.usersNewPhone = phone_number;
    ctx.session.lastMessage = await ctx.reply(
      phone_number + ' ni tasdiqlaysizmi ?',
      {
        reply_markup: {
          inline_keyboard: [
            [
              Markup.button.callback('Ha', 'yes'),
              Markup.button.callback(`Yo'q`, 'no'),
            ],
          ],
        },
      },
    );
  }

  @Action('yes')
  async yes(@Ctx() ctx: ContextType) {
    const user = await this.userRepo.findOne({
      where: { id: ctx.session.selectedUser },
    });
    user.phone_number = ctx.session.usersNewPhone;
    await this.userRepo.save(user);
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
    await ctx.scene.leave();
  }

  @Action('no')
  async no(@Ctx() ctx: ContextType) {
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
    await ctx.scene.leave();
  }
}
