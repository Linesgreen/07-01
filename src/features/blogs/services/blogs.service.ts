import { Injectable } from '@nestjs/common';

import { ErrorStatus, Result } from '../../../infrastructure/object-result/objcet-result';
import { Blog_Orm } from '../entites/blog.orm.entities';
import { BlogsRepository } from '../repositories/blog.repository';
import { BlogCreateModel } from '../types/input';

@Injectable()
export class BlogsService {
  constructor(protected blogRepository: BlogsRepository) {}

  async createBlog(blogData: BlogCreateModel): Promise<Result<{ id: number }>> {
    const newBlog = Blog_Orm.createBlogModel(blogData);
    const blogId = await this.blogRepository.save(newBlog);
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
