import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comment_like_Orm } from '../../entites/orm_comment_like';

@Injectable()
export class CommentLikeRepository {
  constructor(@InjectRepository(Comment_like_Orm) protected commentLikeRepository: Repository<Comment_like_Orm>) {}
  async findLikeByUserId(commentId: number, userId: number): Promise<Comment_like_Orm | null> {
    return this.commentLikeRepository.findOneBy({ commentId, userId });
  }

  async save(like: Comment_like_Orm): Promise<void> {
    await this.commentLikeRepository.save(like);
  }
}
