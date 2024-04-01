import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { CommentOrmQueryRepository } from '../../features/comments/repositories/comments/postgres.comments.query.repository';
// Custom guard
// https://docs.nestjs.com/guards
@Injectable()
export class CommentOwnerGuard implements CanActivate {
  constructor(private commentQueryRepository: CommentOrmQueryRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const commentId = request.params.commentId;
    const userId = request.user.id;
    const targetComment = await this.commentQueryRepository.findById(commentId, null);
    if (!targetComment) throw new NotFoundException();
    if (targetComment.commentatorInfo.userId != userId) throw new ForbiddenException();
    return true;
  }
}
