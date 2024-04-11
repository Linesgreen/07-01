import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { UserRepository } from '../../../users/repositories/user.repository';

export class ChangeUserConfirmationCommand {
  constructor(
    public confCode: string,
    public confirmationStatus: boolean,
  ) {}
}

@CommandHandler(ChangeUserConfirmationCommand)
export class ChangeUserConfirmationUseCase implements ICommandHandler<ChangeUserConfirmationCommand> {
  constructor(protected userRepository: UserRepository) {}

  async execute(command: ChangeUserConfirmationCommand): Promise<Result<string>> {
    const { confCode, confirmationStatus } = command;
    const user = await this.userRepository.findByConfirmationCode(confCode);
    if (!user) {
      return Result.Err(ErrorStatus.SERVER_ERROR, `user with code ${confCode} not found`);
    }
    user.updateConfirmationStatus(confirmationStatus);
    await this.userRepository.save(user);
    return Result.Ok('user confirmed successfully');
  }
}
