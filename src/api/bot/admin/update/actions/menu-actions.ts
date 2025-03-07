import { InjectRepository } from '@nestjs/typeorm';
import { Update, Action, Ctx } from 'nestjs-telegraf';
import { User } from 'src/core/entity/user.entity';
import { UserRepository } from 'src/core/repository/user.repository';
import {
  mainMessageAdmin,
  waitingUsersMessage,
  allUsersMessage,
  adminMenu,
} from 'src/common/constants/admin';
import { ContextType } from 'src/common/types';
import { UserStatus } from 'src/common/enum';
import {
  manageUsersKeys,
  newsKeys,
  manageDepartmentKeys,
} from 'src/common/constants/admin';
import { LastMessageGuard } from 'src/common/guard/last-message.guard';
import { UseGuards } from '@nestjs/common';

@UseGuards(LastMessageGuard)
@Update()
export class AdminMenuActions {
  constructor(
    @InjectRepository(User) private readonly userRepo: UserRepository,
  ) {}
  @Action('manageUsers')
  async manageUsers(@Ctx() ctx: ContextType) {
    const countOfNotRegisteredUsers = await this.userRepo.count({
      where: { status: UserStatus.INACTIVE },
    });
    const countOfRegisteredUsers = await this.userRepo.count({
      where: { status: UserStatus.ACTIVE },
    });
    try {
      await ctx.editMessageText(
        waitingUsersMessage +
          countOfNotRegisteredUsers +
          '\n' +
          allUsersMessage +
          countOfRegisteredUsers,
        {
          reply_markup: manageUsersKeys,
        },
      );
    } catch (error) {
      console.log(error.message);
    }
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

  @Action('backToAdminMenu')
  async backToAdminMenu(@Ctx() ctx: ContextType) {
    await ctx.editMessageText(mainMessageAdmin, { reply_markup: adminMenu });
  }
}
