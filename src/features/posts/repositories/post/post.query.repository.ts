/* eslint-disable no-underscore-dangle,@typescript-eslint/no-explicit-any,@typescript-eslint/explicit-function-return-type,@typescript-eslint/ban-ts-comment */
// noinspection ES6ShorthandObjectProperty,JSUnusedLocalSymbols,JSUnresolvedReference,UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { QueryPaginationResult } from '../../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../../../infrastructure/utils/createPagination';
import { LikeStatus } from '../../../comments/types/comments/input';
import { Post_Orm } from '../../entites/post.orm.entities';
import { Post_like_Orm } from '../../entites/post-like.orm.entities';
import { LastLike, LastLikeFromDB, LikeCount } from '../../types/likes/commont.types';
import { NewestLikeType } from '../../types/likes/output';
import { OutputPostType } from '../../types/output';

@Injectable()
export class PostQueryRepository {
  constructor(
    @InjectRepository(Post_Orm) protected postRepository: Repository<Post_Orm>,
    @InjectRepository(Post_like_Orm) protected postLikeRepository: Repository<Post_like_Orm>,
  ) {}

  async findById(id: number, userId: number | null): Promise<OutputPostType | null> {
    const postWithBlogName = await this.postRepository
      .createQueryBuilder('post')
      // Используем leftJoin для присоединения таблицы блогов без автоматического выбора
      .leftJoin('post.blog', 'blog')
      .select([
        'post.id',
        'post.title',
        'post.shortDescription',
        'post.content',
        'post.createdAt',
        'post.isActive',
        'post.blogId',
        'blog.name', // Явно указываем, что нам нужно только имя блога
      ])
      .addSelect('blog.name', 'blogName')
      .where('post.isActive = true') // Убедимся, что пост активен
      .andWhere('post.id = :id', { id })
      .getMany();
    if (!postWithBlogName[0]) {
      return null;
    }
    const postIds = postWithBlogName.map((p) => p.id);
    const lastThreeLikes = await this._getLastThreeLikes(postIds);
    const likesStatuses = await this.postLikeRepository.findBy({ postId: In(postIds), userId: userId ?? 0 });
    const likesCount = await this._getLikeCount(postIds);
    const postDto = this._mapToOutput(postWithBlogName, lastThreeLikes, likesStatuses, likesCount);
    return postDto[0];
  }

  async getPostsForBlog(
    sortData: QueryPaginationResult,
    userId: number | null,
    blogId: number,
  ): Promise<PaginationWithItems<OutputPostType> | null> {
    const skip = (sortData.pageNumber - 1) * sortData.pageSize;

    const postsWithBlogName = await this.postRepository
      .createQueryBuilder('post')
      // Используем leftJoin для присоединения таблицы блогов без автоматического выбора
      .leftJoin('post.blog', 'blog')
      .select([
        'post.id',
        'post.title',
        'post.shortDescription',
        'post.content',
        'post.createdAt',
        'post.isActive',
        'post.blogId',
        'blog.name', // Явно указываем, что нам нужно только имя блога
      ])
      .where('blog.id = :id', { id: blogId })
      .andWhere('post.isActive = true') // Убедимся, что пост активен
      .orderBy({ [`post.${sortData.sortBy}`]: sortData.sortDirection })
      .take(sortData.pageSize)
      .skip(skip)
      .getMany();
    if (!postsWithBlogName.length) return null;
    const postIds = postsWithBlogName.map((p) => p.id);
    const lastThreeLikes = await this._getLastThreeLikes(postIds);
    const likeStatuses = await this.postLikeRepository.findBy({ postId: In(postIds), userId: userId ?? 0 });
    const likesCount = await this._getLikeCount(postIds);

    const totalCount = await this.postRepository.createQueryBuilder().where({ isActive: true, blogId }).getCount();
    const postDto = this._mapToOutput(postsWithBlogName, lastThreeLikes, likeStatuses, likesCount);

    return new PaginationWithItems(sortData.pageNumber, sortData.pageSize, totalCount, postDto);
  }

