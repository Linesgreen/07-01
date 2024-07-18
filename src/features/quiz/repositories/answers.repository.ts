/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';

import { TransactionHelper } from '../../../infrastructure/TransactionHelper/transaction-helper';
import { Answer } from '../entites/answer.entity';

@Injectable()
export class AnswersRepository {
  constructor(private readonly transactionHelper: TransactionHelper) {}

  async save(game: Answer): Promise<Answer> {
    const repository = this.transactionHelper.getManager().getRepository(Answer);

    return repository.save(game);
  }
}
