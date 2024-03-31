import { BlogsOrmQueryRepository, PostgresBlogsQueryRepository } from './repositories/postgres.blogs.query.repository';
import { BlogsOrmRepository, PostgresBlogsRepository } from './repositories/postgres.blogs.repository';
import { BlogsService } from './services/blogs.service';
import { GetPostForBlogUseCase } from './services/useCase/get-posts-for-blog.useCase';

export const blogsProviders = [
  BlogsService,
  PostgresBlogsRepository,
  PostgresBlogsQueryRepository,
  BlogsOrmQueryRepository,
  BlogsOrmRepository,
];
export const blogsUseCases = [GetPostForBlogUseCase];
