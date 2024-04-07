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
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { CommentOwnerGuard } from '../../../infrastructure/guards/comment-owner.guard';
import { JwtAuthGuard } from '../../../infrastructure/guards/jwt-auth.guard';
import { ErrorResulter } from '../../../infrastructure/object-result/objcet-result';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CommentOrmQueryRepository } from '../repositories/comments/postgres.comments.query.repository';
import { AddLikeToCommentCommand } from '../service/useCase/add-like.useCase';
import { DeleteCommentByIdCommand } from '../service/useCase/delte-comment-byId.useCase';
import { UpdateCommentCommand } from '../service/useCase/update-comment.useCase';
import { CommentUpdateModel, LikeCreateModel } from '../types/comments/input';
import { OutputCommentType } from '../types/comments/output';

@Controller('comments')
export class CommentsController {
  constructor(
    private commandBus: CommandBus,
    private commentQueryRepository: CommentOrmQueryRepository,
  ) {}

  @Get(':commentId')
  async getCommentById(
    @CurrentUser() userId: number | null,
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<OutputCommentType> {
    const comment = await this.commentQueryRepository.findById(commentId, userId);
    if (!comment) throw new NotFoundException(`Comment with id: ${commentId} not found`);
    return comment;
  }

  @Put(':commentId')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, CommentOwnerGuard)
  async updateComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() { content }: CommentUpdateModel,
  ): Promise<void> {
    const result = await this.commandBus.execute(new UpdateCommentCommand(commentId, content));
    if (result.isFailure()) ErrorResulter.proccesError(result);
  }

  @Put('/:commentId/like-status')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async addLike(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() { likeStatus }: LikeCreateModel,
    @CurrentUser() userId: number | null,
  ): Promise<void> {
    if (!userId) throw new HttpException('jwt valid, but user not found', 404);
    const result = await this.commandBus.execute(new AddLikeToCommentCommand(commentId, userId, likeStatus));
    if (result.isFailure()) ErrorResulter.proccesError(result);
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard, CommentOwnerGuard)
  @HttpCode(204)
  async deleteComment(@Param('commentId', ParseIntPipe) commentId: number): Promise<void> {
    const result = await this.commandBus.execute(new DeleteCommentByIdCommand(commentId));
    if (result.isFailure()) ErrorResulter.proccesError(result);
  }
}
