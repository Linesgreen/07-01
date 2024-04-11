/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Post_Orm } from '../../entites/orm_post';

@Injectable()
export class PostRepository {
  constructor(@InjectRepository(Post_Orm) protected postRepository: Repository<Post_Orm>) {}

  async addPost(newPost: Post_Orm): Promise<{ id: number }> {
    await this.save(newPost);
    return { id: newPost.id };
  }

  async findById(id: number): Promise<Post_Orm | null> {
    const post = await this.postRepository.findOneBy({ id, isActive: true });
    return post;
  }

  async deleteById(id: number): Promise<void> {
    await this.postRepository.update({ id }, { isActive: false });
  }

  async save(post: Post_Orm): Promise<void> {
    await this.postRepository.save(post);
  }
}
