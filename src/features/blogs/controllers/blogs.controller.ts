import { Controller, Get, NotFoundException, Param, ParseIntPipe, Query } from '@nestjs/common';

import { QueryPaginationPipe } from '../../../infrastructure/decorators/transform/query-pagination.pipe';
import { QueryPaginationResult } from '../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../../infrastructure/utils/createPagination';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { PostQueryRepository } from '../../posts/repositories/post/post.query.repository';
import { OutputPostType } from '../../posts/types/output';
import { BlogsQueryRepository } from '../repositories/blog.query.repository';
import { OutputBlogType } from '../types/output';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected readonly blogQueryRepository: BlogsQueryRepository,
    protected readonly postQueryRepository: PostQueryRepository,
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
