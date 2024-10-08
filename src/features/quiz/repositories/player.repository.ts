/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';

import { TransactionHelper } from '../../../infrastructure/TransactionHelper/transaction-helper';
import { Player } from '../entites/player.entity';

@Injectable()
export class PlayerRepository {
  constructor(private readonly transactionHelper: TransactionHelper) {}

  async save(game: Player): Promise<Player> {
    const repository = this.transactionHelper.getManager().getRepository(Player);

    return repository.save(game);
  }
}
