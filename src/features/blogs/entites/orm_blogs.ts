/* eslint-disable @typescript-eslint/no-this-alias */
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Post_Orm } from '../../posts/entites/orm_post';
import { BlogCreateModel } from '../types/input';

@Entity({ name: 'blogs_orm' })
export class Blog_Orm extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
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
  //TODO в репу переместить
  async delete(): Promise<void> {
    this.isActive = false;
    await this.save();
  }
}
