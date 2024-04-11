/* eslint-disable no-underscore-dangle */
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { Comment_like_Orm } from '../../entites/comment-like.entities';
import { CommentRepository } from '../../repositories/comments/comment.repository';
import { CommentLikeRepository } from '../../repositories/likes/comment-like.query.repository';
import { LikeStatus } from '../../types/comments/input';

export class AddLikeToCommentCommand {
  constructor(
    public commentId: number,
    public userId: number,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(AddLikeToCommentCommand)
export class AddLikeToCommentUseCase implements ICommandHandler<AddLikeToCommentCommand> {
  constructor(
    protected commentRepository: CommentRepository,
    protected commentLikeRepository: CommentLikeRepository,
  ) {}

  async execute({ commentId, userId, likeStatus }: AddLikeToCommentCommand): Promise<Result<string>> {
    const comment = await this.commentRepository.getById(commentId);
    if (!comment) return Result.Err(ErrorStatus.NOT_FOUND, `comment ${commentId} not found`);

    const userLike: Comment_like_Orm | null = await this.commentLikeRepository.findLikeByUserId(commentId, userId);

    if (!userLike) {
      const newLike = Comment_like_Orm.createCommentLikeModel({
        commentId,
        userId,
        likeStatus,
      });
      await this._saveLike(newLike);
      return Result.Ok('Like created');
    }

    // If user's like status is already as expected, no further action needed
    if (likeStatus === userLike.likeStatus) return Result.Ok('Like status is do not changed');
    await this._updateLike(userLike, likeStatus);
    return Result.Ok('Like updated');
  }

  private async _saveLike(newLike: Comment_like_Orm): Promise<void> {
    await this.commentLikeRepository.save(newLike);
  }

  private async _updateLike(like: Comment_like_Orm, likeStatus: LikeStatus): Promise<void> {
    like.updateLikeStatus(likeStatus);
    await this.commentLikeRepository.save(like);
  }
}
