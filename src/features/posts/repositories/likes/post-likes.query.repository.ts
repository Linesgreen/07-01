import { Injectable } from '@nestjs/common';

import { TransactionHelper } from '../../../../infrastructure/TransactionHelper/transaction-helper';
import { Post_like_Orm } from '../../entites/post-like.orm.entities';

@Injectable()
export class PostLikeRepository {
  constructor(private readonly transactionHelper: TransactionHelper) {}
  async findByUserIdAndPostId(userId: number, postId: number): Promise<Post_like_Orm | null> {
    const postLikeRepository = this.transactionHelper.getManager().getRepository(Post_like_Orm);
    const like = await postLikeRepository.findOneBy({ userId, postId });
    return like;
  }

  async save(like: Post_like_Orm): Promise<void> {
    const postLikeRepository = this.transactionHelper.getManager().getRepository(Post_like_Orm);
    await postLikeRepository.save(like);
  }
}
