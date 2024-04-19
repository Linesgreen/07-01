import { CommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DataSource, EntityManager } from 'typeorm';

import { TransactionalCommandHandler } from '../../../../infrastructure/abstract-classes/transaction-commandHandler.abstract';
import { Result } from '../../../../infrastructure/object-result/objcet-result';
import { User_Orm } from '../../../users/entites/user.orm.entities';
import { UserRepository } from '../../../users/repositories/user.repository';

export class ChangePasswordCommand {
  constructor(
    public newPassword: string,
    public recoveryCode: string,
  ) {}
}

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordUseCase extends TransactionalCommandHandler<ChangePasswordCommand> {
  constructor(
    protected userRepository: UserRepository,
    protected jwtService: JwtService,
    dataSource: DataSource,
  ) {
    super(dataSource);
  }
  async handle(
    { newPassword, recoveryCode }: ChangePasswordCommand,
    entityManager: EntityManager,
  ): Promise<Result<string>> {
    const userEmail = this.getEmailFromJwt(recoveryCode);
    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await this.updatePasswordHashInDB(userEmail, newPasswordHash, entityManager);
    return Result.Ok('password changed successfully');
  }

  private getEmailFromJwt(jwt: string): string {
    const { email } = this.jwtService.decode(jwt);
    return email;
  }
  //TODO добавил якобы транзакцию
  private async updatePasswordHashInDB(email: string, newHash: string, entityManager: EntityManager): Promise<void> {
    const user: User_Orm | null = await this.userRepository.getByLoginOrEmail(email);
    if (!user) {
      throw new Error('user not found');
    }
    user.updatePasswordHash(newHash);
    await this.userRepository.save(user, entityManager);
  }
}
