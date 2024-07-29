import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Comment_Orm } from '../../comments/entites/comment.orm.entities';
import { Comment_like_Orm } from '../../comments/entites/comment-like.entities';
import { Post_like_Orm } from '../../posts/entites/post-like.orm.entities';
import { Player } from '../../quiz/entites/player.entity';
import { Session_Orm } from '../../security/entites/session.orm.entities';
import { UserCreateData } from '../types/input';
//Разобраться с флоу юзера
@Entity()
export class User extends BaseEntity {
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

  @OneToMany(() => Comment_Orm, (c) => c.userId)
  comments: Comment_Orm[];

  @OneToMany(() => Comment_like_Orm, (cl) => cl.userId)
  commentLikes: Comment_like_Orm[];

  @OneToMany(() => Post_like_Orm, (pl) => pl.userId)
  postLikes: Post_like_Orm[];

  @OneToMany(() => Player, (player) => player.user)
  player: Player[];

  static createUserModel(userData: UserCreateData, passwordHash: string): User {
    const user = new User();
    user.login = userData.login;
    user.email = userData.email;

    user.passwordHash = passwordHash;
    user.createdAt = new Date();

    user.confirmationCode = randomUUID();
    user.expirationDate = add(new Date(), {
      hours: 1,
    });
    user.isConfirmed = false;
    user.isActive = true;
    return user;
  }

  updatePasswordHash(passwordHash: string): void {
    this.passwordHash = passwordHash;
  }
  updateConfirmationCode(): void {
    this.confirmationCode = randomUUID();
    this.expirationDate = add(new Date(), { hours: 1 });
  }

  updateConfirmationStatus(status: boolean): void {
    this.isConfirmed = status;
  }
}
