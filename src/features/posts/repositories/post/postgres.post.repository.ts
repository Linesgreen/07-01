/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AbstractRepository } from '../../../../infrastructure/repositories/abstract.repository';
import { Post_Orm } from '../../entites/orm_post';
import { PostPg } from '../../entites/post';
import { PostPgDb } from '../../types/output';

@Injectable()
export class PostOrmRepository {
  constructor(@InjectRepository(Post_Orm) protected postRepository: Repository<Post_Orm>) {}

  async addPost(newPost: Post_Orm): Promise<{ id: number }> {
    await this.save(newPost);
    return { id: newPost.id };
  }

  async getPostById(id: number): Promise<Post_Orm | null> {
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

@Injectable()
export class PostgresPostRepository extends AbstractRepository<PostPgDb> {
  constructor(@InjectDataSource() protected dataSource: DataSource) {
    super(dataSource);
  }

  async addPost(newPost: PostPg): Promise<string> {
    const { title, shortDescription, content, blogId, createdAt } = newPost;
    const entity = {
      title,
      shortDescription,
      content,
      blogId,
      createdAt,
    };
    const postInDB = await this.add('posts', entity);
    const postId = postInDB[0].id;
    return postId;
  }
  async deleteById(id: number): Promise<void> {
    const tableName = 'posts';
    await this.updateFields(tableName, 'id', id, { active: false });
  }
  async chekPostIsExist(id: number): Promise<boolean> {
    const tableName = 'posts';
    return this.checkIfExistsByFields(tableName, { id: id, active: true });
  }
  async updatePost(
    postId: number,
    postUpdateData: { title: string; shortDescription: string; content: string },
  ): Promise<void> {
    const tableName = 'posts';
    await this.updateFields(tableName, 'id', postId, postUpdateData);
  }
}
