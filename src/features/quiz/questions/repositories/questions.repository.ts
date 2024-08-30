import { Injectable } from '@nestjs/common';

import { TransactionHelper } from '../../../../infrastructure/TransactionHelper/transaction-helper';
import { Question } from '../../entites/question.entity';

@Injectable()
export class QuestionsRepository {
  constructor(private readonly transactionHelper: TransactionHelper) {}

  async saveQuestion(question: Question): Promise<string> {
    const repository = this.transactionHelper.getManager().getRepository(Question);

    const result = await repository.save(question);
    return result.id;
  }

  async findRandomQuestions({ number }: { number: number }): Promise<Question[] | null> {
    const repository = this.transactionHelper.getManager().getRepository(Question);
    return repository.createQueryBuilder('q').where('q.published = true').orderBy('RANDOM()').take(number).getMany();
  }

  async findQuestion(questionId: string): Promise<Question | null> {
    const repository = this.transactionHelper.getManager().getRepository(Question);

    try {
      return await repository.createQueryBuilder('q').where(`q.id = :questionId`, { questionId: questionId }).getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  // ***** Delete operations *****
  async deleteQuestion(questionId: string): Promise<boolean> {
    const repository = this.transactionHelper.getManager().getRepository(Question);

    const result = await repository
      .createQueryBuilder('q')
      .delete()
      .from(Question)
      .where('id = :questionId', { questionId: questionId })
      .execute();
    return result.affected === 1;
  }
}
