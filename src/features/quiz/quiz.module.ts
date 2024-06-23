// напиши заготовку модуля для nest

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entites/user.orm.entities';
import { Answer } from './entites/answer.entity';
import { Game } from './entites/game.entity';
import { Player } from './entites/player.entity';
import { Question } from './entites/question.entity';
import { SaQuestionController } from './questions/sa.question.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Answer, Game, Player, Question, User])],
  controllers: [SaQuestionController],
  providers: [],
})
export class QuizModule {}
