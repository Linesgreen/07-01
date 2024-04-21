import { Injectable } from '@nestjs/common';

import { TransactionHelper } from '../../../../infrastructure/TransactionHelper/transaction-helper';
import { Comment_like_Orm } from '../../entites/comment-like.entities';

@Injectable()
export class CommentLikeRepository {
  constructor(private readonly transactionHelper: TransactionHelper) {}
  async findLikeByUserId(commentId: number, userId: number): Promise<Comment_like_Orm | null> {
    const commentLikeRepository = this.transactionHelper.getManager().getRepository(Comment_like_Orm);
    return commentLikeRepository.findOneBy({ commentId, userId });
  }

  async save(like: Comment_like_Orm): Promise<void> {
    const commentLikeRepository = this.transactionHelper.getManager().getRepository(Comment_like_Orm);
    await commentLikeRepository.save(like);
  }
}
