import { Controller, Get, HttpCode, Param, Put, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { QueryPaginationPipe } from '../../../infrastructure/decorators/transform/query-pagination.pipe';
import { AuthGuard } from '../../../infrastructure/guards/auth-basic.guard';
import { QueryPaginationResult } from '../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../../infrastructure/utils/createPagination';
import { PostQueryRepository } from '../../posts/repositories/post/post.query.repository';
import { PostService } from '../../posts/services/post.service';
import { BlogsQueryRepository } from '../repositories/blog.query.repository';
import { BlogsService } from '../services/blogs.service';
import { BindBlogsToUserCommand } from '../services/useCase/bind-blog-to-user.userCase';
import { OutputBlogType } from '../types/output';

@UseGuards(AuthGuard)
@Controller('/sa/blogs')
export class SaBlogsController {
  constructor(
    protected readonly blogQueryRepository: BlogsQueryRepository,
    protected readonly blogsService: BlogsService,
    protected readonly postQueryRepository: PostQueryRepository,
    protected readonly postService: PostService,
    protected readonly commandBus: CommandBus,
  ) {}

  @Get('')
  async getAllBlogs(
    @Query(QueryPaginationPipe) queryData: QueryPaginationResult,
  ): Promise<PaginationWithItems<OutputBlogType>> {
    return this.blogQueryRepository.getAllBlogsForSuperAdmin(queryData);
  }

  @Put('/:blogId/bind-with-user/:userId')
  @HttpCode(204)
  async bindUserToBlog(@Param() data: { blogId: string; userId: string }): Promise<void> {
    await this.commandBus.execute(
      new BindBlogsToUserCommand({ blogId: Number(data.blogId), userId: Number(data.userId) }),
    );
  }
}
