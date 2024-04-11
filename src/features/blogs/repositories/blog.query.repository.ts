/* eslint-disable no-underscore-dangle */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { QueryPaginationResult } from '../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../common/types/output';
import { Blog_Orm } from '../entites/orm_blogs';
import { OutputBlogType } from '../types/output';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectRepository(Blog_Orm) protected blogRepository: Repository<Blog_Orm>) {}
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

  private _mapToOutputBlogType(blog: Blog_Orm): OutputBlogType {
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
