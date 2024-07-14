import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Question } from '../../entites/question.entity';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}

  async saveQuestion(question: Question): Promise<string> {
    const result = await this.questionsRepository.save(question);
    return result.id;
  }

  async findRandomQuestions({ number }: { number: number }): Promise<Question[] | null> {
    return this.questionsRepository
      .createQueryBuilder('q')
      .where('q.published = true')
      .orderBy('RANDOM()')
      .take(number)
      .getMany();
  }

  // ***** Find question operations *****
  async findQuestion(questionId: string): Promise<Question | null> {
    try {
      return await this.questionsRepository
        .createQueryBuilder('q')
        .where(`q.id = :questionId`, { questionId: questionId })
        .getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  // ***** Delete operations *****
  async deleteQuestion(questionId: string): Promise<boolean> {
    const result = await this.questionsRepository
      .createQueryBuilder('q')
      .delete()
      .from(Question)
      .where('id = :questionId', { questionId: questionId })
      .execute();
    return result.affected === 1;
  }
}
