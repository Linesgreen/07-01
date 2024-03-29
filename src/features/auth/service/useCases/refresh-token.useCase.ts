import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { Session } from '../../../security/entites/session';
import { SessionOrmRepository } from '../../../security/repository/session.postgres.repository';
import { AuthService } from '../auth.service';

export class RefreshTokenCommand {
  constructor(
    public userId: string,
    public tokenKey: string,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    protected sessionRepository: SessionOrmRepository,
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

  async findSession(userId: string, tokenKey: string): Promise<Session | null> {
    const session = await this.sessionRepository.getByUserIdAndTokenKey(Number(userId), tokenKey);

    if (!session) return null;

    return session;
  }

  async updateAndSaveSession(session: Session, newTokenKey: string): Promise<void> {
    session.updateSession(newTokenKey);
    await this.sessionRepository.updateSession(session);
  }
}
