import { CommentQueryRepository } from './repositories/comments/comment.query.repository';
import { CommentRepository } from './repositories/comments/comment.repository';
import { CommentLikeRepository } from './repositories/likes/comment-like.query.repository';
import { AddLikeToCommentUseCase } from './service/useCase/add-like.useCase';
import { CreateCommentUseCase } from './service/useCase/create-comment.useCase';
import { DeleteCommentByIdUseCase } from './service/useCase/delte-comment-byId.useCase';
import { UpdateCommentUseCase } from './service/useCase/update-comment.useCase';

export const commentProviders = [CommentRepository, CommentQueryRepository, CommentLikeRepository];

export const commentUseCases = [
  UpdateCommentUseCase,
  DeleteCommentByIdUseCase,
  CreateCommentUseCase,
  AddLikeToCommentUseCase,
];
