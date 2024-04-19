/* eslint-disable no-underscore-dangle,@typescript-eslint/no-explicit-any */
// noinspection ES6ShorthandObjectProperty,JSUnresolvedReference,DuplicatedCode

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QueryPaginationResult } from '../../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../../../infrastructure/utils/createPagination';
import { Comment_Orm } from '../../entites/comment.orm.entities';
import { Comment_like_Orm } from '../../entites/comment-like.entities';
import { LikeStatus } from '../../types/comments/input';
import { OutputCommentType } from '../../types/comments/output';
import { RawCommentType } from '../../types/comments/repo.types';

@Injectable()
export class CommentQueryRepository {
  constructor(
    @InjectRepository(Comment_Orm) protected commentRepository: Repository<Comment_Orm>,
    @InjectRepository(Comment_like_Orm) protected commentLikeRepository: Repository<Comment_like_Orm>,
  ) {}

  async findById(id: number, userId: number | null): Promise<OutputCommentType | null> {
    const comment: RawCommentType | undefined = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .leftJoin('comment.likes', 'likes', 'likes.userId = :userId', { userId: userId })
      .select('likes.likeStatus')
      .addSelect((qb) => {
        return qb
          .select('COUNT(comment_like.id)')
          .from(Comment_like_Orm, 'comment_like')
          .where('comment_like.commentId = comment.id')
          .andWhere('comment_like.likeStatus = :likeStatus', { likeStatus: LikeStatus.Like })
          .groupBy('comment_like.commentId');
      }, 'likes_likeCount')
      .addSelect((qb1) => {
        return qb1
          .select('COUNT(id)')
          .from(Comment_like_Orm, 'comment_like')
          .where('comment_like.commentId = comment.id')
          .andWhere('comment_like.likeStatus = :dislikeStatus', { dislikeStatus: LikeStatus.Dislike })
          .groupBy('comment_like.commentId');
      }, 'likes_dislikeCount')
      .addSelect(['comment.id', 'comment.content', 'comment.createdAt', 'comment.userId', 'user.login'])
      .where('comment.id = :id', { id: id })
      .andWhere('comment.isActive = true')
      .getRawOne();

    if (!comment) return null;
    return this._mapToOutputCommentType(comment);
  }

  async getCommentsToPosts(
    sortData: QueryPaginationResult,
    postId: number,
    userId: number | null,
  ): Promise<PaginationWithItems<OutputCommentType> | null> {
    const skip = (sortData.pageNumber - 1) * sortData.pageSize;
    console.log(sortData.pageSize);
    const comments: RawCommentType[] = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .leftJoin('comment.likes', 'likes', 'likes.userId = :userId', { userId: userId })
      .select('likes.likeStatus')
      .addSelect((qb) => {
        return qb
          .select('COUNT(comment_like.id)')
          .from(Comment_like_Orm, 'comment_like')
          .where('comment_like.commentId = comment.id')
          .andWhere('comment_like.likeStatus = :likeStatus', { likeStatus: LikeStatus.Like })
          .groupBy('comment_like.commentId');
      }, 'likes_likeCount')
      .addSelect((qb1) => {
        return qb1
          .select('COUNT(id)')
          .from(Comment_like_Orm, 'comment_like')
          .where('comment_like.commentId = comment.id')
          .andWhere('comment_like.likeStatus = :dislikeStatus', { dislikeStatus: LikeStatus.Dislike })
          .groupBy('comment_like.commentId');
      }, 'likes_dislikeCount')
      .addSelect(['comment.id', 'comment.content', 'comment.createdAt', 'comment.userId', 'user.login'])
      .where('comment.isActive = true')
      .andWhere('comment.postId = :postId', { postId: postId })
      .orderBy({ [`comment.${sortData.sortBy}`]: sortData.sortDirection })
      .limit(sortData.pageSize)
      .offset(skip)
      .getRawMany();
    console.log(comments);
    if (!comments.length) return null;
    const totalCount = await this.commentRepository.createQueryBuilder().where({ isActive: true, postId }).getCount();

    const commentsDto = comments.map((c) => this._mapToOutputCommentType(c));
    return new PaginationWithItems(sortData.pageNumber, sortData.pageSize, totalCount, commentsDto);
  }

  private _mapToOutputCommentType(raw_comment: RawCommentType): OutputCommentType {
    return {
      id: raw_comment.comment_id.toString(),
      content: raw_comment.comment_content,
      createdAt: raw_comment.comment_createdAt.toISOString(),
      commentatorInfo: {
        userId: raw_comment.comment_userId.toString(),
        userLogin: raw_comment.user_login,
      },
      likesInfo: {
        likesCount: raw_comment?.likes_likeCount ? Number(raw_comment.likes_likeCount) : 0,
        dislikesCount: raw_comment?.likes_dislikeCount ? Number(raw_comment.likes_dislikeCount) : 0,
        myStatus: raw_comment.likes_likeStatus ?? LikeStatus.None,
      },
    };
  }
}
