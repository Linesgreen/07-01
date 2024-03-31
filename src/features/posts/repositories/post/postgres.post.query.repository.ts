/* eslint-disable no-underscore-dangle */
// noinspection ES6ShorthandObjectProperty,JSUnusedLocalSymbols

import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AbstractRepository } from '../../../../infrastructure/repositories/abstract.repository';
import { QueryPaginationResult } from '../../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../../common/types/output';
import { Post_Orm } from '../../entites/orm_post';
import { OutputPostType, PostPgWithBlogDataDb } from '../../types/output';

@Injectable()
export class PostOrmQueryRepository {
  constructor(@InjectRepository(Post_Orm) protected postRepository: Repository<Post_Orm>) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getPostById(id: number, userId: number | null): Promise<OutputPostType | null> {
    const postWithBlogName = await this.postRepository
      .createQueryBuilder('post')
      .leftJoin('post.blog', 'blog') // Используем leftJoin для присоединения таблицы блогов без автоматического выбора
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
      .where('post.id = :id', { id }) // Условие для фильтрации поста по ID
      .andWhere('post.isActive = true') // Убедимся, что пост активен
      .getOne(); // Получаем один результат
    if (!postWithBlogName) return null;
    return this._mapToOutputPostType(postWithBlogName);
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
      //.orderBy('post' + `."${sortData.sortBy}"`, `${sortData.sortDirection}`)
      .orderBy({ [`post.${sortData.sortBy}`]: sortData.sortDirection })
      .take(sortData.pageSize)
      .skip(skip)
      .getMany();
    if (!postsWithBlogName.length) return null;

    const totalCount = await this.postRepository.createQueryBuilder().where({ isActive: true }).getCount();
    const postDto = postsWithBlogName.map((p) => this._mapToOutputPostType(p));
    return new PaginationWithItems(sortData.pageNumber, sortData.pageSize, totalCount, postDto);
  }

  async getPosts(
    sortData: QueryPaginationResult,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userId: number | null,
  ): Promise<PaginationWithItems<OutputPostType> | null> {
    //TODO узнать про эту шнягу
    let orderCriteria;
    if (sortData.sortBy === 'blogName') {
      // Для сортировки по имени блога используем алиас таблицы 'blog' и поле 'name'
      orderCriteria = { 'blog.name': sortData.sortDirection };
    } else {
      // Для всех остальных случаев сортировки используем поля таблицы 'post'
      orderCriteria = { [`post.${sortData.sortBy}`]: sortData.sortDirection };
    }

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
      .where('post.isActive = true') // Убедимся, что пост активен
      .orderBy(orderCriteria)
      .take(sortData.pageSize)
      .skip(skip)
      .getMany();
    if (!postsWithBlogName.length) return null;

    const totalCount = await this.postRepository.createQueryBuilder().where({ isActive: true }).getCount();
    const postDto = postsWithBlogName.map((p) => this._mapToOutputPostType(p));
    return new PaginationWithItems(sortData.pageNumber, sortData.pageSize, totalCount, postDto);
  }

  private _mapToOutputPostType(post: Post_Orm): OutputPostType {
    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post.blog.name,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    };
  }
}

@Injectable()
export class PostgresPostQueryRepository extends AbstractRepository<PostPgWithBlogDataDb> {
  constructor(@InjectDataSource() protected dataSource: DataSource) {
    super(dataSource);
  }

