import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { MailService } from '../../../../mail/mail.service';
import { User_Orm } from '../../../users/entites/user.orm.entities';
import { UserRepository } from '../../../users/repositories/user.repository';

export class EmailResendingCommand {
  constructor(public email: string) {}
}

@CommandHandler(EmailResendingCommand)
export class EmailResendingUseCase implements ICommandHandler<EmailResendingCommand> {
  constructor(
    protected mailService: MailService,
    protected userRepository: UserRepository,
  ) {}

  async execute({ email }: EmailResendingCommand): Promise<Result<string>> {
    const targetUser = await this.userRepository.getByLoginOrEmail(email);
    if (!targetUser) return Result.Err(ErrorStatus.NOT_FOUND, 'user not found');
    // Обновляем код подтверждения и дату его протухания у пользователя
    targetUser.updateConfirmationCode();

    // Получаем информацию для обновления полей
    const { confirmationCode, login } = this.getUpdateFieldsInfo(targetUser);

    // Обновляем поле и отправляем письмо с подтверждением
    await this.userRepository.save(targetUser);
    await this.mailService.sendUserConfirmation(email, login, confirmationCode);
    return Result.Ok('email sended');
  }

  // Метод для получения информации для обновления полей
  private getUpdateFieldsInfo(targetUser: User_Orm): { confirmationCode: string; login: string } {
    const confirmationCode = targetUser.confirmationCode;
    const login = targetUser.login;
    return { confirmationCode, login };
  }
}