  async getPosts(
    sortData: QueryPaginationResult,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userId: number | null,
  ): Promise<PaginationWithItems<OutputPostType> | null> {
    const orderField = sortData.sortBy === 'blogName' ? 'blog.name' : `post.${sortData.sortBy}`;
    const orderCriteria = { [orderField]: sortData.sortDirection };
    const skip = (sortData.pageNumber - 1) * sortData.pageSize;

    const postsWithBlogName = await this.postRepository
      .createQueryBuilder('post')
      // Используем leftJoin для присоединения таблицы блогов без автоматического выбора
      .leftJoin('post.blog', 'blog')
      .select([
        'post.id',
        'post.title',
        'post.shortDescription',
        'post.content',
        'post.createdAt',
        'post.isActive',
        'post.blogId',
        'blog.name', // Явно указываем, что нам нужно только имя блога
      ])
      .addSelect('blog.name', 'blogName')
      .where('post.isActive = true') // Убедимся, что пост активен
      .orderBy(orderCriteria)
      .take(sortData.pageSize)
      .skip(skip)
      .getMany();
    if (!postsWithBlogName.length) return null;

    const postIds = postsWithBlogName.map((p) => p.id);

    const lastThreeLikes = await this._getLastThreeLikes(postIds);
    const likeStatuses = await this.postLikeRepository.findBy({ postId: In(postIds), userId: userId ?? 0 });
    const likesCount = await this._getLikeCount(postIds);

    const totalCount = await this.postRepository.createQueryBuilder().where({ isActive: true }).getCount();
    const postDto = this._mapToOutput(postsWithBlogName, lastThreeLikes, likeStatuses, likesCount);
    return new PaginationWithItems(sortData.pageNumber, sortData.pageSize, totalCount, postDto);
  }

  private _mapToOutput(
    posts: Post_Orm[],
    lastThreeLikes: LastLike[],
    likeStatus: Post_like_Orm[],
    likesCount: LikeCount[],
  ): OutputPostType[] {
    const likeCollection = lastThreeLikes.reduce((acc, l) => {
      const newLike = {
        addedAt: l.addedAt,
        userId: l.userId,
        login: l.login,
      };
      acc.has(l.postId) ? acc.get(l.postId)?.unshift(newLike) : acc.set(l.postId, [newLike]);
      return acc;
    }, new Map<number, NewestLikeType[]>());

    const likesCountMap = new Map(likesCount.map((lc) => [lc.postId, lc]));

    const userStatusMap = new Map(likeStatus.map((lc) => [lc.postId, lc.likeStatus]));

    const postsDto = posts.map((post) => {
      const postId = post.id;
      const newestLikes = likeCollection.get(postId) ?? [];
      const count = likesCountMap.get(postId);
      const userLikeStatus = userStatusMap.get(postId) ?? LikeStatus.None;

      return {
        id: post.id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId.toString(),
        blogName: post.blog.name,
        createdAt: post.createdAt.toISOString(),
        extendedLikesInfo: {
          likesCount: count?.likesCount ?? 0,
          dislikesCount: count?.dislikesCount ?? 0,
          myStatus: userLikeStatus,
          newestLikes: newestLikes,
        },
      };
    });

    return postsDto;
  }

  private async _getLastThreeLikes(postIds: number[]): Promise<LastLike[]> {
    const lastThreeLikes: LastLikeFromDB[] = await this.postLikeRepository
      .createQueryBuilder('likes')
      .select('likes.*')
      .addSelect('likes_with_rn.rn')
      .addSelect('user.login', 'login')
      .leftJoin(
        (subQuery) => {
          return subQuery
            .from('post_like_orm', 'likes')
            .select('likes.id', 'likeId') // Указываем идентификатор явно
            .addSelect('ROW_NUMBER() OVER(PARTITION BY likes."postId" ORDER BY likes."createdAt" DESC)', 'rn')
            .where('likes."postId" IN (:...postIds)', { postIds })
            .andWhere('likes."likeStatus" = :likeStatus', { likeStatus: LikeStatus.Like });
        },
        'likes_with_rn',
        '"likes"."id" = likes_with_rn."likeId"',
      )
      .leftJoin('user_orm', 'user', 'user.id = likes."userId"')
      .where('likes_with_rn.rn <= 3')
      .getRawMany();

    return lastThreeLikes.map((l) => {
      return {
        postId: l.postId,
        addedAt: l.createdAt.toISOString(),
        userId: l.userId.toString(),
        login: l.login.toString(),
      };
    });
  }

  private async _getLikeCount(postIds: number[]) {
    const likes = await this.postLikeRepository
      .createQueryBuilder('likes')
      .select('likes.postId', 'postId')
      .addSelect("COALESCE(SUM(CASE WHEN likes.likeStatus = 'Like' THEN 1 ELSE 0 END), 0)::int", 'likesCount')
      .addSelect("COALESCE(SUM(CASE WHEN likes.likeStatus = 'Dislike' THEN 1 ELSE 0 END), 0)::int", 'dislikesCount')
      .where('likes.postId IN (:...postIds)', { postIds })
      .groupBy('likes.postId')
      .getRawMany();

    return likes;
  }
}
