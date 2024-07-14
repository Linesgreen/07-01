/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Player } from '../entites/player.entity';

@Injectable()
export class PlayerRepository {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

  async save(game: Player): Promise<Player> {
    return this.playerRepository.save(game);
  }
}
