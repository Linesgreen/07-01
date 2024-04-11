/* eslint-disable no-underscore-dangle,@typescript-eslint/no-explicit-any,@typescript-eslint/explicit-function-return-type,@typescript-eslint/ban-ts-comment */
// noinspection ES6ShorthandObjectProperty,JSUnusedLocalSymbols,JSUnresolvedReference

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { QueryPaginationResult } from '../../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../../../infrastructure/utils/createPagination';
import { LikeStatus } from '../../../comments/types/comments/input';
import { Post_Orm } from '../../entites/post.orm.entities';
import { Post_like_Orm } from '../../entites/post-like.orm.entities';
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
    const postDto = this._mapToOutput1(postWithBlogName, lastThreeLikes, likesStatuses, likesCount);
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
    const postDto = this._mapToOutput1(postsWithBlogName, lastThreeLikes, likeStatuses, likesCount);

    return new PaginationWithItems(sortData.pageNumber, sortData.pageSize, totalCount, postDto);
  }

  async getPosts(
    sortData: QueryPaginationResult,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userId: number | null,
  ): Promise<PaginationWithItems<OutputPostType> | null> {
    //TODO через менеджер сделать нада

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

    const likesStatuses = await this.postLikeRepository.findBy({ postId: In(postIds), userId: userId ?? 0 });
    const likesCount = await this._getLikeCount(postIds);

    const totalCount = await this.postRepository.createQueryBuilder().where({ isActive: true }).getCount();
    const postDto = this._mapToOutput1(postsWithBlogName, lastThreeLikes, likesStatuses, likesCount);
    return new PaginationWithItems(sortData.pageNumber, sortData.pageSize, totalCount, postDto);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //TODO добавить типы
  private _mapToOutput1(
    posts: Post_Orm[],
    lastThreeLikes: any[],
    likeStatuse: Post_like_Orm[],
    likesCount: any[],
  ): any {
    //Подготавливаем лайки
    const likes_collection = new Map();
    //TODO reduce
    lastThreeLikes.forEach((l) => {
      if (likes_collection.has(l.postId)) {
        const like = likes_collection.get(l.postId);
        like.unshift(l);
        likes_collection.set(l.postId, like);
        return;
      }
      likes_collection.set(l.postId, [l]);
    });
    //Подготавливаем подсчет лайков
    const likes_count = new Map();
    likesCount.forEach((lc) => {
      likes_count.set(lc.postId, lc);
    });

    //Подготавлиаем статс лайка для конкретного пользователя
    const user_statuse = new Map();
    likeStatuse.forEach((lc) => {
      user_statuse.set(lc.postId, lc.likeStatus);
    });

    const postsDto = posts.map((post) => {
      let newestLikes = [];
      //TODO переделать ( сделать мапинг внутри запроса сразу)
      if (likes_collection.has(post.id)) {
        newestLikes = likes_collection.get(post.id).map((l) => {
          return {
            addedAt: l.createdAt.toISOString(),
            userId: l.userId.toString(),
            login: l.login,
          };
        });
      }
      return {
        id: post.id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId.toString(),
        blogName: post.blog.name,
        createdAt: post.createdAt.toISOString(),
        extendedLikesInfo: {
          likesCount: likes_count.get(post.id)?.likesCount ?? 0,
          dislikesCount: likes_count.get(post.id)?.dislikesCount ?? 0,
          myStatus: user_statuse.get(post.id) ?? LikeStatus.None,
          newestLikes: newestLikes,
        },
      };
    });
    return postsDto;
  }

  private async _getLastThreeLikes(postIds: number[]) {
    return this.postLikeRepository
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
    console.log(likes);
    return likes;
  }
}
