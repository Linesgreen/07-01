import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { LikeStatusE } from '../../comments/types/comments/input';
import { User_Orm } from '../../users/entites/user.orm.entities';
import { Post_Orm } from './orm_post';

@Entity()
export class Post_like_Orm extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => Post_Orm, (p) => p.likes)
  @JoinColumn({ name: 'postId' })
  post: Post_Orm;

  @Column()
  postId: number;

  @ManyToOne(() => User_Orm, (u) => u.postLikes)
  @JoinColumn({ name: 'userId' })
  user: User_Orm;

  @Column()
  userId: number;

  @Column({ type: 'enum', enum: LikeStatusE })
  likeStatus: LikeStatusE;

  static createPostLikeModel(likeData: { postId: number; userId: number; likeStatus: LikeStatusE }): Post_like_Orm {
    const newLike = new Post_like_Orm();
    newLike.postId = likeData.postId;
    newLike.userId = likeData.userId;
    newLike.likeStatus = likeData.likeStatus;
    newLike.createdAt = new Date();
    return newLike;
  }

  updateLikeStatus(likeStatus: LikeStatusE): void {
    this.likeStatus = likeStatus;
  }
}
