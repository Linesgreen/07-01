/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';

import { TransactionHelper } from '../../../../infrastructure/TransactionHelper/transaction-helper';
import { Post_Orm } from '../../entites/post.orm.entities';

@Injectable()
export class PostRepository {
  constructor(private readonly transactionHelper: TransactionHelper) {}

  async findById(id: number): Promise<Post_Orm | null> {
    const postRepository = this.transactionHelper.getManager().getRepository(Post_Orm);
    const post = await postRepository.findOneBy({ id, isActive: true });
    return post;
  }

  async deleteById(id: number): Promise<void> {
    const postRepository = this.transactionHelper.getManager().getRepository(Post_Orm);
    await postRepository.update({ id }, { isActive: false });
  }

  async save(post: Post_Orm): Promise<{ id: number }> {
    const postRepository = this.transactionHelper.getManager().getRepository(Post_Orm);
    await postRepository.save(post);
    return { id: post.id };
  }
}
