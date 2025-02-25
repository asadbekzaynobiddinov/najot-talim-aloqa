import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { config } from 'src/config';
import { BotUpdate } from './bot.update';
import { AdminModule } from './admin/admin.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/core/entity/user.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: config.BOT_TOKEN,
      middlewares: [
        session(),
        async (ctx, next) => {
          if (!ctx.session) {
            ctx.session = {};
            ctx.session.manageDeparment = ctx.session.manageDeparment
              ? ctx.session.manageDeparment
              : {};
          }
          await next();
        },
      ],
    }),
    TypeOrmModule.forFeature([User]),
    AdminModule,
    UserModule,
  ],
  providers: [BotUpdate],
})
export class BotModule {}
