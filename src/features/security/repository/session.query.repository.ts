/* eslint-disable @typescript-eslint/no-unused-vars,no-underscore-dangle */
// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SessionOutputType } from '../../auth/types/output';
import { Session_Orm } from '../entites/session.orm.entities';
@Injectable()
export class SessionQueryRepository {
  constructor(@InjectRepository(Session_Orm) protected sessionOrmRepository: Repository<Session_Orm>) {}
  async getSessionsByUserId(userId: number): Promise<SessionOutputType[] | null> {
    const sessions = await this.sessionOrmRepository.findBy([{ userId, isActive: true }]);
    return sessions.map((s) => this._mapToDto(s));
  }

  private _mapToDto(session: Session_Orm): SessionOutputType {
    return {
      lastActiveDate: session.issuedDate.toISOString(),
      title: session.title,
      ip: session.ip,
      deviceId: session.deviceId,
    };
  }
}
