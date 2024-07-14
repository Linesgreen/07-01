// напиши заготовку модуля для nest

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entites/user.orm.entities';
import { UserRepository } from '../users/repositories/user.repository';
import { Answer } from './entites/answer.entity';
import { Game } from './entites/game.entity';
import { Player } from './entites/player.entity';
import { Question } from './entites/question.entity';
import { UserConnectionHandler } from './pair-game-quiz/command/user-connection.command';
import { PublicQuizController } from './pair-game-quiz/quiz.controller';
import { QuestionCreateUseCase } from './questions/command/question-create.command';
import { QuestionPublishUseCase } from './questions/command/qustion-publish.command';
import { QuestionsRepository } from './questions/repositories/questions.repository';
import { QuestionsQueryRepository } from './questions/repositories/questions-query.repository';
import { SaQuestionController } from './questions/sa.question.controller';
import { GamesQueryRepository } from './repositories/games.query.repository';
import { GamesRepository } from './repositories/games.repository';
import { PlayerRepository } from './repositories/player.repository';

const commands = [UserConnectionHandler, QuestionCreateUseCase, QuestionPublishUseCase];

@Module({
  imports: [TypeOrmModule.forFeature([Answer, Game, Player, Question, User]), CqrsModule],
  controllers: [SaQuestionController, PublicQuizController],
  providers: [
    UserRepository,
    PlayerRepository,
    QuestionsRepository,
    GamesRepository,
    QuestionsQueryRepository,
    GamesQueryRepository,
    ...commands,
  ],
})
export class QuizModule {}
