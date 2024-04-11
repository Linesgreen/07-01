import { add } from 'date-fns';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { configService } from '../../../settings/config.service';
import { User_Orm } from '../../users/entites/user.orm.entities';
import { SessionCreateData } from '../types/comon.types';

@Entity()
export class Session_Orm extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  deviceId: string;

  @Column({ type: 'uuid', unique: true })
  tokenKey: string;

  @Column({ type: 'timestamp with time zone' })
  issuedDate: Date;

  @Column({ type: 'timestamp with time zone' })
  expiredDate: Date;

  @Column()
  title: string;

  @Column()
  ip: string;

  // @ManyToOne(() => User_Orm)
  @Column()
  //@ManyToOne(() => User_Orm, (user) => user.sessions)
  userId: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User_Orm, (u) => u.sessions)
  @JoinColumn({ name: 'userId' })
  user: User_Orm;

  static createSessionModel(sessionCreateData: SessionCreateData): Session_Orm {
    const refTokenExpTime = configService.getRefreshTokenExp();

    const session = new Session_Orm();
    session.tokenKey = sessionCreateData.tokenKey;
    session.issuedDate = new Date();
    session.expiredDate = add(new Date(), {
      seconds: Number(refTokenExpTime),
    });
    session.title = sessionCreateData.title;
    session.ip = sessionCreateData.ip;
    session.userId = sessionCreateData.userId;
    session.deviceId = sessionCreateData.deviceId;
    return session;
  }
  updateSession(newTokenKey: string): void {
    const refTokenExpTime = configService.getRefreshTokenExp();
    this.issuedDate = new Date();
    this.tokenKey = newTokenKey;
    this.expiredDate = add(new Date(), {
      seconds: Number(refTokenExpTime),
    });
  }
}
