import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AbstractRepository } from '../../../../infrastructure/repositories/abstract.repository';
import { PostLikeWithLoginFromDb } from '../../../posts/entites/like';
import { CommentLike } from '../../entites/comment-like';
import { Comment_like_Orm } from '../../entites/orm_comment_like';

@Injectable()
export class CommentOrmLikeRepository {
  constructor(@InjectRepository(Comment_like_Orm) protected commentLikeRepository: Repository<Comment_like_Orm>) {}
  async findLikeByUserId(commentId: number, userId: number): Promise<Comment_like_Orm | null> {
    return this.commentLikeRepository.findOneBy({ commentId, userId });
  }

  async save(like: Comment_like_Orm): Promise<void> {
    await this.commentLikeRepository.save(like);
  }
}

@Injectable()
export class CommentsLikesQueryRepository extends AbstractRepository<PostLikeWithLoginFromDb> {
  constructor(@InjectDataSource() protected dataSource: DataSource) {
    super(dataSource);
  }

  async getLikeByUserId(commentId: number, userId: number): Promise<CommentLike | null> {
    const tableName = 'comments_likes';
    const fieldsToSelect = ['likeStatus', 'createdAt', 'commentId', 'postId', 'userId', 'id'];
    const like = await this.getByFields(tableName, fieldsToSelect, { commentId, userId });
    return like ? like[0] : null;
  }
}
