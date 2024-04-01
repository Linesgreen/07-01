/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { AbstractRepository } from '../../../../infrastructure/repositories/abstract.repository';
import { BlogPgDb } from '../../../blogs/types/output';
import { CommentToPgDB } from '../../entites/commentPG';
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

@Injectable()
export class PostgresCommentsRepository extends AbstractRepository<BlogPgDb> {
  constructor(@InjectDataSource() protected dataSource: DataSource) {
    super(dataSource);
  }

  async addComment(newComment: CommentToPgDB): Promise<number> {
    const { userId, postId, content, createdAt } = newComment;
    const entity = { userId, postId, content, createdAt };
    const commentInDb = await this.add('comments', entity);
    return commentInDb[0].id;
  }
  async chekIsExist(id: number): Promise<boolean> {
    const tableName = 'comments';
    return this.checkIfExistsByFields(tableName, { id: id, active: true });
  }

  /**
   * Обновляет поля для блога
   * @returns Promise<void>
   * @param commentId
   * @param content
   */
  async updateComment(commentId: number, content: string): Promise<void> {
    const tableName = 'comments';
    await this.updateFields(tableName, 'id', commentId, { content: content });
  }
  async deleteById(id: number): Promise<void> {
    const tableName = 'comments';
    await this.updateFields(tableName, 'id', id, { active: false });
  }
}
