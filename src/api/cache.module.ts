import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

@Global()
@Module({
  imports: [CacheModule.register()],
  exports: [CacheModule],
})
export class CacheConfigModule {}
