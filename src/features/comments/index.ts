import {
  CommentOrmQueryRepository,
  PostgresCommentsQueryRepository,
} from './repositories/comments/postgres.comments.query.repository';
import { CommentOrmRepository, PostgresCommentsRepository } from './repositories/comments/postgres.comments.repository';
import { CommentsLikesRepository } from './repositories/likes/comments-likes.repository';
import {
  CommentOrmLikeRepository,
  CommentsLikesQueryRepository,
} from './repositories/likes/comments-likes-query.repository';
import { AddLikeToCommentUseCase } from './service/useCase/add-like.useCase';
import { CreateCommentUseCase } from './service/useCase/create-comment.useCase';
import { DeleteCommentByIdUseCase } from './service/useCase/delte-comment-byId.useCase';
import { GetCommentByIdUseCase } from './service/useCase/get-comment.useCase';
import { UpdateCommentUseCase } from './service/useCase/update-comment.useCase';

export const commentProviders = [
  CommentsLikesQueryRepository,
  CommentsLikesRepository,
  PostgresCommentsQueryRepository,
  PostgresCommentsRepository,
  CommentOrmRepository,
  CommentOrmQueryRepository,
  CommentOrmLikeRepository,
];

export const commentUseCases = [
  UpdateCommentUseCase,
  GetCommentByIdUseCase,
  DeleteCommentByIdUseCase,
  CreateCommentUseCase,
  AddLikeToCommentUseCase,
];
