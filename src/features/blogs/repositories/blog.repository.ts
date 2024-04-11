/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Blog_Orm } from '../entites/orm_blogs';
@Injectable()
export class BlogsRepository {
  constructor(@InjectRepository(Blog_Orm) protected blogRepository: Repository<Blog_Orm>) {}
  async addBlog(newBlog: Blog_Orm): Promise<{ id: number }> {
    const blog = await newBlog.save();
    return { id: blog.id };
  }

  async save(blog: Blog_Orm): Promise<void> {
    await blog.save();
  }

  async getById(id: number): Promise<Blog_Orm | null> {
    return this.blogRepository.findOne({ where: { id, isActive: true } });
  }
}
