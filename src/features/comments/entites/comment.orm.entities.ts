import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Blog_Orm } from '../../blogs/entites/blog.orm.entities';
import { Post_Orm } from '../../posts/entites/post.orm.entities';
import { CommentCreateData } from '../../posts/types/input';
import { User_Orm } from '../../users/entites/user.orm.entities';
import { CommentUpdateModel } from '../types/comments/input';
import { Comment_like_Orm } from './comment-like.entities';

@Entity()
export class Comment_Orm extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column('timestamp with time zone')
  createdAt: Date;

  @Column()
  isActive: boolean;

  @Column()
  postId: number;

  @Column()
  userId: number;

  @ManyToOne(() => Post_Orm, (p) => p.comments)
  @JoinColumn({ name: 'postId' })
  post: Blog_Orm;

  @ManyToOne(() => User_Orm, (u) => u.comments)
  @JoinColumn({ name: 'userId' })
  user: User_Orm;

  @OneToMany(() => Comment_like_Orm, (l) => l.comment)
  likes: Comment_like_Orm[];

  static createCommentModel(postData: CommentCreateData): Comment_Orm {
    const comment = new Comment_Orm();
    comment.content = postData.content;
    comment.createdAt = new Date();
    comment.isActive = true;
    comment.postId = postData.postId;
    comment.userId = postData.userId;
    return comment;
  }

  update(updateData: CommentUpdateModel): void {
    this.content = updateData.content;
  }
}
