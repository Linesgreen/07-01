/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comment_Orm } from '../../entites/orm_comment';

@Injectable()
export class CommentOrmRepository {
  constructor(@InjectRepository(Comment_Orm) protected commentRepository: Repository<Comment_Orm>) {}
  async addComment(comment: Comment_Orm): Promise<{ id: number }> {
    console.log(comment);
    const newComment = await this.commentRepository.save(comment);
    return { id: newComment.id };
  }

  async getById(id: number): Promise<Comment_Orm | null> {
    return this.commentRepository.findOneBy({ id: id });
  }

  async update(comment: Comment_Orm): Promise<void> {
    await this.commentRepository.update({ id: comment.id }, comment);
  }

  async deleteById(id: number): Promise<boolean> {
    const result = await this.commentRepository.delete({ id: id });
    return !!result.affected;
  }
}
