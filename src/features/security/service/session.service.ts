/* eslint-disable no-underscore-dangle */
import { Injectable } from '@nestjs/common';

import { ErrorStatus, Result } from '../../../infrastructure/object-result/objcet-result';
import { SessionOrmRepository } from '../repository/session.postgres.repository';

@Injectable()
export class SessionService {
  constructor(protected sessionRepository: SessionOrmRepository) {}

  async terminateCurrentSession(userId: number, tokenKey: string): Promise<Result<string>> {
    await this.sessionRepository.terminateSessionByTokenKey(tokenKey);
    const chekResult = await this.sessionRepository.getByUserIdAndTokenKey(userId, tokenKey);
    if (chekResult) return Result.Err(ErrorStatus.SERVER_ERROR, 'Session not terminated');
    return Result.Ok('Session terminated');
  }
  async terminateAllSession(userId: number): Promise<void> {
    await this.sessionRepository.terminateAllSessionByUserId(userId);
  }
  async terminateSessionByDeviceIdAndUserId(deviceId: string, userId: number): Promise<Result<string>> {
    await this.sessionRepository.terminateSessionByDeviceIdAndUserId(deviceId, userId);
    return Result.Ok(`Session ${deviceId} terminated`);
  }
  async terminateOtherSession(userId: number, tokenKey: string): Promise<Result<string>> {
    await this.sessionRepository.terminateOtherSession(userId, tokenKey);
    return Result.Ok(`other sessions terminated`);
  }
}
