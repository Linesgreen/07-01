/* eslint-disable no-underscore-dangle */
import { CommandHandler } from '@nestjs/cqrs';
import { DataSource, EntityManager } from 'typeorm';

import { TransactionalCommandHandler } from '../../../../infrastructure/abstract-classes/transaction-commandHandler.abstract';
import { Result } from '../../../../infrastructure/object-result/objcet-result';
import { Session_Orm } from '../../../security/entites/session.orm.entities';
import { SessionRepository } from '../../../security/repository/session.repository';
import { SessionCreateData } from '../../../security/types/comon.types';
import { AuthService } from '../auth.service';

export class UserLoginCommand {
  constructor(
    public userId: number,
    public ip: string,
    public userAgent: string,
  ) {}
}

@CommandHandler(UserLoginCommand)
export class UserLoginUseCase extends TransactionalCommandHandler<UserLoginCommand> {
  constructor(
    protected sessionRepository: SessionRepository,
    protected authService: AuthService,
    dataSource: DataSource,
  ) {
    super(dataSource);
  }

  async handle(
    command: UserLoginCommand,
    entityManager: EntityManager,
  ): Promise<Result<{ token: string; refreshToken: string }>> {
    const { userId, ip, userAgent } = command;
    const tokenKey = crypto.randomUUID();
    const deviceId = crypto.randomUUID();
    await this.createSession({ userId, deviceId, ip, title: userAgent, tokenKey }, entityManager);
    const { token, refreshToken } = await this.authService.generateTokenPair(userId, tokenKey, deviceId);
    return Result.Ok({ token, refreshToken });
  }

  async createSession(sessionData: SessionCreateData, entityManager: EntityManager): Promise<void> {
    const session = Session_Orm.createSessionModel(sessionData);
    await this.sessionRepository.save(session, entityManager);
  }
}
