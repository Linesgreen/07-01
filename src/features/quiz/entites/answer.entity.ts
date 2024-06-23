import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { AnswerStatus } from '../enum/answer-status.enum';
import { Player } from './player.entity';
import { Question } from './question.entity';

@Entity('quiz_answers')
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  answerStatus: AnswerStatus;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  addedAt: Date;

  @ManyToOne(() => Player, (player) => player.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  player: Player;

  @ManyToOne(() => Question, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  question: Question;
}
