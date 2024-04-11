/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comment_Orm } from '../../entites/comment.orm.entities';

@Injectable()
export class CommentRepository {
  constructor(@InjectRepository(Comment_Orm) protected commentRepository: Repository<Comment_Orm>) {}

  async getById(id: number): Promise<Comment_Orm | null> {
    return this.commentRepository.findOneBy({ id: id });
  }

  async save(comment: Comment_Orm): Promise<{ id: number }> {
    await this.commentRepository.save(comment);
    return { id: comment.id };
  }

  async deleteById(id: number): Promise<boolean> {
    const result = await this.commentRepository.delete({ id: id });
    return !!result.affected;
  }
}
