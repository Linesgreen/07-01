/* eslint-disable no-underscore-dangle */
import { add } from 'date-fns';
import process from 'process';

import { SessionOutputType } from '../../auth/types/output';
import { SessionPgDb } from '../types/output';
import { Session_Orm } from './orm_session';

export class Session {
  id: number;
  tokenKey: string;
  issuedDate: Date;
  expiredDate: Date;
  title: string;
  userId: number;
  ip: string;
  deviceId: string;

  constructor(tokenKey: string, deviceId: string, title: string, userId: number, ip: string) {
    this.tokenKey = tokenKey;
    this.issuedDate = new Date();
    this.expiredDate = add(new Date(), {
      seconds: Number(process.env.REFRESH_TOKEN_EXP),
    });
    this.title = title;
    this.userId = userId;
    this.ip = ip;
    this.deviceId = deviceId;
  }

  //TODO убрать лишний deviceID или Id
  static fromDbToInstance(sessionDb: SessionPgDb | Session_Orm): Session {
    const newSession = Object.create(Session.prototype);
    newSession.id = sessionDb.deviceId;
    newSession.tokenKey = sessionDb.tokenKey;
    newSession.issuedDate = sessionDb.issuedDate;
    newSession.expiredDate = sessionDb.expiredDate;
    newSession.title = sessionDb.title;
    newSession.userId = sessionDb.userId;
    newSession.ip = sessionDb.ip;
    newSession.deviceId = sessionDb.deviceId;
    return newSession;
  }

  toDto(): SessionOutputType {
    return {
      lastActiveDate: this.issuedDate.toISOString(),
      title: this.title,
      ip: this.ip,
      deviceId: this.deviceId,
    };
  }

  updateSession(newTokenKey: string): void {
    this.issuedDate = new Date();
    this.tokenKey = newTokenKey;
    this.expiredDate = add(new Date(), {
      seconds: Number(process.env.REFRESH_TOKEN_EXP),
    });
  }
}
