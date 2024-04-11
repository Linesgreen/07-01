import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { PostRepository } from '../../../posts/repositories/post/post.repository';
import { Comment_Orm } from '../../entites/comment.orm.entities';
import { CommentRepository } from '../../repositories/comments/comment.repository';

export class CreateCommentCommand {
  constructor(
    public userId: number,
    public postId: number,
    public content: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    protected commentRepository: CommentRepository,
    protected postRepository: PostRepository,
  ) {}
  async execute({ userId, postId, content }: CreateCommentCommand): Promise<Result<string | { id: number }>> {
    const newCommentToDB = Comment_Orm.createCommentModel({ userId, postId, content });

    const targetPost = await this.postRepository.findById(postId);
    if (!targetPost) return Result.Err(ErrorStatus.NOT_FOUND, `Post with id ${postId} not found`);

    const commentId = await this.commentRepository.save(newCommentToDB);
    return Result.Ok(commentId);
  }
}
