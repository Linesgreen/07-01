import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Blog_Orm } from '../../blogs/entites/blog.orm.entities';
import { Comment_Orm } from '../../comments/entites/comment.orm.entities';
import { Comment_like_Orm } from '../../comments/entites/comment-like.entities';
import { Post_Orm } from '../../posts/entites/post.orm.entities';
import { Post_like_Orm } from '../../posts/entites/post-like.orm.entities';
import { Session_Orm } from '../../security/entites/session.orm.entities';
import { User } from '../../users/entites/user.orm.entities';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectRepository(User) protected userRepository: Repository<User>,
    @InjectRepository(Session_Orm) protected sessionRepository: Repository<Session_Orm>,
    @InjectRepository(Post_Orm) protected postRepository: Repository<Post_Orm>,
    @InjectRepository(Blog_Orm) protected blogRepository: Repository<Blog_Orm>,
    @InjectRepository(Comment_Orm) protected commentRepository: Repository<Comment_Orm>,
    @InjectRepository(Comment_like_Orm) protected commentLikeOrmRepository: Repository<Comment_like_Orm>,
    @InjectRepository(Post_like_Orm) protected postLikeOrmRepository: Repository<Post_like_Orm>,
  ) {}
  @Delete('/all-data')
  @HttpCode(204)
  async clearBd(): Promise<void> {
    await this.commentLikeOrmRepository.delete({});
    await this.postLikeOrmRepository.delete({});
    await this.sessionRepository.delete({});
    await this.commentRepository.delete({});
    await this.postRepository.delete({});
    await this.blogRepository.delete({});
    await this.userRepository.delete({});
    return;
  }
}
