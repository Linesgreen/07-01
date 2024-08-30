import { BlogCreateHandler } from '../blogger/command/blog-create.command';
import { BlogsQueryRepository } from './repositories/blog.query.repository';
import { BlogsRepository } from './repositories/blog.repository';
import { BlogsService } from './services/blogs.service';
import { GetPostForBlogUseCase } from './services/useCase/get-posts-for-blog.useCase';

export const blogsProviders = [BlogsService, BlogsRepository, BlogsQueryRepository];
export const blogsUseCases = [GetPostForBlogUseCase];
export const bloggerUserCases = [BlogCreateHandler];
