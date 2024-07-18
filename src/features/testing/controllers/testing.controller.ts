import { Controller, Delete, HttpCode } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(private readonly dataSource: DataSource) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteAll(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      // Отключаем проверки внешних ключей
      await queryRunner.query('SET CONSTRAINTS ALL DEFERRED;');

      // Удаляем данные из зависимых таблиц сначала
      await queryRunner.query('DELETE FROM "comment_like_orm";');
      await queryRunner.query('DELETE FROM "comment_orm";');
      await queryRunner.query('DELETE FROM "post_like_orm";');
      await queryRunner.query('DELETE FROM "post_orm";');
      await queryRunner.query('DELETE FROM "quiz_questions_games_quiz_games";');
      await queryRunner.query('DELETE FROM "quiz_answers";');
      await queryRunner.query('DELETE FROM "quiz_players";');
      await queryRunner.query('DELETE FROM "quiz_questions";');
      await queryRunner.query('DELETE FROM "quiz_games";');
      await queryRunner.query('DELETE FROM "blogs_orm";');
      await queryRunner.query('DELETE FROM "session_orm";');
      await queryRunner.query('DELETE FROM "user";');

      // Включаем проверки внешних ключей обратно
      await queryRunner.query('SET CONSTRAINTS ALL IMMEDIATE;');

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
