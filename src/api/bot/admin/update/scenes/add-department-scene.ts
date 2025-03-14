import { InjectRepository } from '@nestjs/typeorm';
import { Scene, SceneEnter, On, Ctx, Action } from 'nestjs-telegraf';
import {
  mainMessageAdmin,
  manageDepartmentKeys,
} from 'src/common/constants/admin';
import { ContextType } from 'src/common/types';
import { Department } from 'src/core/entity/departments.entity';
import { DepartmentRepository } from 'src/core/repository/department.repository';
import { Markup } from 'telegraf';

@Scene('AddDepartmentScene')
export class AddDepartmentScene {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepo: DepartmentRepository,
  ) {}
  @SceneEnter()
  async onEnter(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(`Bo'lim nomini kiriting:`);
  }

  @On('text')
  async onText(@Ctx() ctx: ContextType) {
    const department_name = await (ctx.update as any).message.text;

    const isUnique = await this.departmentRepo.findOne({
      where: { department_name },
    });

    if (isUnique) {
      await ctx.reply(`Bu bo'lim allaqachon mavjud !!!`);
      return;
    }

    const department = this.departmentRepo.create({
      department_name,
    });
    await this.departmentRepo.save(department);
    ctx.session.lastMessage = await ctx.reply(
      `<b>${department.department_name}</b> ni tasdiqlaysizmi ?`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              Markup.button.callback('Ha ✅', `accept=${department.id}`),
              Markup.button.callback(`Yo'q ❌`, `reject=${department.id}`),
            ],
          ],
        },
      },
    );
  }

  @Action(/accept/)
  async accept(@Ctx() ctx: ContextType) {
    const [, id] = (ctx.update as any).callback_query.data.split('=');
    await this.departmentRepo.update(id, { is_active: true });
    await ctx.answerCbQuery(`Yangi bo'lim qo'shildi ✅.`, { show_alert: true });
    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: manageDepartmentKeys,
    });
    await ctx.scene.leave();
  }

  @Action(/reject/)
  async reject(@Ctx() ctx: ContextType) {
    const [, id] = (ctx.update as any).callback_query.data.split('=');
    await this.departmentRepo.delete(id);
    await ctx.answerCbQuery(`Yangi bo'lim qo'shish bekor qilindi ❌.`, {
      show_alert: true,
    });
    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: manageDepartmentKeys,
    });
    await ctx.scene.leave();
  }
}
