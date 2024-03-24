import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Session_Orm } from '../../security/entites/orm_session';

@Entity()
export class User_Orm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  login: string;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'uuid' })
  confirmationCode: string;

  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date;

  @Column({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ default: false })
  isConfirmed: boolean;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Session_Orm, (s) => s.userId)
  sessions: Session_Orm[];
}
