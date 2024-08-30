import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result } from '../../../infrastructure/object-result/objcet-result';
import { Blog_Orm } from '../../blogs/entites/blog.orm.entities';
import { BlogsRepository } from '../../blogs/repositories/blog.repository';
import { BlogCreateModel } from '../../blogs/types/input';

export class BlogCreateCommand {
  constructor(public readonly data: { blogCreateData: BlogCreateModel; userId: number }) {}
}

@CommandHandler(BlogCreateCommand)
export class BlogCreateHandler implements ICommandHandler<BlogCreateCommand> {
  constructor(private readonly blogRepository: BlogsRepository) {}

  async execute(command: BlogCreateCommand): Promise<Result<{ blogId: number }>> {
    const { blogCreateData, userId } = command.data;
    const blog = Blog_Orm.createBlogModel(blogCreateData);

    blog.isMembership = true;
    blog.userId = userId;

    await this.blogRepository.save(blog);

    return Result.Ok({ blogId: blog.id });
  }
}
