import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { AuthGuard } from '../../../infrastructure/guards/auth-basic.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decrator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CommentsQueryRepository } from '../../comments/repositories/comments/comments.query.repository';
import { LikeCreateModel } from '../../comments/types/comments/input';
import { OutputCommentType } from '../../comments/types/comments/output';
import { PaginationWithItems } from '../../common/types/output';
import { PostsQueryRepository } from '../repositories/post/posts.query.repository';
import { PostService } from '../services/postService';
import { AddLikeToPostCommand } from '../services/useCase/add-like.to.post.useSace';
import { CreateCommentCommand } from '../services/useCase/create-comment.useCase';
import { GetAllPostsWithLikeStatusCommand } from '../services/useCase/get-all-posts-with-like-status.useCase';
import { GetCommentsToPostWithLikeStatusCommand } from '../services/useCase/get-comments-to-post-with-like-status.useCase';
import { GetPostWithLikeStatusCommand } from '../services/useCase/get-post-with-like-status.useCase';
import { CommentCreateModel, PostCreateModel, PostSortData, PostUpdateType } from '../types/input';
import { OutputPostType } from '../types/output';

@Controller('posts')
export class PostsController {
  constructor(
    protected readonly postService: PostService,
    protected readonly postQueryRepository: PostsQueryRepository,
    protected readonly commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getAllPosts(
    @CurrentUser() userId: string,
    @Query() queryData: PostSortData,
  ): Promise<PaginationWithItems<OutputPostType>> {
    return this.commandBus.execute(new GetAllPostsWithLikeStatusCommand(userId, queryData));
  }

  @Get(':postId')
  async getPost(@CurrentUser() userId: string, @Param('postId') postId: string): Promise<OutputPostType> {
    return this.commandBus.execute(new GetPostWithLikeStatusCommand(postId, userId));
  }

  @Get(':postId/comments')
  async getCommentsForPost(
    @CurrentUser() userId: string,
    @Param('postId') postId: string,
    @Query() queryData: PostSortData,
  ): Promise<PaginationWithItems<OutputCommentType>> {
    return this.commandBus.execute(new GetCommentsToPostWithLikeStatusCommand(userId, postId, queryData));
  }

  @Post()
  @UseGuards(AuthGuard)
  async createPost(@Body() postCreateData: PostCreateModel): Promise<OutputPostType> {
    const newPost: OutputPostType | null = await this.postService.createPost(postCreateData);
    return newPost!;
  }
  @Put(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async updatePost(@Param('id') id: string, @Body() postUpdateData: PostUpdateType): Promise<void> {
    const updateResult = await this.postService.updatePost(postUpdateData, id);
    if (!updateResult) throw new NotFoundException('Post Not Found');
    return;
  }
  @Put('/:postId/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async addLike(
    @Param('postId') postId: string,
    @Body() { likeStatus }: LikeCreateModel,
    @CurrentUser() userId: string,
  ): Promise<void> {
    await this.commandBus.execute(new AddLikeToPostCommand(postId, userId, likeStatus));
  }

  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  async createCommentToPost(
    @CurrentUser() userId: string,
    @Param('postId') postId: string,
    @Body() commentCreateData: CommentCreateModel,
  ): Promise<OutputCommentType> {
    const content = commentCreateData.content;
    return this.commandBus.execute(new CreateCommentCommand(userId, postId, content));
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async deletePost(@Param('id') id: string): Promise<void> {
    const delteResult = await this.postService.deleteBlog(id);
    if (!delteResult) throw new NotFoundException('Blog Not Found');
    return;
  }
}
