/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';

import { TransactionHelper } from '../../../../infrastructure/TransactionHelper/transaction-helper';
import { Comment_Orm } from '../../entites/comment.orm.entities';

@Injectable()
export class CommentRepository {
  constructor(private readonly transactionHelper: TransactionHelper) {}

  async getById(id: number): Promise<Comment_Orm | null> {
    const commentRepository = this.transactionHelper.getManager().getRepository(Comment_Orm);
    return commentRepository.findOneBy({ id: id });
  }

  async save(comment: Comment_Orm): Promise<{ id: number }> {
    const commentRepository = this.transactionHelper.getManager().getRepository(Comment_Orm);
    await commentRepository.save(comment);
    return { id: comment.id };
  }

  async deleteById(id: number): Promise<boolean> {
    const commentRepository = this.transactionHelper.getManager().getRepository(Comment_Orm);
    const result = await commentRepository.delete({ id: id });
    return !!result.affected;
  }
}
