import { PostLikeRepository } from './repositories/likes/post-likes.query.repository';
import { PostQueryRepository } from './repositories/post/post.query.repository';
import { PostRepository } from './repositories/post/post.repository';
import { PostService } from './services/post.service';
import { AddLikeToPostUseCase } from './services/useCase/add-like.to.post.useSace';
import { GetCommentsForPostUseCase } from './services/useCase/get-comments-for-post-use.case';

export const postProviders = [PostService, PostRepository, PostQueryRepository, PostLikeRepository];

export const postsUseCases = [AddLikeToPostUseCase, GetCommentsForPostUseCase];
