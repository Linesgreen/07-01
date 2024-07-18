import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { UserRepositoryNewTrans } from '../../../users/repositories/user.repository_with_new_trans';
import { Game } from '../../entites/game.entity';
import { Player } from '../../entites/player.entity';
import { GameStatus } from '../../enum/game-status.enum';
import { QuestionsRepository } from '../../questions/repositories/questions.repository';
import { GamesRepository } from '../../repositories/games.repository';
import { PlayerRepository } from '../../repositories/player.repository';

export class UserConnectionCommand {
  constructor(public data: { userId: number }) {}
}

@CommandHandler(UserConnectionCommand)
export class UserConnectionHandler implements ICommandHandler<UserConnectionCommand> {
  constructor(
    protected userRepository: UserRepositoryNewTrans,
    protected gamesRepository: GamesRepository,
    protected questionsRepository: QuestionsRepository,
    protected playerRepository: PlayerRepository,
  ) {}

  async execute(command: UserConnectionCommand) {
    const { userId } = command.data;
    const user = await this.userRepository.getById(userId);
    if (!user) return Result.Err(ErrorStatus.NOT_FOUND, 'User not found');

    let game = await this.gamesRepository.findGameForConnection({ userId });

    const player = new Player();
    player.user = user;
    player.score = 0;

    if (!game) {
      game = new Game();
      game.playerOne = player;
      game.status = GameStatus.PendingSecondPlayer;
      game.pairCreatedDate = new Date();
    } else {
      if (
        (game.status === GameStatus.PendingSecondPlayer && game.playerOne.user.id === userId) ||
        game.status === GameStatus.Active
      ) {
        return Result.Err(ErrorStatus.FORBIDDEN, 'User already in game');
      }
      game.playerTwo = player;
      game.status = GameStatus.Active;
      game.startGameDate = new Date();

      const questions = await this.questionsRepository.findRandomQuestions({ number: 5 });
      console.log(questions, 'questions');
      if (!questions?.length) throw new Error(`Questions not found`);

      game.questions = questions;
    }

    await this.playerRepository.save(player);
    await this.gamesRepository.save(game);

    return Result.Ok({ gameId: game.id });
  }
}
