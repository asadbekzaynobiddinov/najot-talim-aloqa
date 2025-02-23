import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'src/config';

export class Application {
  static async main(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    app.listen(config.PORT || 3000);
  }
}
