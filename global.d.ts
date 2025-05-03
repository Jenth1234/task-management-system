// global.d.ts
declare module 'cache-manager-ioredis' {
  import { Store } from 'cache-manager';
  import { RedisOptions } from 'ioredis';

  const redisStore: (options: RedisOptions) => Store;
  export = redisStore;
}
