import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { add } from 'date-fns';

import { ErrorStatus, Result } from '../../../../infrastructure/object-result/objcet-result';
import { Answer } from '../../entites/answer.entity';
import { AnswerStatus } from '../../enum/answer-status.enum';
import { GameStatus } from '../../enum/game-status.enum';
import { AnswersRepository } from '../../repositories/answers.repository';
import { GamesRepository } from '../../repositories/games.repository';
import { PlayerRepository } from '../../repositories/player.repository';
import { AnswerInputDto } from '../dto/answers.input.dto';

export class AnswerSendCommand {
  constructor(public readonly data: { answerInputDto: AnswerInputDto } & { userId: number }) {}
}

@CommandHandler(AnswerSendCommand)
export class AnswerSendHandler implements ICommandHandler<AnswerSendCommand> {
  constructor(
    private readonly gamesRepository: GamesRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly answerRepository: AnswersRepository,
  ) {}

  async execute(command: AnswerSendCommand): Promise<Result<string> | Result<{ gameId: string }>> {
    const currentGame = await this.gamesRepository.findGameForAnswer(command.data.userId);

    if (!currentGame) return Result.Err(ErrorStatus.FORBIDDEN, 'Game not found');

    let currentPlayer = currentGame.playerOne;
    if (currentGame.playerTwo && command.data.userId === currentGame.playerTwo.user.id) {
      currentPlayer = currentGame.playerTwo;
    }

    const questionIndex = currentPlayer.answers.length;
    if (questionIndex >= 5) {
      return Result.Err(ErrorStatus.FORBIDDEN, 'Game is over');
    }

    const currentQuestion = currentGame.questions[questionIndex];
    let answerStatus = AnswerStatus.Incorrect;
    const answerCheck = currentQuestion.correctAnswers.includes(command.data.answerInputDto.answer);
    if (answerCheck) {
      answerStatus = AnswerStatus.Correct;
      currentPlayer.score += 1;
      await this.playerRepository.save(currentPlayer);
    }

    const answer = new Answer();
    answer.player = currentPlayer;
    answer.question = currentQuestion;
    answer.answerStatus = answerStatus;
    answer.addedAt = new Date();

    await this.answerRepository.save(answer);

    const playerOneAnswersCount = currentGame.playerOne.answers.length;
    const playerTwoAnswersCount = currentGame.playerTwo.answers.length;

    // Set game status to 'Finishing' when one player answered all questions
    if (
      (playerOneAnswersCount === 4 && currentGame.playerOne.id === currentPlayer.id) ||
      (playerTwoAnswersCount === 4 && currentGame.playerTwo.id === currentPlayer.id)
    ) {
      currentGame.finishingExpirationDate = add(new Date(), {
        seconds: 9,
      });

      await this.gamesRepository.save(currentGame);
    }

    // Finish game when all questions are answered
    if (
      (playerOneAnswersCount === 5 && playerTwoAnswersCount === 4) ||
      (playerOneAnswersCount === 4 && playerTwoAnswersCount === 5)
    ) {
      let fastPlayer = currentGame.playerOne;
      if (playerTwoAnswersCount === 5) {
        fastPlayer = currentGame.playerTwo;
      }

      if (fastPlayer.score !== 0) {
        fastPlayer.score += 1;
      }

      await this.playerRepository.save(fastPlayer);

      currentGame.status = GameStatus.Finished;
      currentGame.finishGameDate = new Date();
      currentGame.finishingExpirationDate = null;

      console.log('333333333333333333333333333333');

      await this.gamesRepository.save(currentGame);
    }

    return Result.Ok({ gameId: currentGame.id });
  }
}
