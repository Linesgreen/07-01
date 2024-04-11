import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { CommentRepository } from '../../repositories/comments/comment.repository';

export class DeleteCommentByIdCommand {
  constructor(public commentId: number) {}
}

@CommandHandler(DeleteCommentByIdCommand)
export class DeleteCommentByIdUseCase implements ICommandHandler<DeleteCommentByIdCommand> {
  constructor(protected commentsRepository: CommentRepository) {}

  async execute({ commentId }: DeleteCommentByIdCommand): Promise<Result<string>> {
    const result = await this.commentsRepository.deleteById(commentId);
    if (!result) return Result.Err(ErrorStatus.NOT_FOUND, `Comment with id ${commentId} not found`);
    return Result.Ok(`Comment with id ${commentId} deleted`);
  }
}
