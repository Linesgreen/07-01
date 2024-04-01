/* eslint-disable no-underscore-dangle */
// noinspection ES6ShorthandObjectProperty

import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AbstractRepository } from '../../../../infrastructure/repositories/abstract.repository';
import { QueryPaginationResult } from '../../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../../common/types/output';
import { PostPgWithBlogDataDb } from '../../../posts/types/output';
import { Comment_Orm } from '../../entites/orm_comment';
import { OutputCommentType } from '../../types/comments/output';

@Injectable()
export class CommentOrmQueryRepository {
  constructor(@InjectRepository(Comment_Orm) protected commentRepository: Repository<Comment_Orm>) {}

  async findById(id: number, userId: number | null): Promise<OutputCommentType | null> {
    const comment = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .select(['comment.id', 'comment.content', 'comment.createdAt', 'comment.userId', 'user.login'])
      .where('comment.id = :id', { id })
      .andWhere('comment.isActive = true')
      .getOne();

    console.log(comment);
    if (!comment) return null;
    return this._mapToOutputCommentType(comment);
  }

  async getCommentsToPosts(sortData: QueryPaginationResult, postId: number, userId: number | null) {
    const skip = (sortData.pageNumber - 1) * sortData.pageSize;

    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.user', 'user')
      .select(['comment.id', 'comment.content', 'comment.createdAt', 'comment.userId', 'user.login'])
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.isActive = true')
      .orderBy({ [`comment.${sortData.sortBy}`]: sortData.sortDirection })
      .take(sortData.pageSize)
      .skip(skip)
      .getMany();
    if (!comments.length) return null;
    const totalCount = await this.commentRepository.createQueryBuilder().where({ isActive: true, postId }).getCount();
    const commentsDto = comments.map((c) => this._mapToOutputCommentType(c));
    return new PaginationWithItems(sortData.pageNumber, sortData.pageSize, totalCount, commentsDto);
  }

  private _mapToOutputCommentType(comment: Comment_Orm): OutputCommentType {
    return {
      id: comment.id.toString(),
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      commentatorInfo: {
        userId: comment.userId.toString(),
        userLogin: comment.user.login,
      },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    };
  }
}

@Injectable()
export class PostgresCommentsQueryRepository extends AbstractRepository<PostPgWithBlogDataDb> {
  constructor(@InjectDataSource() protected dataSource: DataSource) {
    super(dataSource);
  }

  async getCommentById(commentId: number, userId?: number | null): Promise<OutputCommentType | null> {
    const comment: OutputCommentType[] = await this.dataSource.query(
      `
          SELECT
              CAST( c."id" AS VARCHAR) AS "id",
              c."content",
              c."createdAt",
              row_to_json((
                  SELECT d FROM (
                                    SELECT
                                        CAST( u."id" AS VARCHAR) AS "userId",
                                        u.login AS "userLogin"
                                ) d
              )) AS "commentatorInfo",
              json_build_object(
                      'likesCount', li.likesCount,
                      'dislikesCount', li.dislikesCount,
                      'myStatus', COALESCE(ul."likeStatus", 'None')
              ) AS "likesInfo"
          FROM
              public.comments c
                  JOIN public.users u ON c."userId" = u.id,
              LATERAL (
                  SELECT
                      COUNT(*) FILTER (WHERE "likeStatus" = 'Like') AS likesCount,
                      COUNT(*) FILTER (WHERE "likeStatus" = 'Dislike') AS dislikesCount
                  FROM public.comments_likes
                  WHERE "commentId" = c.id
                  ) li
                  LEFT JOIN LATERAL (
                  SELECT "likeStatus"
                  FROM public.comments_likes
                  WHERE "commentId" = c.id AND "userId" = COALESCE($2, 0)
                  LIMIT 1 -- Добавляем LIMIT, чтобы гарантировать только один результат или NULL
                  ) ul ON true
          WHERE
              c.id = $1 AND
              c."active" = true
        `,
      [commentId, userId],
    );

    if (!comment[0]) return null;

    return comment[0];
  }

  async getPostIdByCommentId(commentId: number): Promise<number | null> {
    const postId: { postId: number }[] = await this.dataSource.query(
      `
          SELECT "postId"
          FROM public.comments
          WHERE id = $1
        `,
      [commentId],
    );
    if (!postId[0]) return null;
    return postId[0].postId;
  }

  async getCommentsToPosts(
    sortData: QueryPaginationResult,
    postId: number,
    userId: number | null,
  ): Promise<PaginationWithItems<OutputCommentType>> {
    const comment: OutputCommentType[] = await this.dataSource.query(
      `
          WITH filtered_comments AS (
              SELECT
                  comments.id,"content",comments."createdAt", "userId", u.login
              FROM comments
              JOIN public.users u on u.id = comments."userId"
              WHERE comments.active = true AND comments."postId" = $1
              ORDER BY comments."${sortData.sortBy}" ${sortData.sortDirection}
              LIMIT $3 OFFSET $3 * ($4 - 1)
          ), likes_counts AS (
            SELECT comments_likes."commentId",
                   COUNT(*) FILTER (WHERE comments_likes."likeStatus" = 'Like') AS likesCount,
                   COUNT(*) FILTER (WHERE comments_likes."likeStatus" = 'Dislike') AS dislikesCount
            FROM comments_likes
            WHERE "commentId" IN (SELECT id as "commentId" FROM filtered_comments)
            GROUP BY comments_likes."commentId"
          ), user_reaction AS (
              SELECT 
                  comments_likes."commentId",
                  comments_likes."likeStatus"
              FROM 
                  comments_likes
              WHERE 
                  comments_likes."userId" = $2 AND comments_likes."commentId" IN (SELECT id as "commentId" FROM filtered_comments)
          )
          SELECT
              CAST("id" AS VARCHAR) AS "id",
                 "content",
              json_build_object(
                      'userId',CAST(filtered_comments."userId" AS VARCHAR),
                      'userLogin',filtered_comments.login
              ) as "commentatorInfo", 
              "createdAt",
              json_build_object(
                   'likesCount', COALESCE(likes_counts.likesCount, 0),
                    'dislikesCount', COALESCE(likes_counts.dislikesCount, 0),
                    'myStatus', COALESCE(user_reaction."likeStatus", 'None')
                                ) as "likesInfo"
          FROM filtered_comments
          LEFT JOIN likes_counts ON filtered_comments.id = likes_counts."commentId"
          LEFT JOIN user_reaction ON filtered_comments.id = user_reaction."commentId"
          ORDER BY filtered_comments."${sortData.sortBy}" ${sortData.sortDirection}
          
      `,
      [postId, userId, sortData.pageSize, sortData.pageNumber],
    );
    const dtoComments: OutputCommentType[] = comment;

    const totalCount = await this.dataSource.query(
      `
        SELECT COUNT(с.id)
        FROM public.comments с
        WHERE   с."active" = true AND "postId" = $1
    `,
      [postId],
    );
    return new PaginationWithItems(+sortData.pageNumber, +sortData.pageSize, Number(totalCount[0].count), dtoComments);
  }
}
