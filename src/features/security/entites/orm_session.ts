import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User_Orm } from '../../users/entites/orm_user';

@Entity()
export class Session_Orm {
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
}
