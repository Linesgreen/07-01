import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User_Orm } from '../../users/entites/orm_user';
import { LikeStatusE } from '../types/comments/input';
import { Comment_Orm } from './orm_comment';

@Entity()
export class Comment_like_Orm extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => Comment_Orm, (c) => c.likes)
  @JoinColumn({ name: 'commentId' })
  comment: Comment_Orm;

  @Column()
  commentId: number;

  @ManyToOne(() => User_Orm)
  @JoinColumn({ name: 'userId' })
  user: User_Orm;

  @Column()
  userId: number;

  @Column({ type: 'enum', enum: LikeStatusE })
  likeStatus: LikeStatusE;

  static createCommentLikeModel(likeData: {
    commentId: number;
    userId: number;
    likeStatus: LikeStatusE;
  }): Comment_like_Orm {
    const newLike = new Comment_like_Orm();
    newLike.commentId = likeData.commentId;
    newLike.userId = likeData.userId;
    newLike.likeStatus = likeData.likeStatus;
    newLike.createdAt = new Date();
    return newLike;
  }

  updateLikeStatus(likeStatus: LikeStatusE): void {
    this.likeStatus = likeStatus;
  }
}
