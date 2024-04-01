import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Blog_Orm } from '../../blogs/entites/orm_blogs';
import { Post_Orm } from '../../posts/entites/orm_post';
import { User_Orm } from '../../users/entites/orm_user';
import { CommentUpdateModel } from '../types/comments/input';
import { CommentCreateData } from './commentPG';

@Entity()
export class Comment_Orm {
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