  /**
   * Получает информацию о посте по его идентификатору с дополнительной информацией о лайках.
   * Если `userId` не передан, статус лайка будет 'None' по умолчанию.
   * @param postId - Идентификатор поста.
   * @param userId - (Опционально) Идентификатор пользователя для проверки статуса лайка.
   * @returns Запись с информацией о посте и лайках или null, если пост не найден.
   */
  async getPostById(postId: number, userId?: number | null): Promise<OutputPostType | null> {
    const postWithBlogData: OutputPostType[] = await this.dataSource.query(
      `
          WITH
              -- Сначала формируем временную таблицу user_likes с информацией о статусе лайка конкретного пользователя для данного поста.
              user_likes AS (
                  SELECT "likeStatus"
                  FROM public.post_likes
                  WHERE "postId" = $1 AND "userId" = COALESCE($2, 0) -- Если userId не задан, используем 0 как недопустимое значение
              ),
              -- Создаем временную таблицу likes_info, где считаем количество лайков и дизлайков
              likes_info AS (
                  SELECT
                      COUNT(id) FILTER (WHERE "likeStatus" = 'Like') AS likesCount,
                      COUNT(id) FILTER (WHERE "likeStatus" = 'Dislike') AS dislikesCount
                  FROM public.post_likes
                  WHERE "postId" = $1
              ),
              -- Подготавливаем информацию о последних трех лайках к посту в JSON.
              newest_likes AS (
                  SELECT json_agg(json_build_object(
                          'addedAt', pl."createdAt",
                          'userId', CAST(pl."userId" AS VARCHAR), 
                          'login', u.login 
                                  )) AS latest_likes
                  FROM (
                           SELECT pl."createdAt", pl."userId"
                           FROM public.post_likes pl
                           WHERE pl."postId" = $1 AND pl."likeStatus" = 'Like'
                           ORDER BY pl."createdAt" DESC -- Сортируем лайки по дате добавления
                           LIMIT 3 -- Ограничиваем количество лайков тремя
                       ) pl
                           JOIN public.users u ON pl."userId" = u.id -- Соединяем с таблицей пользователей для получения логинов
              )
          -- Основной запрос, который возвращает информацию о посте с  лайками.
          SELECT
              CAST(p.id AS VARCHAR),
              title, "shortDescription", content,
              CAST(p."blogId" AS VARCHAR),
              p."createdAt", "name" as "blogName",
              json_build_object(
                      'likesCount', li.likesCount, -- Количество лайков
                      'dislikesCount', li.dislikesCount, -- Количество дизлайков
                      'myStatus', COALESCE(ul."likeStatus", 'None'), 
                      'newestLikes', COALESCE(nl.latest_likes, '[]'::json) -- Информация о последних трех лайках
              ) as "extendedLikesInfo"
          FROM public.posts p
                   JOIN public.blogs b ON p."blogId" = b."id" -- Соединение с таблицей блогов для получения имени блога
                   CROSS JOIN likes_info li -- Добавляем информацию о лайках и дизлайках
                   CROSS JOIN newest_likes nl -- Добавляем информацию о последних лайках
                   LEFT JOIN user_likes ul ON true -- LEFT JOIN позволяет сохранить строки даже если совпадений в user_likes не найдено
          WHERE p.id = $1 AND p."active" = true
        `,
      [postId, userId],
    );

    if (!postWithBlogData[0]) return null;

    return postWithBlogData[0];
  }

