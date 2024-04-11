import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Blog_Orm } from '../../blogs/entites/blog.orm.entities';
import { Comment_Orm } from '../../comments/entites/comment.orm.entities';
import { PostCreateModel } from '../types/input';
import { Post_like_Orm } from './post-like.orm.entities';

@Entity()
export class Post_Orm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  shortDescription: string;

  @Column()
  content: string;

  @Column('timestamp with time zone')
  createdAt: Date;

  @Column()
  isActive: boolean;

  @Column()
  blogId: number;

  @ManyToOne(() => Blog_Orm, (b) => b.posts)
  @JoinColumn({ name: 'blogId' })
  blog: Blog_Orm;

  @OneToMany(() => Comment_Orm, (c) => c.post)
  comments: Comment_Orm[];

  @OneToMany(() => Post_like_Orm, (pl) => pl.post)
  likes: Post_like_Orm[];

  static createPostModel(postData: PostCreateModel): Post_Orm {
    const post = new Post_Orm();
    post.title = postData.title;
    post.shortDescription = postData.shortDescription;
    post.content = postData.content;
    post.createdAt = new Date();
    post.isActive = true;
    post.blogId = postData.blogId;
    return post;
  }

  update(updateData: PostCreateModel): void {
    this.title = updateData.title;
    this.shortDescription = updateData.shortDescription;
    this.content = updateData.content;
    this.blogId = updateData.blogId;
  }
}
