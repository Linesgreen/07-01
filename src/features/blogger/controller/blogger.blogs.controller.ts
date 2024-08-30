import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { QueryPaginationPipe } from '../../../infrastructure/decorators/transform/query-pagination.pipe';
import { BlogOwnerGuard } from '../../../infrastructure/guards/blog-owner.guard';
import { JwtAuthGuard } from '../../../infrastructure/guards/jwt-auth.guard';
import { ErrorResulter, Result } from '../../../infrastructure/object-result/objcet-result';
import { QueryPaginationResult } from '../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../../infrastructure/utils/createPagination';
import { CurrentUserId } from '../../auth/decorators/current-user.decorator';
import { BlogsQueryRepository } from '../../blogs/repositories/blog.query.repository';
import { BlogsService } from '../../blogs/services/blogs.service';
import { BlogCreateModel, PostToBlogCreateModel } from '../../blogs/types/input';
import { OutputBlogType } from '../../blogs/types/output';
import { PostQueryRepository } from '../../posts/repositories/post/post.query.repository';
import { PostService } from '../../posts/services/post.service';
import { PostInBlogUpdateType } from '../../posts/types/input';
import { OutputPostType } from '../../posts/types/output';
import { BlogCreateCommand } from '../command/blog-create.command';

@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly blogService: BlogsService,
    private readonly postService: PostService,
    private readonly postsQueryRepository: PostQueryRepository,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createBlog(
    @Body() data: BlogCreateModel,
    @CurrentUserId() userId: number,
  ): Promise<Promise<OutputBlogType | null>> {
    const result = await this.commandBus.execute<NonNullable<unknown>, Result<{ blogId: number }>>(
      new BlogCreateCommand({ blogCreateData: data, userId }),
    );

    return this.blogsQueryRepository.getById(result.value.blogId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllBlogs(
    @Query(QueryPaginationPipe) queryData: QueryPaginationResult,
    @CurrentUserId() userId: number,
  ): Promise<PaginationWithItems<OutputBlogType>> {
    console.log('userId', userId);
    return this.blogsQueryRepository.getAllBloggersBlogs(queryData, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, BlogOwnerGuard)
  @HttpCode(204)
  async updateBlog(@Param('id', ParseIntPipe) id: number, @Body() blogUpdateType: BlogCreateModel): Promise<void> {
    const result = await this.blogService.updateBlog(blogUpdateType, id);
    if (result.isFailure()) ErrorResulter.proccesError(result);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, BlogOwnerGuard)
  @HttpCode(204)
  async deleteBlog(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const result = await this.blogService.deleteBlog(id);
    if (result.isFailure()) ErrorResulter.proccesError(result);
  }

  @Post(':blogId/posts')
  @UseGuards(JwtAuthGuard, BlogOwnerGuard)
  async createPostToBlog(
    @Param('blogId', ParseIntPipe) blogId: number,
    @CurrentUserId() userId: number,
    @Body() postData: PostToBlogCreateModel,
  ): Promise<OutputPostType> {
    const result = await this.postService.createPost({ ...postData, blogId });

    if (result.isFailure()) ErrorResulter.proccesError(result);

    const { id: postId } = result.value as { id: number };

    const post = await this.postsQueryRepository.findById(postId, userId);

    if (!post) throw new HttpException('Post create error', 500);
    return post;
  }

  @Put(':blogId/posts/:postId')
  @UseGuards(JwtAuthGuard, BlogOwnerGuard)
  @HttpCode(204)
  async updatePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('blogId', ParseIntPipe) blogId: number,
    @Body() postUpdateData: PostInBlogUpdateType,
  ): Promise<void> {
    const result = await this.postService.updatePost(postUpdateData, postId, blogId);
    if (result.isFailure()) ErrorResulter.proccesError(result);
  }

  @Delete(':blogId/posts/:postId')
  @UseGuards(JwtAuthGuard, BlogOwnerGuard)
  @HttpCode(204)
  async deletePostForBlog(
    @Param('blogId', ParseIntPipe) blogId: number,
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<void> {
    const result = await this.postService.deletePost(postId, blogId);
    if (result.isFailure()) ErrorResulter.proccesError(result);
  }
}
