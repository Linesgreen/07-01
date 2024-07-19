/* eslint-disable @typescript-eslint/member-ordering,@typescript-eslint/no-explicit-any */

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { AsyncLocalStorage } from 'async_hooks';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class TransactionHelper {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    this.asyncLocalStorage = new AsyncLocalStorage();
  }

  private readonly asyncLocalStorage: AsyncLocalStorage<any>;

  getManager(): EntityManager {
    const storage = this.asyncLocalStorage.getStore();
    if (storage && storage.has('typeOrmEntityManager')) {
      return this.asyncLocalStorage.getStore().get('typeOrmEntityManager');
    }
    return this.dataSource.createEntityManager();
  }

  async doTransactional<T>(fn): Promise<T> {
    // @ts-ignore
    return this.dataSource.transaction(async (manager) => {
      let response: T | undefined;
      await this.asyncLocalStorage.run(new Map<string, EntityManager>(), async () => {
        this.asyncLocalStorage.getStore().set('typeOrmEntityManager', manager);
        response = await fn(manager);
      });
      if (response !== undefined) {
        return response;
      } else {
        // throw new Error('Response is not assigned.');
        return response;
      }
    });
  }
}
