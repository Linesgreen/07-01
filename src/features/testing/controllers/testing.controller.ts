import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  @Delete('/all-data')
  @HttpCode(204)
  async clearBd(): Promise<void> {
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
