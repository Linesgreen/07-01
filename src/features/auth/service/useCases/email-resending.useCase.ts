import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { MailService } from '../../../../mail/mail.service';
import { User } from '../../../users/entites/user';
import { UserOrmRepository } from '../../../users/repositories/postgres.user.repository';

export class EmailResendingCommand {
  constructor(public email: string) {}
}

@CommandHandler(EmailResendingCommand)
export class EmailResendingUseCase implements ICommandHandler<EmailResendingCommand> {
  constructor(
    protected mailService: MailService,
    protected postgresUserRepository: UserOrmRepository,
  ) {}

  async execute({ email }: EmailResendingCommand): Promise<Result<string>> {
    const targetUser: User | null = await this.postgresUserRepository.getByLoginOrEmail(email);
    if (!targetUser) return Result.Err(ErrorStatus.NOT_FOUND, 'user not found');
    // Обновляем код подтверждения и дату его протухания у пользователя
    targetUser.updateConfirmationCode();

    // Получаем информацию для обновления полей
    const { confirmationCode, login } = this.getUpdateFieldsInfo(targetUser);

    // Обновляем поле и отправляем письмо с подтверждением
    await this.postgresUserRepository.updateUserInfo(targetUser);
    await this.mailService.sendUserConfirmation(email, login, confirmationCode);
    return Result.Ok('email sended');
  }

  // Метод для получения информации для обновления полей
  private getUpdateFieldsInfo(targetUser: User): { confirmationCode: string; login: string } {
    const confirmationCode = targetUser.emailConfirmation.confirmationCode;
    const login = targetUser.accountData.login;
    return { confirmationCode, login };
  }
}
