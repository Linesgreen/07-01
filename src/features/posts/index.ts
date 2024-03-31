import { PostLikesQueryRepository } from './repositories/likes/post-likes.query.repository';
import { PostLikesRepository } from './repositories/likes/post-likes.repository';
import {
  PostgresPostQueryRepository,
  PostOrmQueryRepository,
} from './repositories/post/postgres.post.query.repository';
import { PostgresPostRepository, PostOrmRepository } from './repositories/post/postgres.post.repository';
import { PostService } from './services/post.service';
import { AddLikeToPostUseCase } from './services/useCase/add-like.to.post.useSace';
import { GetCommentsForPostUseCase } from './services/useCase/get-comments-for-post-use.case';

export const postProviders = [
  PostService,
  PostLikesQueryRepository,
  PostLikesRepository,
  PostgresPostRepository,
  PostgresPostQueryRepository,
  PostOrmRepository,
  PostOrmQueryRepository,
];

export const postsUseCases = [AddLikeToPostUseCase, GetCommentsForPostUseCase];
