/* eslint-disable no-underscore-dangle */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { QueryPaginationResult } from '../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../../infrastructure/utils/createPagination';
import { Blog_Orm } from '../entites/blog.orm.entities';
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

  async getAllBloggersBlogs(
    sortData: QueryPaginationResult,
    userId: number,
  ): Promise<PaginationWithItems<OutputBlogType>> {
    const searchNameTerm = sortData.searchNameTerm ?? '';
    const skip = (sortData.pageNumber - 1) * sortData.pageSize;

    const blogs = await this.blogRepository
      .createQueryBuilder('blog')
      .select('blog.user')
      .addSelect('blog')
      .where({ name: ILike(`%${searchNameTerm}%`), isActive: true })
      .andWhere({ userId })
      .orderBy(`"${sortData.sortBy}"`, `${sortData.sortDirection}`)
      .take(sortData.pageSize)
      .skip(skip)
      .getMany();

    console.log('blogs', blogs);
    console.log('blogs', '--------------------------------------------------------');

    const totalCount = await this.blogRepository
      .createQueryBuilder()
      .where({ name: ILike(`%${searchNameTerm}%`), isActive: true })
      .andWhere({ userId })
      .getCount();

    const blogDto = blogs.map((blog) => this._mapToOutputBlogType(blog));
    return new PaginationWithItems(sortData.pageNumber, sortData.pageSize, totalCount, blogDto);
  }

  async getAllBlogsForSuperAdmin(sortData: QueryPaginationResult) {
    const searchNameTerm = sortData.searchNameTerm ?? '';
    const skip = (sortData.pageNumber - 1) * sortData.pageSize;

    const blogs = await this.blogRepository.find({
      where: {
        name: ILike(`%${searchNameTerm}%`),
        isActive: true,
      },
      order: {
        [sortData.sortBy]: sortData.sortDirection, // 'ASC' или 'DESC'
      },
      take: sortData.pageSize,
      skip: skip,
      relations: ['user'],
    });

    const totalCount = await this.blogRepository
      .createQueryBuilder()
      .where({ name: ILike(`%${searchNameTerm}%`), isActive: true })
      .getCount();

    const blogDto = blogs.map((blog) => this.mapForSa(blog));
    return new PaginationWithItems(sortData.pageNumber, sortData.pageSize, totalCount, blogDto);
  }

  private _mapToOutputBlogType(blog: Blog_Orm): OutputBlogType {
    return {
      id: blog.id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: false,
    };
  }

  private mapForSa(blog: Blog_Orm) {
    return {
      id: blog.id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt.toISOString(),
      isMembership: false,
      blogOwnerInfo: {
        userId: blog.userId.toString(),
        userLogin: blog?.user?.login ?? null,
      },
    };
  }
}
