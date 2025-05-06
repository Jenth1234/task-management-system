import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        limit: 10,
        ttl: 60,
      },
    ]),
  ],
})
export class ThrottlerCustomModule {}
