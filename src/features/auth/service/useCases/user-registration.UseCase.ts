import { CommandHandler } from '@nestjs/cqrs';
import { DataSource, EntityManager } from 'typeorm';

import { TransactionalCommandHandler } from '../../../../infrastructure/abstract-classes/transaction-commandHandler.abstract';
import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { MailService } from '../../../../mail/mail.service';
import { UserRepository } from '../../../users/repositories/user.repository';
import { UserService } from '../../../users/services/user.service';
import { UserRegistrationModel } from '../../types/input';

export class UserRegistrationCommand {
  constructor(public userData: UserRegistrationModel) {}
}

@CommandHandler(UserRegistrationCommand)
export class UserRegistrationUseCase extends TransactionalCommandHandler<UserRegistrationCommand> {
  constructor(
    protected userService: UserService,
    protected mailService: MailService,
    private userOrmRepository: UserRepository,
    dataSource: DataSource,
  ) {
    super(dataSource);
  }

  async handle(command: UserRegistrationCommand, entityManager: EntityManager): Promise<Result<string>> {
    const { email, login } = command.userData;

    const createResult = await this.userService.createUser(command.userData, entityManager);

    const userId = createResult.value.id;
    const user = await this.userOrmRepository.getById(userId);

    if (!user) return Result.Err(ErrorStatus.SERVER_ERROR, 'User created but not found');

    const confirmationCode = user.confirmationCode;
    await this.mailService.sendUserConfirmation({ email, login, token: confirmationCode });

    return Result.Ok('user registered successfully');
  }
}
