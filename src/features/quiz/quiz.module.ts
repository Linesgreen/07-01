// напиши заготовку модуля для nest

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entites/user.orm.entities';
import { Answer } from './entites/answer.entity';
import { Game } from './entites/game.entity';
import { Player } from './entites/player.entity';
import { Question } from './entites/question.entity';
import { QuestionsQueryRepository } from './questions/repositories/questions-query.repository';
import { SaQuestionController } from './questions/sa.question.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Answer, Game, Player, Question, User]), CqrsModule],
  controllers: [SaQuestionController],
  providers: [QuestionsQueryRepository],
})
export class QuizModule {}
