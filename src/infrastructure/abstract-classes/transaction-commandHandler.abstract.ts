/* eslint-disable @typescript-eslint/no-explicit-any */
import { ICommandHandler } from '@nestjs/cqrs';
import { DataSource, EntityManager } from 'typeorm';

import { ErrorStatus, Result } from '../object-result/objcet-result';

interface ICommand {}

export abstract class TransactionalCommandHandler<C extends ICommand> implements ICommandHandler<C> {
  protected constructor(protected readonly dataSource: DataSource) {}

  async execute(command: C): Promise<Result<{ token: string; refreshToken: string } | string>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const entityManager = queryRunner.manager;

    try {
      const result = await this.handle(command, entityManager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return Result.Err(ErrorStatus.SERVER_ERROR, error.message);
    } finally {
      await queryRunner.release();
    }
  }
  //TODO разобраться с any
  protected abstract handle(command: C, entityManager: EntityManager): Promise<Result<any | string>>;
}
