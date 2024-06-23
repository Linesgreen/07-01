import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../../users/entites/user.orm.entities';
import { LikeStatus } from '../types/comments/input';
import { Comment_Orm } from './comment.orm.entities';

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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column({ type: 'enum', enum: LikeStatus })
  likeStatus: LikeStatus;

  static createCommentLikeModel(likeData: {
    commentId: number;
    userId: number;
    likeStatus: LikeStatus;
  }): Comment_like_Orm {
    const newLike = new Comment_like_Orm();
    newLike.commentId = likeData.commentId;
    newLike.userId = likeData.userId;
    newLike.likeStatus = likeData.likeStatus;
    newLike.createdAt = new Date();
    return newLike;
  }

  updateLikeStatus(likeStatus: LikeStatus): void {
    this.likeStatus = likeStatus;
  }
}
