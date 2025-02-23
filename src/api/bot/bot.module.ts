import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { config } from 'src/config';
import { BotUpdate } from './bot.update';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: config.BOT_TOKEN,
      middlewares: [
        session(),
        async (ctx, next) => {
          if (!ctx.session) {
            ctx.session = {};
          }
          await next();
        },
      ],
    }),
  ],
  providers: [BotUpdate],
})
export class BotModule {}
