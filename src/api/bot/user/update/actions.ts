import { InjectRepository } from '@nestjs/typeorm';
import { Update, Action, Ctx } from 'nestjs-telegraf';
import { ContextType } from 'src/common/types';
import { Appeals } from 'src/core/entity/appeal.entity';
import { AppealRepository } from 'src/core/repository/appeal.repository';

@Update()
export class UserActions {
  constructor(
    @InjectRepository(Appeals) private readonly appRepo: AppealRepository,
  ) {}
  @Action(/readThisAppeal:/)
  async readThisAppeal(@Ctx() ctx: ContextType) {
    const [, id] = (ctx.update as any).callback_query.data.split(':');
    const userId = `${ctx.from.id}`;

    const appeal = await this.appRepo.findOne({ where: { id } });
    if (!appeal) {
      await ctx.answerCbQuery('Murojaat topilmadi!');
      return;
    }

    if (!appeal.readBy.includes(userId)) {
      appeal.readBy.push(userId);
    }

    const newUnreadBy = appeal.unreadBy.filter(
      (telegram_id) => telegram_id !== userId,
    );
    if (newUnreadBy.length !== appeal.unreadBy.length) {
      appeal.unreadBy = newUnreadBy;
      await this.appRepo.save(appeal);
    }

    await ctx.editMessageReplyMarkup(null);
    await ctx.answerCbQuery('Murojaat o‘qilgan deb belgilandi!', {
      show_alert: true,
    });
  }
}
