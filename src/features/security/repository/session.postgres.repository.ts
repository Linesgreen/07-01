/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AbstractRepository } from '../../../infrastructure/repositories/abstract.repository';
import { Session_Orm } from '../entites/orm_session';
import { Session } from '../entites/session';
import { SessionPgDb } from '../types/output';

export class SessionOrmRepository {
  constructor(@InjectRepository(Session_Orm) protected sessionRepository: Repository<Session_Orm>) {}
  async createSession(session: Session): Promise<{ id: number }> {
    const newSession = await this.sessionRepository.save(session);
    return { id: newSession.id };
  }

  async getByUserIdAndTokenKey(userId: number, tokenKey: string): Promise<Session | null> {
    const session = await this.sessionRepository.findOneBy([{ userId, tokenKey, isActive: true }]);

    if (!session) return null;
    return Session.fromDbToInstance(session);
  }

  async getByDeviceId(deviceId: string): Promise<Session | null> {
    const session = await this.sessionRepository.findOneBy([{ deviceId, isActive: true }]);
    if (!session) return null;
    return Session.fromDbToInstance(session);
  }
  //TODO через метод класса
  async updateSession(session: Session): Promise<void> {
    const entity = {
      tokenKey: session.tokenKey,
      issuedDate: session.issuedDate,
      expiredDate: session.expiredDate,
      title: session.title,
      userId: session.userId,
      ip: session.ip,
      deviceId: session.deviceId,
    };
    await this.sessionRepository.update({ deviceId: session.deviceId }, entity);
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

@Injectable()
export class PostgresSessionRepository extends AbstractRepository<SessionPgDb> {
  constructor(@InjectDataSource() protected dataSource: DataSource) {
    super(dataSource);
  }

  async addSession(newSession: Session): Promise<void> {
    const { tokenKey, issuedDate, expiredDate, title, userId, ip, deviceId } = newSession;
    const entity = { tokenKey, issuedDate, expiredDate, title, userId, ip, deviceId };
    await this.add('sessions', entity);
  }
  /**
   * Проверяет существование пользователя по логину или email
   * @returns true, если сессия существует и активна, иначе false
   * @param userId
   * @param tokenKey
   */
  async chekSessionIsExist(userId: number, tokenKey: string): Promise<boolean> {
    const conditions = { userId, tokenKey, active: true };
    return this.checkIfExistsByFields('sessions', conditions);
  }

  /**
   * @returns null или сессию
   * @param userId
   * @param tokenKey
   */
  async getByUserIdAndTokenKey(userId: number, tokenKey: string): Promise<Session | null> {
    const session = await this.dataSource.query(
      `SELECT id, "tokenKey", "issuedDate", "expiredDate", title, "userId", ip, "deviceId"
             FROM public.sessions
             WHERE "userId" = $1 AND "tokenKey" = $2`,
      [userId, tokenKey],
    );
    if (session.length === 0) return null;
    return Session.fromDbToInstance(session[0]);
  }
  /**
   * @returns null или сессию
   * @param deviceId
   */
  async getByDeviceId(deviceId: string): Promise<Session | null> {
    const fieldToSelect = ['id', 'tokenKey', 'issuedDate', 'expiredDate', 'title', 'ip', 'deviceId', 'userId'];
    const session = await this.getByFields('sessions', fieldToSelect, { deviceId: deviceId, active: true });
    if (!session) return null;
    return Session.fromDbToInstance(session[0]);
  }

  async terminateSessionByTokenKey(tokenKey: string): Promise<void> {
    const tableName = 'sessions';
    await this.updateFields(tableName, 'tokenKey', tokenKey, { active: false });
  }
  async terminateAllSessionByUserId(userId: string): Promise<void> {
    const tableName = 'sessions';
    await this.updateFields(tableName, 'userId', userId, { active: false });
  }
  async terminateSessionByDeviceIdAndUserId(deviceId: string, userId: number): Promise<void> {
    await this.dataSource.query(
      `
        UPDATE public.sessions SET "active" = false WHERE "userId" = $1 AND "deviceId" = $2`,
      [userId, deviceId],
    );
  }
  async terminateOtherSession(userId: string, tokenKey: string): Promise<void> {
    await this.dataSource.query(
      `
        UPDATE public.sessions SET "active" = false WHERE "userId" = $1 AND "tokenKey" != $2`,
      [userId, tokenKey],
    );
  }
  async updateSessionFields(
    searchField: string,
    searchValue: string | number,
    fieldsToUpdate: Record<string, unknown>,
  ): Promise<void> {
    const tableName = 'sessions'; // Указываем tableName внутри метода
    // Call the parent class method
    await this.updateFields(tableName, searchField, searchValue, fieldsToUpdate);
  }
}
