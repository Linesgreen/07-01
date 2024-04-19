import { CommandHandler } from '@nestjs/cqrs';
import { DataSource, EntityManager } from 'typeorm';

import { TransactionalCommandHandler } from '../../../../infrastructure/abstract-classes/transaction-commandHandler.abstract';
import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { UserRepository } from '../../../users/repositories/user.repository';
import { AboutMeType } from '../../types/output';

export class UserGetInformationAboutMeCommand {
  constructor(public userId: number) {}
}
@CommandHandler(UserGetInformationAboutMeCommand)
export class GetInformationAboutUserCase extends TransactionalCommandHandler<UserGetInformationAboutMeCommand> {
  constructor(
    private userRepository: UserRepository,
    dataSource: DataSource,
  ) {
    super(dataSource);
  }
  async handle(
    { userId }: UserGetInformationAboutMeCommand,
    entityManager: EntityManager,
  ): Promise<Result<AboutMeType | string>> {
    const user = await this.userRepository.getById(userId, entityManager);
    if (!user) return Result.Err(ErrorStatus.NOT_FOUND, 'User not found');
    const { email, login } = user;

    const id = user.id.toString();
    return Result.Ok({ email, login, userId: id });
  }
}
