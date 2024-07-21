/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';

import { TransactionHelper } from '../../../infrastructure/TransactionHelper/transaction-helper';
import { Game } from '../entites/game.entity';
import { GameStatus } from '../enum/game-status.enum';

@Injectable()
export class GamesRepository {
  constructor(private readonly transactionHelper: TransactionHelper) {}

  async findGameForConnection(data: { userId: number }): Promise<Game | null> {
    const repository = this.transactionHelper.getManager().getRepository(Game);

    return repository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.playerOne', 'po')
      .leftJoinAndSelect('game.playerTwo', 'pt')
      .leftJoinAndSelect('po.user', 'pou')
      .leftJoinAndSelect('pt.user', 'ptu')
      .where(`game.status = :pending or game.status = :active`, {
        pending: GameStatus.PendingSecondPlayer,
        active: GameStatus.Active,
      })
      .andWhere(`(pou.id = :userId or ptu.id = :userId)`, {
        userId: data.userId,
      })
      .getOne();
  }

  async findGameForAnswer(userId: number): Promise<Game | null> {
    const repository = this.transactionHelper.getManager().getRepository(Game);

    return repository
      .createQueryBuilder('game')
      .setLock('pessimistic_write', undefined, ['game'])
      .leftJoinAndSelect('game.questions', 'gq')
      .leftJoinAndSelect('game.playerOne', 'po')
      .leftJoinAndSelect('po.user', 'pou')
      .leftJoinAndSelect('po.answers', 'poa')
      .leftJoinAndSelect('poa.question', 'poaq')
      .leftJoinAndSelect('game.playerTwo', 'pt')
      .leftJoinAndSelect('pt.user', 'ptu')
      .leftJoinAndSelect('pt.answers', 'pta')
      .leftJoinAndSelect('pta.question', 'ptaq')
      .where('game.status = :active', {
        active: GameStatus.Active,
      })
      .andWhere('(pou.id = :userId or ptu.id = :userId)', { userId: userId })
      .orderBy('gq.created_at', 'DESC')
      .addOrderBy('poa.added_at')
      .addOrderBy('pta.added_at')
      .getOne();
  }

  async findGamesToFinish(): Promise<Game[] | null> {
    const repository = this.transactionHelper.getManager().getRepository(Game);
    return repository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.questions', 'gq')
      .leftJoinAndSelect('game.playerOne', 'po')
      .leftJoinAndSelect('po.user', 'pou')
      .leftJoinAndSelect('po.answers', 'poa')
      .leftJoinAndSelect('poa.question', 'poaq')
      .leftJoinAndSelect('game.playerTwo', 'pt')
      .leftJoinAndSelect('pt.user', 'ptu')
      .leftJoinAndSelect('pt.answers', 'pta')
      .leftJoinAndSelect('pta.question', 'ptaq')
      .andWhere('game.finishingExpirationDate < now()')
      .getMany();
  }

  async save(game: Game): Promise<Game> {
    const repository = this.transactionHelper.getManager().getRepository(Game);

    return repository.save(game);
  }
}
