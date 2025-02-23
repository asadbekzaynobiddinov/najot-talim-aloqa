import { Action, Ctx, Update } from 'nestjs-telegraf';
import {
  adminMenu,
  allUsersMessage,
  waitingUsersMessage,
  mainMessageAdmin,
  manageDepartmentKeys,
  manageUsersKeys,
  newsKeys,
  sendNewsKeys,
  newsStatusKeys,
  backToManageUsers,
  backToSendNews,
} from 'src/common/constants/admin';
import { ContextType } from 'src/common/types';

@Update()
export class AdminActions {
  /*


    Adminnning menyu tugmalari
    va ularning bajaradigan funksiyalari


   */

  @Action('manageUsers')
  async manageUsers(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(waitingUsersMessage + allUsersMessage, {
      reply_markup: manageUsersKeys,
    });
  }

  @Action('news')
  async news(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, { reply_markup: newsKeys });
  }

  @Action('departmentSettings')
  async departmentSettings(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: manageDepartmentKeys,
    });
  }

  /*
  

  Admin uchun menyuga qaytish tugmasi harakati


  */

  @Action('backToAdminMenu')
  async backToAdminMenu(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, { reply_markup: adminMenu });
  }

  /*
  

  Admin uchun foydalanuvchilar bilan ishlash 
  tugmalari va ularning funksiyalari 

  
  */

  @Action('registrationRequests')
  async registrationRequests(@Ctx() ctx: ContextType) {
    await ctx.editMessageText('Coming soon', {
      reply_markup: backToManageUsers,
    });
  }

  @Action('backToManageUsers')
  async backToManageUsers(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(waitingUsersMessage + allUsersMessage, {
      reply_markup: manageUsersKeys,
    });
  }

  @Action('viewUsers')
  async viewUsers(@Ctx() ctx: ContextType) {
    await ctx.editMessageText('Coming soon', {
      reply_markup: backToManageUsers,
    });
  }

  /*
  

  Yangiliklar va yangiliklarni
  jo'natish tugmalari va ularning bajaradigan 
  funksiyalari


  */

  @Action('sendNews')
  async sendNews(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, { reply_markup: sendNewsKeys });
  }

  @Action('forEverUsers')
  async forEverUsers(@Ctx() ctx: ContextType) {
    await ctx.editMessageText('Coming soon', { reply_markup: backToSendNews });
  }

  @Action('byDepatments')
  async byDepatments(@Ctx() ctx: ContextType) {
    await ctx.editMessageText('Coming soon', { reply_markup: backToSendNews });
  }

  @Action('byPositions')
  async byPositions(@Ctx() ctx: ContextType) {
    await ctx.editMessageText('Coming soon', { reply_markup: backToSendNews });
  }

  @Action('forSelectedUsers')
  async forSelectedUsers(@Ctx() ctx: ContextType) {
    await ctx.editMessageText('Coming soon', { reply_markup: backToSendNews });
  }

  @Action('backToSendNews')
  async backToSendNews(@Ctx() ctx: ContextType) {
    await ctx.editMessageText('Coming soon', { reply_markup: sendNewsKeys });
  }

  @Action('backToNews')
  async backToNews(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, { reply_markup: newsKeys });
  }

  /*
  
  
  Admin uchun yangiliklarning holatini
  korish tugmalari va ularni funksiyalari

  
  */

  @Action('newsStatus')
  async newsStatus(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, {
      reply_markup: newsStatusKeys,
    });
  }

  /*
  

  Bo'limlar bilan ishlash tugmalari va
  ularni funksiyalari


  */

  @Action('addNewDepartment')
  async addNewDepartment(@Ctx() ctx: ContextType) {
    await ctx.scene.enter('AddDepartmentScene');
  }
}
