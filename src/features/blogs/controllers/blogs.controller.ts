import { Controller, Get, NotFoundException, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { QueryPaginationPipe } from '../../../infrastructure/decorators/transform/query-pagination.pipe';
import { QueryPaginationResult } from '../../../infrastructure/types/query-sort.type';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { PaginationWithItems } from '../../common/types/output';
import { PostOrmQueryRepository } from '../../posts/repositories/post/postgres.post.query.repository';
import { OutputPostType } from '../../posts/types/output';
import { BlogsOrmQueryRepository } from '../repositories/postgres.blogs.query.repository';
import { OutputBlogType } from '../types/output';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected readonly blogQueryRepository: BlogsOrmQueryRepository,
    protected readonly postQueryRepository: PostOrmQueryRepository,
    protected readonly commandBus: CommandBus,
  ) {}

  @Get('')
  async getAllBlogs(
    @Query(QueryPaginationPipe) queryData: QueryPaginationResult,
  ): Promise<PaginationWithItems<OutputBlogType>> {
    return this.blogQueryRepository.getAll(queryData);
  }

  @Get(':id')
  async getBlog(@Param('id', ParseIntPipe) id: number): Promise<OutputBlogType> {
    const targetBlog = await this.blogQueryRepository.getById(id);
    if (!targetBlog) throw new NotFoundException('Blog Not Found');
    return targetBlog;
  }

  @Get(':blogId/posts')
  async getPostForBlog(
    @CurrentUser() userId: number,
    @Query(QueryPaginationPipe) queryData: QueryPaginationResult,
    @Param('blogId', ParseIntPipe) blogId: number,
  ): Promise<PaginationWithItems<OutputPostType>> {
    const blog = await this.blogQueryRepository.getById(blogId);
    if (!blog) throw new NotFoundException('Blog Not Found');
    const post = await this.postQueryRepository.getPostsForBlog(queryData, userId, blogId);
    if (!post?.items?.length) throw new NotFoundException('Posts Not Found');
    return post;
  }
}
