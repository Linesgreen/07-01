/* eslint-disable no-underscore-dangle */
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';

import { AbstractRepository } from '../../../infrastructure/repositories/abstract.repository';
import { QueryPaginationResult } from '../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../common/types/output';
import { BlogPG } from '../entites/blogPG';
import { Blogs_Orm } from '../entites/orm_blogs';
import { BlogPgDb, OutputBlogType } from '../types/output';

@Injectable()
export class BlogsOrmQueryRepository {
  constructor(@InjectRepository(Blogs_Orm) protected blogRepository: Repository<Blogs_Orm>) {}
  async getById(id: number): Promise<OutputBlogType | null> {
    const blog = await this.blogRepository.findOne({ where: { id, isActive: true } });
    return blog ? this._mapToOutputBlogType(blog) : null;
  }

  async getAll(sortData: QueryPaginationResult): Promise<PaginationWithItems<OutputBlogType>> {
    const searchNameTerm = sortData.searchNameTerm ?? '';
    const skip = (sortData.pageNumber - 1) * sortData.pageSize;

    const blogs = await this.blogRepository
      .createQueryBuilder()
      .where({ name: ILike(`%${searchNameTerm}%`), isActive: true })
      .orderBy(`"${sortData.sortBy}"`, `${sortData.sortDirection}`)
      .take(sortData.pageSize)
      .skip(skip)
      .getMany();
    const totalCount = await this.blogRepository
      .createQueryBuilder()
      .where({ name: ILike(`%${searchNameTerm}%`), isActive: true })
      .getCount();

    const blogDto = blogs.map((blog) => this._mapToOutputBlogType(blog));
    return new PaginationWithItems(sortData.pageNumber, sortData.pageSize, totalCount, blogDto);
  }

  private _mapToOutputBlogType(blog: Blogs_Orm): OutputBlogType {
    return {
      id: blog.id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: blog.isMembership,
    };
  }
}

@Injectable()
export class PostgresBlogsQueryRepository extends AbstractRepository<BlogPgDb> {
  constructor(@InjectDataSource() protected dataSource: DataSource) {
    super(dataSource);
  }

  async getBlogById(blogId: number): Promise<OutputBlogType | null> {
    const tableName = 'blogs';
    const fields = ['id', 'name', 'description', 'websiteUrl', 'createdAt', 'isMembership'];
    const blog = await this.getByFields(tableName, fields, { id: blogId, active: true });
    if (!blog) return null;
    return BlogPG.fromDbToInstance(blog[0]).toDto();
  }

  async getAll(sortData: QueryPaginationResult): Promise<PaginationWithItems<OutputBlogType>> {
    const searchNameTerm = sortData.searchNameTerm ?? '';

    const blogs = await this.dataSource.query(
      `SELECT id,"name","description", "websiteUrl", "createdAt", "isMembership"
       FROM public.blogs
       WHERE (name ILIKE '%${searchNameTerm}%') AND "active" = true
       ORDER BY "${sortData.sortBy}" ${sortData.sortDirection}
       LIMIT ${sortData.pageSize} OFFSET ${(sortData.pageNumber - 1) * sortData.pageSize}
      `,
    );

    const allDtoBlogs: OutputBlogType[] = blogs.map((blog) => BlogPG.fromDbToInstance(blog).toDto());
    const totalCount = await this.dataSource.query(`
      SELECT COUNT(id) FROM public.blogs WHERE  (name ILIKE '%${searchNameTerm}%') AND "active" = true
    `);

    return new PaginationWithItems(+sortData.pageNumber, +sortData.pageSize, Number(totalCount[0].count), allDtoBlogs);
  }
}
