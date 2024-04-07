import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { Comment_like_Orm } from '../../entites/orm_comment_like';
import { CommentOrmRepository } from '../../repositories/comments/postgres.comments.repository';
import { CommentOrmLikeRepository } from '../../repositories/likes/comments-likes-query.repository';
import { LikeStatusE } from '../../types/comments/input';

export class AddLikeToCommentCommand {
  constructor(
    public commentId: number,
    public userId: number,
    public likeStatus: LikeStatusE,
  ) {}
}

@CommandHandler(AddLikeToCommentCommand)
export class AddLikeToCommentUseCase implements ICommandHandler<AddLikeToCommentCommand> {
  constructor(
    protected commentRepository: CommentOrmRepository,
    protected commentLikeRepository: CommentOrmLikeRepository,
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
      await this.createLike(newLike);
      return Result.Ok('Like created');
    }

    // If user's like status is already as expected, no further action needed
    if (likeStatus === userLike.likeStatus) return Result.Ok('Like status is do not changed');
    await this.updateLike(userLike, likeStatus);
    return Result.Ok('Like updated');
  }

  private async createLike(newLike: Comment_like_Orm): Promise<void> {
    await this.commentLikeRepository.save(newLike);
  }

  private async updateLike(like: Comment_like_Orm, likeStatus: LikeStatusE): Promise<void> {
    like.updateLikeStatus(likeStatus);
    await this.commentLikeRepository.save(like);
  }
}
