/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Game } from '../entites/game.entity';
import { Player } from '../entites/player.entity';
import { GameStatus } from '../enum/game-status.enum';

@Injectable()
export class GamesRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

  async findGameForConnection(data: { userId: number }): Promise<Game | null> {
    return this.gamesRepository
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

  async save(game: Game): Promise<Game> {
    return this.gamesRepository.save(game);
  }
}
