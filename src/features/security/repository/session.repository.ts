/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection UnnecessaryLocalVariableJS

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Session_Orm } from '../entites/session.orm.entities';

export class SessionRepository {
  constructor(@InjectRepository(Session_Orm) protected sessionRepository: Repository<Session_Orm>) {}
  async save(session: Session_Orm): Promise<{ id: string }> {
    await this.sessionRepository.save(session);
    return { id: session.deviceId };
  }

  async getByUserIdAndTokenKey(userId: number, tokenKey: string): Promise<Session_Orm | null> {
    const session = await this.sessionRepository.findOneBy([{ userId, tokenKey, isActive: true }]);

    if (!session) return null;
    return session;
  }

  async getByDeviceId(deviceId: string): Promise<Session_Orm | null> {
    const session = await this.sessionRepository.findOneBy([{ deviceId, isActive: true }]);
    if (!session) return null;
    return session;
  }

  async terminateSessionByDeviceIdAndUserId(deviceId: string, userId: number): Promise<void> {
    await this.sessionRepository
      .createQueryBuilder()
      .update({ isActive: false })
      .where(`deviceId = '${deviceId}' AND userId = ${userId}`)
      .execute();
  }

  async terminateSessionByTokenKey(tokenKey: string): Promise<void> {
    await this.sessionRepository.update({ tokenKey }, { isActive: false });
  }

  async terminateAllSessionByUserId(userId: number): Promise<void> {
    await this.sessionRepository.update({ userId }, { isActive: false });
  }

  async terminateOtherSession(userId: number, tokenKey: string): Promise<void> {
    await this.sessionRepository
      .createQueryBuilder()
      .update({ isActive: false })
      .where(`tokenKey != '${tokenKey}' AND userId = ${userId}`)
      .execute();
  }
}
