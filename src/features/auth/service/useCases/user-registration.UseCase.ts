import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { MailService } from '../../../../mail/mail.service';
import { User } from '../../../users/entites/user';
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
  ) {}

  async execute(command: UserRegistrationCommand): Promise<void> {
    const { email, login } = command.userData;
    const newUser: User = await this.userService.createUser(command.userData);
    const confirmationCode = newUser.emailConfirmation.confirmationCode;
    await this.mailService.sendUserConfirmation(email, login, confirmationCode);
  }
}
