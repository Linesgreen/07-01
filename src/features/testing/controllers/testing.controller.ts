import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Blog_Orm } from '../../blogs/entites/orm_blogs';
import { Post_Orm } from '../../posts/entites/orm_post';
import { Session_Orm } from '../../security/entites/orm_session';
import { User_Orm } from '../../users/entites/orm_user';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(User_Orm) protected userRepository: Repository<User_Orm>,
    @InjectRepository(Session_Orm) protected sessionRepository: Repository<Session_Orm>,
    @InjectRepository(Post_Orm) protected postRepository: Repository<Post_Orm>,
    @InjectRepository(Blog_Orm) protected blogRepository: Repository<Blog_Orm>,
  ) {}
  @Delete('/all-data')
  @HttpCode(204)
  async clearBd(): Promise<void> {
    await this.sessionRepository.delete({});
    await this.userRepository.delete({});
    await this.postRepository.delete({});
    await this.blogRepository.delete({});
    await this.dataSource.query(`DELETE  FROM public.sessions CASCADE`);
    await this.dataSource.query(`DELETE  FROM public.post_likes CASCADE`);
    await this.dataSource.query(`DELETE  FROM public.comments_likes CASCADE`);
    await this.dataSource.query(`DELETE  FROM public.comments CASCADE`);
    await this.dataSource.query(`DELETE FROM public.users CASCADE`);
    await this.dataSource.query(`DELETE FROM public.posts CASCADE`);
    await this.dataSource.query(`DELETE FROM public.blogs CASCADE`);

    return;
  }
}
