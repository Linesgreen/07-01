import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { QueryPaginationPipe } from '../../../infrastructure/decorators/transform/query-pagination.pipe';
import { AuthGuard } from '../../../infrastructure/guards/auth-basic.guard';
import { ErrorResulter } from '../../../infrastructure/object-result/objcet-result';
import { QueryPaginationResult } from '../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../../infrastructure/utils/createPagination';
import { CurrentUserId } from '../../auth/decorators/current-user.decorator';
import { PostQueryRepository } from '../../posts/repositories/post/post.query.repository';
import { PostService } from '../../posts/services/post.service';
import { PostInBlogUpdateType } from '../../posts/types/input';
import { OutputPostType } from '../../posts/types/output';
import { BlogsQueryRepository } from '../repositories/blog.query.repository';
import { BlogsService } from '../services/blogs.service';
import { BlogCreateModel, PostToBlogCreateModel } from '../types/input';
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
    @CurrentUserId() userId: number,
    @Query(QueryPaginationPipe) queryData: QueryPaginationResult,
    @Param('blogId', ParseIntPipe) blogId: number,
  ): Promise<PaginationWithItems<OutputPostType>> {
    const blog = await this.blogQueryRepository.getById(blogId);
    if (!blog) throw new NotFoundException('Blog Not Found');
    const post = await this.postQueryRepository.getPostsForBlog(queryData, userId, blogId);
    if (!post?.items?.length) throw new NotFoundException('Posts Not Found');
    return post;
  }

  @Post('')
  async createBlog(@Body() blogCreateData: BlogCreateModel): Promise<OutputBlogType> {
    const result = await this.blogsService.createBlog(blogCreateData);

    const blogId = result.value.id;

    const blog = await this.blogQueryRepository.getById(blogId);

    if (!blog) throw new HttpException('Blog create error', 500);
    return blog;
  }

  @Post(':blogId/posts')
  @UseGuards(AuthGuard)
  async createPostToBlog(
    @Param('blogId', ParseIntPipe) blogId: number,
    @Body() postData: PostToBlogCreateModel,
  ): Promise<OutputPostType> {
    const result = await this.postService.createPost({ ...postData, blogId });

    if (result.isFailure()) ErrorResulter.proccesError(result);

    const { id: postId } = result.value as { id: number };

    const post = await this.postQueryRepository.findById(postId, null);

    if (!post) throw new HttpException('Post create error', 500);
    return post;
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async updateBlog(@Param('id', ParseIntPipe) id: number, @Body() blogUpdateType: BlogCreateModel): Promise<void> {
    const result = await this.blogsService.updateBlog(blogUpdateType, id);
    if (result.isFailure()) ErrorResulter.proccesError(result);
  }

  @Put(':blogId/posts/:postId')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async updatePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('blogId', ParseIntPipe) blogId: number,
    @Body() postUpdateData: PostInBlogUpdateType,
  ): Promise<void> {
    const result = await this.postService.updatePost(postUpdateData, postId, blogId);
    if (result.isFailure()) ErrorResulter.proccesError(result);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async deleteBlog(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const result = await this.blogsService.deleteBlog(id);
    if (result.isFailure()) ErrorResulter.proccesError(result);
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(204)
  async deletePostForBlog(
    @Param('blogId', ParseIntPipe) blogId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<void> {
    const result = await this.postService.deletePost(postId, blogId);
    if (result.isFailure()) ErrorResulter.proccesError(result);
  }
}
