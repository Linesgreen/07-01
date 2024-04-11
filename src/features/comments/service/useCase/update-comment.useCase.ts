import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { CommentOrmRepository } from '../../repositories/comments/comment.repository';

export class UpdateCommentCommand {
  constructor(
    public commentId: number,
    public content: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(protected commentsRepository: CommentOrmRepository) {}

  async execute({ commentId, content }: UpdateCommentCommand): Promise<Result<string>> {
    const comment = await this.commentsRepository.getById(commentId);
    if (!comment) return Result.Err(ErrorStatus.NOT_FOUND, `Comment with id ${commentId} not found`);

    comment.update({ content });
    await this.commentsRepository.update(comment);
    return Result.Ok('Comment updated');
  }
}
