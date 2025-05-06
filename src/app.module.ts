import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';

import { typeOrmConfig } from './config/typeorm.config';
import redisConfig from './config/redis.config';

import { LoggerMiddleware } from './middleware/logger/logger.middleware';
import { ResponseInterceptor } from './common/response/response.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { CatsModule } from './cats/cats.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
// import { ElasticsearchModule } from './elasticsearch/elasticsearch.module';
import { ThrottlerCustomModule } from './throttler/throttler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('redis.host'),
        port: configService.get<number>('redis.port'),

        ttl: configService.get<number>('redis.ttl'),
      }),
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    CatsModule,
    TasksModule,
    UsersModule,
    AuthModule,
    ThrottlerCustomModule,
    // ElasticsearchModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('cats');
  }
}
