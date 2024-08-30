import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result } from '../../../../infrastructure/object-result/objcet-result';
import { BlogsRepository } from '../../repositories/blog.repository';

export class BindBlogsToUserCommand {
  constructor(public data: { blogId: number; userId: number }) {}
}

@CommandHandler(BindBlogsToUserCommand)
export class BindBlogsToUserHandler implements ICommandHandler<BindBlogsToUserCommand> {
  constructor(private readonly blogRepository: BlogsRepository) {}

  async execute(command: BindBlogsToUserCommand): Promise<Result> {
    const { blogId, userId } = command.data;

    const blog = await this.blogRepository.getById(blogId);
    if (!blog) throw new NotFoundException();

    if (blog.user)
      throw new BadRequestException({
        message: 'Blog already binded to user',
        field: 'blogId',
      });

    blog.addUserToBlog({ userId });
    await this.blogRepository.save(blog);

    return Result.Ok();
  }
}
