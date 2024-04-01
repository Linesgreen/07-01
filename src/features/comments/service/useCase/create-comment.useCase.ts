import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { PostOrmRepository } from '../../../posts/repositories/post/postgres.post.repository';
import { Comment_Orm } from '../../entites/orm_comment';
import { CommentOrmRepository } from '../../repositories/comments/postgres.comments.repository';

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
    protected commentRepository: CommentOrmRepository,
    protected postRepository: PostOrmRepository,
  ) {}
  async execute({ userId, postId, content }: CreateCommentCommand): Promise<Result<string | { id: number }>> {
    const newCommentToDB = Comment_Orm.createCommentModel({ userId, postId, content });

    const targetPost = await this.postRepository.getPostById(postId);
    if (!targetPost) return Result.Err(ErrorStatus.NOT_FOUND, `Post with id ${postId} not found`);

    const commentId = await this.commentRepository.addComment(newCommentToDB);
    return Result.Ok(commentId);
  }
}
