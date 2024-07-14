import { Answer } from '../../entites/answer.entity';
import { AnswerStatus } from '../../enum/answer-status.enum';
import { GameStatus } from '../../enum/game-status.enum';

export class GameViewDto {
  id: string;
  firstPlayerProgress: {
    answers: AnswerViewDto[] | [];
    player: PlayerViewDto;
    score: number;
  };
  secondPlayerProgress: {
    answers: Answer[] | [];
    player: PlayerViewDto;
    score: number;
  } | null;
  questions: QuestionViewDto[] | null;
  status: GameStatus;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;
}

class PlayerViewDto {
  id: string;
  login: string;
}

class QuestionViewDto {
  id: string;
  body: string;
}

export class AnswerViewDto {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: Date;
}
