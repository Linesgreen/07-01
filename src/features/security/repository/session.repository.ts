/* eslint-disable @typescript-eslint/no-unused-vars,no-underscore-dangle */
// noinspection UnnecessaryLocalVariableJS

import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { Session_Orm } from '../entites/session.orm.entities';

export class SessionRepository {
  constructor(@InjectRepository(Session_Orm) protected sessionRepository: Repository<Session_Orm>) {}
  async save(session: Session_Orm, entityManager?: EntityManager): Promise<{ id: string }> {
    const sessionRepository = this._getSessionRepository(entityManager);
    await sessionRepository.save(session);
    return { id: session.deviceId };
  }

  async getByUserIdAndTokenKey(
    userId: number,
    tokenKey: string,
    entityManager?: EntityManager,
  ): Promise<Session_Orm | null> {
    const sessionRepository = this._getSessionRepository(entityManager);

    const session = await sessionRepository.findOneBy([{ userId, tokenKey, isActive: true }]);

    if (!session) return null;
    return session;
  }

  async getByDeviceId(deviceId: string, entityManager?: EntityManager): Promise<Session_Orm | null> {
    const sessionRepository = this._getSessionRepository(entityManager);

    const session = await sessionRepository.findOneBy([{ deviceId, isActive: true }]);
    if (!session) return null;
    return session;
  }

  async terminateSessionByDeviceIdAndUserId(
    deviceId: string,
    userId: number,
    entityManager?: EntityManager,
  ): Promise<void> {
    const sessionRepository = this._getSessionRepository(entityManager);

    await sessionRepository
      .createQueryBuilder()
      .update({ isActive: false })
      .where(`deviceId = '${deviceId}' AND userId = ${userId}`)
      .execute();
  }

  async terminateSessionByTokenKey(tokenKey: string, entityManager?: EntityManager): Promise<void> {
    const sessionRepository = this._getSessionRepository(entityManager);

    await sessionRepository.update({ tokenKey }, { isActive: false });
  }

  async terminateAllSessionByUserId(userId: number, entityManager?: EntityManager): Promise<void> {
    const sessionRepository = this._getSessionRepository(entityManager);

    await sessionRepository.update({ userId }, { isActive: false });
  }

  async terminateOtherSession(userId: number, tokenKey: string, entityManager?: EntityManager): Promise<void> {
    const sessionRepository = this._getSessionRepository(entityManager);

    await sessionRepository
      .createQueryBuilder()
      .update({ isActive: false })
      .where(`tokenKey != '${tokenKey}' AND userId = ${userId}`)
      .execute();
  }
  private _getSessionRepository(entityManager?: EntityManager): Repository<Session_Orm> {
    let sessionRepository = this.sessionRepository;
    if (entityManager) {
      sessionRepository = entityManager.getRepository(Session_Orm);
    }
    return sessionRepository;
  }
}
