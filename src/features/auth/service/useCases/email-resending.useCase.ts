import { CommandHandler } from '@nestjs/cqrs';
import { DataSource, EntityManager } from 'typeorm';

import { TransactionalCommandHandler } from '../../../../infrastructure/abstract-classes/transaction-commandHandler.abstract';
import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { MailService } from '../../../../mail/mail.service';
import { UserRepository } from '../../../users/repositories/user.repository';

export class EmailResendingCommand {
  constructor(public email: string) {}
}

@CommandHandler(EmailResendingCommand)
export class EmailResendingUseCase extends TransactionalCommandHandler<EmailResendingCommand> {
  constructor(
    protected mailService: MailService,
    protected userRepository: UserRepository,
    dataSource: DataSource,
  ) {
    super(dataSource);
  }

  async handle({ email }: EmailResendingCommand, entityManager: EntityManager): Promise<Result<string>> {
    const targetUser = await this.userRepository.getByLoginOrEmail(email, entityManager);
    if (!targetUser) return Result.Err(ErrorStatus.NOT_FOUND, 'user not found');
    // Обновляем код подтверждения и дату его протухания у пользователя
    targetUser.updateConfirmationCode();

    // Получаем информацию для обновления полей
    const { confirmationCode, login } = targetUser;

    // Обновляем поле и отправляем письмо с подтверждением
    await this.userRepository.save(targetUser, entityManager);
    await this.mailService.sendUserConfirmation({ email, login, token: confirmationCode });
    return Result.Ok('email sended');
  }
}