  async getPosts(
    sortData: QueryPaginationResult,
    userId: number | null,
    blogId?: number,
  ): Promise<PaginationWithItems<OutputPostType>> {
    const blogCondition = blogId ? `AND posts."blogId" = ${blogId}` : '';
    const posts: OutputPostType[] = await this.dataSource.query(
      `
          WITH filtered_posts AS (
              -- Выборка активных постов с применением сортировки и пагинации.
              SELECT
                  posts."id", posts."title", posts."shortDescription", posts."content",
                  posts."blogId", posts."createdAt", blogs."name" AS "blogName"
              FROM
                  public.posts posts
                      JOIN public.blogs blogs ON posts."blogId" = blogs."id"
              WHERE
                 posts."active" = true
                 ${blogCondition}
              ORDER BY
                  "${sortData.sortBy}" ${sortData.sortDirection}
              LIMIT
                  $1 -- Количество постов на страницу (pageSize).
                  OFFSET
                  $1 * ($2 - 1) -- Вычисление смещения на основе номера страницы (pageNumber).
          ), likes_counts AS (
              -- Агрегация количества лайков и дизлайков по каждому посту.
              SELECT
                  post_likes."postId",
                  COUNT(*) FILTER (WHERE post_likes."likeStatus" = 'Like') AS "likesCount",
                  COUNT(*) FILTER (WHERE post_likes."likeStatus" = 'Dislike') AS "dislikesCount"
              FROM
                  public.post_likes post_likes
              WHERE
                  post_likes."postId" IN (SELECT "id" FROM filtered_posts)
              GROUP BY
                  post_likes."postId"
          ), user_reaction AS (
              -- Определение реакции (лайк/дизлайк) текущего пользователя на посты.
              SELECT
                  post_likes."postId",
                  post_likes."likeStatus"
              FROM
                  public.post_likes post_likes
              WHERE
                  post_likes."userId" = $3 AND post_likes."postId" IN (SELECT "id" FROM filtered_posts)
          ), latest_likers AS (
              SELECT
                  likes."postId",
                  json_agg(
                          json_build_object(
                                  'addedAt', likes."createdAt",
                                  'userId', CAST(likes."userId" AS VARCHAR),
                                  'login', users."login"
                          ) ORDER BY likes."createdAt" DESC
                  ) AS "newestLikes"
              FROM (
                       SELECT
                           post_likes."postId", post_likes."createdAt", post_likes."userId",
                           ROW_NUMBER() OVER(PARTITION BY post_likes."postId" ORDER BY post_likes."createdAt" DESC) as rn
                       -- Применение оконной функции для присвоения номера каждой строке (rn) внутри группы, сформированной по postId.
                       FROM
                           public.post_likes post_likes
                       WHERE
                           post_likes."likeStatus" = 'Like' AND
                           post_likes."postId" IN (SELECT "id" FROM filtered_posts)
                   ) likes
                       JOIN public.users users ON likes."userId" = users."id"
              WHERE likes.rn <= 3
              -- Фильтрация для выбора только строк, где номер (rn) не превышает 3
              GROUP BY
                  likes."postId"
              
          )
          -- Комбинирование данных из подзапросов для создания итоговой таблицы
          SELECT
              CAST(posts."id" AS VARCHAR) AS "id", -- Приводим id к строке
              posts."title",
              posts."shortDescription",
              posts."content",
              CAST(posts."blogId" AS VARCHAR) AS "blogId", -- Приводим blogId к строке
              posts."createdAt",
              posts."blogName",
              json_build_object(
                  'likesCount', COALESCE(likes_counts."likesCount", 0),
                  'dislikesCount', COALESCE(likes_counts."dislikesCount", 0),
                  'myStatus', COALESCE(user_reaction."likeStatus", 'None'),
                  'newestLikes', COALESCE(latest_likers."newestLikes", '[]'::json)
              ) AS "extendedLikesInfo"
          FROM
              filtered_posts posts
                  LEFT JOIN likes_counts ON posts."id" = likes_counts."postId"
                  LEFT JOIN user_reaction ON posts."id" = user_reaction."postId"
                  LEFT JOIN latest_likers ON posts."id" = latest_likers."postId"
          ORDER BY
              "${sortData.sortBy}" ${sortData.sortDirection};
      `,
      [sortData.pageSize, sortData.pageNumber, userId],
    );

    const allDtoPosts: OutputPostType[] = posts;

    const totalCountCondition = blogId ? `AND p."blogId" = ${blogId}` : '';
    const totalCount = await this.dataSource.query(`
        SELECT COUNT(p.id)
        FROM public.posts p
        WHERE   p."active" = true
        ${totalCountCondition}
    `);

    return new PaginationWithItems(+sortData.pageNumber, +sortData.pageSize, Number(totalCount[0].count), allDtoPosts);
  }
}
