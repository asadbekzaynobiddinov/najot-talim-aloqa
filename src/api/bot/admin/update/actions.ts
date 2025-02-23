import { Action, Ctx, Update } from 'nestjs-telegraf';
import {
  adminMenu,
  backToAdminMenu,
  mainMessageAdmin,
} from 'src/common/constants/admin';
import { ContextType } from 'src/common/types';

@Update()
export class AdminActions {
  @Action('manageUsers')
  async manageUsers(@Ctx() ctx: ContextType) {
    await ctx.editMessageText('Manage Users', {
      reply_markup: backToAdminMenu,
    });
  }

  @Action('news')
  async news(@Ctx() ctx: ContextType) {
    await ctx.editMessageText('News', { reply_markup: backToAdminMenu });
  }

  @Action('departmentSettings')
  async departmentSettings(@Ctx() ctx: ContextType) {
    await ctx.editMessageText('Depatrment Settings', {
      reply_markup: backToAdminMenu,
    });
  }

  @Action('backToAdminMenu')
  async backToAdminMenu(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, { reply_markup: adminMenu });
  }
}
