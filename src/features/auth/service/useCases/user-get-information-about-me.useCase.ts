import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { UserOrmRepository } from '../../../users/repositories/postgres.user.repository';
import { AboutMeType } from '../../types/output';

export class UserGetInformationAboutMeCommand {
  constructor(public userId: number) {}
}
@CommandHandler(UserGetInformationAboutMeCommand)
export class GetInformationAboutUserCase implements ICommandHandler<UserGetInformationAboutMeCommand> {
  constructor(private UserRepository: UserOrmRepository) {}

  async execute({ userId }: UserGetInformationAboutMeCommand): Promise<Result<AboutMeType | string>> {
    const user = await this.UserRepository.getById(userId);
    if (!user) return Result.Err(ErrorStatus.NOT_FOUND, 'User not found');
    const { email, login } = user.accountData;

    const id = user.id!.toString();
    return Result.Ok({ email, login, userId: id });
  }
}
