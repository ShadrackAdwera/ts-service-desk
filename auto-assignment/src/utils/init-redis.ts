import { createClient, RedisClientType } from 'redis';

class RedisClient {
  private _client?: RedisClientType;

  get client() {
    if (!this._client) {
      throw new Error('REDIS must be initialised');
    }
    return this._client;
  }

  connect(url: string): Promise<void> {
    console.log(url);
    this._client = createClient({
      socket: {
        host: 'auth-redis-service',
        port: 6379,
      },
    });
    return this.client
      .connect()
      .then(() => {
        console.log('Connected to REDIS');
      })
      .catch((error) => console.log(error));
  }
}

export const initRedis = new RedisClient();
