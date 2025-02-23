import { Command, Update } from 'nestjs-telegraf';

@Update()
export class BotUpdate {
  @Command('start')
  async start() {
    return 'hello';
  }
}
