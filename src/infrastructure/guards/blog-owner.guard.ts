import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { BlogsRepository } from '../../features/blogs/repositories/blog.repository';
// Custom guard
// https://docs.nestjs.com/guards
@Injectable()
export class BlogOwnerGuard implements CanActivate {
  constructor(private blogRepository: BlogsRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log(request.params, 'params');
    const blogId = request.params.id;
    const userId = request.user.id;
    const blog = await this.blogRepository.getById(blogId);
    if (!blog) throw new NotFoundException();
    if (blog.userId != userId) throw new ForbiddenException();
    return true;
  }
}
