import { CommandHandler } from '@nestjs/cqrs';
import { DataSource, EntityManager } from 'typeorm';

import { TransactionalCommandHandler } from '../../../../infrastructure/abstract-classes/transaction-commandHandler.abstract';
import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { UserRepository } from '../../../users/repositories/user.repository';

export class ChangeUserConfirmationCommand {
  constructor(
    public confCode: string,
    public confirmationStatus: boolean,
  ) {}
}

@CommandHandler(ChangeUserConfirmationCommand)
export class ChangeUserConfirmationUseCase extends TransactionalCommandHandler<ChangeUserConfirmationCommand> {
  constructor(
    protected userRepository: UserRepository,
    dataSource: DataSource,
  ) {
    super(dataSource);
  }

  async handle(command: ChangeUserConfirmationCommand, entityManager: EntityManager): Promise<Result<string>> {
    const { confCode, confirmationStatus } = command;
    const user = await this.userRepository.findByConfirmationCode(confCode, entityManager);
    if (!user) {
      return Result.Err(ErrorStatus.SERVER_ERROR, `user with code ${confCode} not found`);
    }
    user.updateConfirmationStatus(confirmationStatus);
    await this.userRepository.save(user, entityManager);
    return Result.Ok('user confirmed successfully');
  }
}
