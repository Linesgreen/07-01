/* eslint-disable no-underscore-dangle */
import { CommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';

import { TransactionalCommandHandler } from '../../../../infrastructure/abstract-classes/transaction-commandHandler.abstract';
import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { SessionService } from '../../../security/service/session.service';
import { UserRepository } from '../../repositories/user.repository';

export class DeleteUserCommand {
  constructor(public userId: number) {}
}
//TODO показать класс
@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase extends TransactionalCommandHandler<DeleteUserCommand> {
  constructor(
    private userRepository: UserRepository,
    private sessionService: SessionService,
    dataSource: DataSource,
  ) {
    super(dataSource);
  }

  protected async handle({ userId }: DeleteUserCommand): Promise<Result<string>> {
    const userIsExist = await this.userRepository.checkIsExitsById(userId);
    if (!userIsExist) return Result.Err(ErrorStatus.NOT_FOUND, `User ${userId} not found`);

    // Деактивация всех сессий пользователя
    await this.sessionService.terminateAllSession(userId);
    // Отметка пользователя как удаленного

    await this.userRepository.deleteById(userId);

    return Result.Ok(`User ${userId} deleted`);
  }
}
