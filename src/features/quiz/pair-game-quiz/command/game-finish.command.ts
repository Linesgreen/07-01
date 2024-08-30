import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Interval } from '@nestjs/schedule';

import { TransactionHelper } from '../../../../infrastructure/TransactionHelper/transaction-helper';
import { GameStatus } from '../../enum/game-status.enum';
import { GamesRepository } from '../../repositories/games.repository';
import { PlayerRepository } from '../../repositories/player.repository';

export class GameFinishCommand {
  constructor() {}
}

@CommandHandler(GameFinishCommand)
export class GameFinishHandler implements ICommandHandler<GameFinishCommand> {
  constructor(
    private readonly transactionHelper: TransactionHelper,
    private readonly gamesRepository: GamesRepository,
    private readonly playerRepository: PlayerRepository,
  ) {}

  @Interval(100000000)
  async execute(command: GameFinishCommand): Promise<void> {
    await this.transactionHelper.doTransactional(async () => {
      const games = await this.gamesRepository.findGamesToFinish();

      if (!games) {
        return;
      }

      for (const game of games) {
        let fastPlayer = game.playerOne;
        if (game.playerTwo.answers.length === 5) {
          fastPlayer = game.playerTwo;
        }

        if (fastPlayer.score !== 0) {
          fastPlayer.score += 1;
        }

        await this.playerRepository.save(fastPlayer);

        game.status = GameStatus.Finished;
        game.finishGameDate = new Date();
        game.finishingExpirationDate = null;
        await this.gamesRepository.save(game);
      }
    });
  }
}
