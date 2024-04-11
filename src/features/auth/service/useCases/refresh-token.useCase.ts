import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { Session_Orm } from '../../../security/entites/session.orm.entities';
import { SessionRepository } from '../../../security/repository/session.repository';
import { AuthService } from '../auth.service';

export class RefreshTokenCommand {
  constructor(
    public userId: number,
    public tokenKey: string,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    protected sessionRepository: SessionRepository,
    protected authService: AuthService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<Result<{ token: string; refreshToken: string } | string>> {
    const { userId, tokenKey } = command;

    const session = await this.findSession(userId, tokenKey);
    if (!session) return Result.Err(ErrorStatus.NOT_FOUND, 'Session not found');

    const deviceId = session.deviceId;
    const newTokenKey = crypto.randomUUID();

    await this.updateAndSaveSession(session, newTokenKey);
    const { token, refreshToken } = await this.authService.generateTokenPair(userId, newTokenKey, deviceId);
    return Result.Ok({ token, refreshToken });
  }

  async findSession(userId: number, tokenKey: string): Promise<Session_Orm | null> {
    const session = await this.sessionRepository.getByUserIdAndTokenKey(userId, tokenKey);
    if (!session) return null;
    return session;
  }

  async updateAndSaveSession(session: Session_Orm, newTokenKey: string): Promise<void> {
    session.updateSession(newTokenKey);
    await this.sessionRepository.save(session);
  }
}
