
import * as memjs from 'memjs';

export class CacheManager {
  private client: any;

  constructor(endpoint: string) {
    this.client = memjs.Client.create(endpoint);
  }

  async set(key: string, value: any, expires: number = 3600) {
    return new Promise((resolve, reject) => {
      this.client.set(key, JSON.stringify(value), { expires }, (err: any) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }

  async get(key: string): Promise<any | null> {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err: any, value: any) => {
        if (err) reject(err);
        else resolve(value ? JSON.parse(value.toString()) : null);
      });
    });
  }
}
