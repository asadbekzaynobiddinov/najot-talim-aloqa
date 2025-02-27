import { InjectRepository } from '@nestjs/typeorm';
import { Scene, SceneEnter, On, Ctx, Action } from 'nestjs-telegraf';
import { childDepartments, departmentKeys } from 'src/common/constants/admin';
import { ContextType } from 'src/common/types';
import { Department } from 'src/core/entity/departments.entity';
import { DepartmentRepository } from 'src/core/repository/department.repository';
import { Markup } from 'telegraf';

@Scene('AddChildDepartmentScene')
export class AddChildDepartmentScene {
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
      parent_name: ctx.session.currentDepartment,
    });
    await this.departmentRepo.save(department);

    const parentDepartment = await this.departmentRepo.findOne({
      where: { department_name: department.parent_name },
      relations: ['child_departments'],
    });

    parentDepartment.child_departments.push(department);

    await this.departmentRepo.save(parentDepartment);

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
    const department = await this.departmentRepo.findOne({
      where: { department_name: ctx.session.currentDepartment },
      relations: ['child_departments'],
    });
    const buttons = [...departmentKeys.inline_keyboard];
    if (department.child_departments.length !== 0) {
      buttons.unshift(childDepartments.inline_keyboard[0]);
    }
    await ctx.editMessageText(`<b>${department.department_name}</b>`, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: buttons,
      },
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
    const department = await this.departmentRepo.findOne({
      where: { department_name: ctx.session.currentDepartment },
      relations: ['child_departments'],
    });
    const buttons = [...departmentKeys.inline_keyboard];
    if (department.child_departments.length !== 0) {
      buttons.unshift(childDepartments.inline_keyboard[0]);
    }
    await ctx.editMessageText(`<b>${department.department_name}</b>`, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
    await ctx.scene.leave();
  }
}
