/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SessionOutputType } from '../../auth/types/output';
import { Session_Orm } from '../entites/orm_session';
import { Session } from '../entites/session';
@Injectable()
export class SessionQueryRepository {
  constructor(@InjectRepository(Session_Orm) protected sessionQueryRepository: Repository<Session_Orm>) {}
  async getSessionsByUserId(userId: number): Promise<SessionOutputType[] | null> {
    const sessions = await this.sessionQueryRepository.findBy([{ userId, isActive: true }]);
    return sessions.map((s) => Session.fromDbToInstance(s).toDto());
  }
}
