import { Injectable } from '@nestjs/common';

import { ErrorStatus, Result } from '../../../infrastructure/object-result/objcet-result';
import { Blogs_Orm } from '../entites/orm_blogs';
import { BlogsOrmRepository, PostgresBlogsRepository } from '../repositories/postgres.blogs.repository';
import { BlogCreateModel } from '../types/input';
//TODO обсудирь
@Injectable()
export class BlogsService {
  constructor(
    protected postgresBlogsRepository: PostgresBlogsRepository,
    protected blogRepository: BlogsOrmRepository,
  ) {}

  async createBlog(blogData: BlogCreateModel): Promise<Result<{ id: number }>> {
    const newBlog = Blogs_Orm.createBlogModel(blogData);
    const blogId = await this.blogRepository.addBlog(newBlog);
    return Result.Ok(blogId);
  }

  async updateBlog(newData: BlogCreateModel, blogId: number): Promise<Result<string>> {
    const blog = await this.blogRepository.getById(blogId);
    if (!blog) {
      return Result.Err(ErrorStatus.NOT_FOUND, 'blog not found');
    }
    blog.update(newData);
    await this.blogRepository.save(blog);
    return Result.Ok('blog updated successfully');
  }

  async deleteBlog(blogId: number): Promise<Result<string>> {
    const blog = await this.blogRepository.getById(blogId);
    if (!blog) {
      return Result.Err(ErrorStatus.NOT_FOUND, 'blog not found');
    }
    await blog.delete();
    return Result.Ok('blog deleted successfully');
  }
}
