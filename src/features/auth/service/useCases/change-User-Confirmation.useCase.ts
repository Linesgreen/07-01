import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result } from '../../../../infrastructure/object-result/objcet-result';
import { UserOrmRepository } from '../../../users/repositories/postgres.user.repository';

export class ChangeUserConfirmationCommand {
  constructor(
    public confCode: string,
    public confirmationStatus: boolean,
  ) {}
}

@CommandHandler(ChangeUserConfirmationCommand)
export class ChangeUserConfirmationUseCase implements ICommandHandler<ChangeUserConfirmationCommand> {
  constructor(protected postgreeUserRepository: UserOrmRepository) {}

  async execute(command: ChangeUserConfirmationCommand): Promise<Result<string>> {
    const { confCode, confirmationStatus } = command;
    const user = await this.postgreeUserRepository.findByConfirmationCode(confCode);
    //TODO сделать нормально!
    if (!user) {
      throw new Error('user not found');
    }
    user.updateConfirmationStatus(confirmationStatus);
    await this.postgreeUserRepository.updateUserInfo(user);
    return Result.Ok('user confirmed successfully');
  }
}
