/* eslint-disable no-underscore-dangle */
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { LikeStatusE } from '../../../comments/types/comments/input';
import { Post_like_Orm } from '../../entites/orm_post.likes';
import { PostLikeRepository } from '../../repositories/likes/post-likes.query.repository';
import { PostRepository } from '../../repositories/post/post.repository';

export class AddLikeToPostCommand {
  constructor(
    public postId: number,
    public userId: number,
    public likeStatus: LikeStatusE,
  ) {}
}

@CommandHandler(AddLikeToPostCommand)
export class AddLikeToPostUseCase implements ICommandHandler<AddLikeToPostCommand> {
  constructor(
    protected postLikeRepository: PostLikeRepository,
    protected postRepository: PostRepository,
  ) {}

  async execute({ postId, userId, likeStatus }: AddLikeToPostCommand): Promise<Result<string>> {
    const targetPost = await this.postRepository.findById(postId);
    if (!targetPost) return Result.Err(ErrorStatus.NOT_FOUND, `Post with id ${postId} not found`);

    const userLike = await this.postLikeRepository.findByUserIdAndPostId(userId, postId);

    if (!userLike) {
      const newLike = Post_like_Orm.createPostLikeModel({ postId, userId, likeStatus });
      await this.createLike(newLike);
      return Result.Ok('Like created');
    }

    // If user's like status is already as expected, no further action needed
    if (likeStatus === userLike.likeStatus) return Result.Ok('Like status is do not changed');
    await this.updateLike(userLike, likeStatus);
    return Result.Ok('Like updated');
  }

  private async createLike(newLike: Post_like_Orm): Promise<void> {
    await this.postLikeRepository.save(newLike);
  }

  private async updateLike(like: Post_like_Orm, likeStatus: LikeStatusE): Promise<void> {
    like.updateLikeStatus(likeStatus);
    await this.postLikeRepository.save(like);
  }
}
