import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { MailService } from '../../../../mail/mail.service';
import { UserRepository } from '../../../users/repositories/user.repository';
import { UserService } from '../../../users/services/user.service';
import { UserRegistrationModel } from '../../types/input';

export class UserRegistrationCommand {
  constructor(public userData: UserRegistrationModel) {}
}

@CommandHandler(UserRegistrationCommand)
export class UserRegistrationUseCase implements ICommandHandler<UserRegistrationCommand> {
  constructor(
    protected userService: UserService,
    protected mailService: MailService,
    private userOrmRepository: UserRepository,
  ) {}

  async execute(command: UserRegistrationCommand): Promise<Result<string>> {
    const { email, login } = command.userData;

    const createResult = await this.userService.createUser(command.userData);

    const userId = createResult.value.id;
    console.log(userId);
    const user = await this.userOrmRepository.getById(userId);

    if (!user) return Result.Err(ErrorStatus.SERVER_ERROR, 'User created but not found');

    const confirmationCode = user.confirmationCode;
    await this.mailService.sendUserConfirmation({ email, login, token: confirmationCode });

    return Result.Ok('user registered successfully');
  }
}
