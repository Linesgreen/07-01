/* eslint-disable @typescript-eslint/no-this-alias */
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Post_Orm } from '../../posts/entites/post.orm.entities';
import { User } from '../../users/entites/user.orm.entities';
import { BlogCreateModel } from '../types/input';

@Entity({ name: 'blogs_orm' })
export class Blog_Orm extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ collation: 'C' })
  name: string;

  @Column()
  description: string;

  @Column()
  websiteUrl: string;

  @Column({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column()
  isMembership: boolean;

  @Column()
  isActive: boolean;

  @OneToMany(() => Post_Orm, (p) => p.blog)
  posts: Post_Orm[];

  @ManyToOne(() => User, (u) => u.blogs, { nullable: true })
  @JoinColumn()
  user: User | null;

  @Column()
  userId: number;

  static createBlogModel(blogData: BlogCreateModel): Blog_Orm {
    const blog = new Blog_Orm();
    blog.createdAt = new Date();
    blog.name = blogData.name;
    blog.description = blogData.description;
    blog.websiteUrl = blogData.websiteUrl;
    blog.isMembership = false;
    blog.isActive = true;
    return blog;
  }

  update(updateData: BlogCreateModel): void {
    if (updateData.name) {
      this.name = updateData.name;
    }
    if (updateData.description) {
      this.description = updateData.description;
    }
    if (updateData.websiteUrl) {
      this.websiteUrl = updateData.websiteUrl;
    }
  }

  async delete(): Promise<void> {
    this.isActive = false;
    await this.save();
  }

  addUserToBlog({ userId }: { userId: number }): void {
    this.userId = userId;
  }
}
