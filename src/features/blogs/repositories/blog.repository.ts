/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Blog_Orm } from '../entites/blog.orm.entities';
@Injectable()
export class BlogsRepository {
  constructor(@InjectRepository(Blog_Orm) protected blogRepository: Repository<Blog_Orm>) {}

  async save(blog: Blog_Orm): Promise<{ id: number }> {
    await blog.save();
    return { id: blog.id };
  }

  async getById(id: number): Promise<Blog_Orm | null> {
    return this.blogRepository.findOne({ where: { id, isActive: true } });
  }
}
