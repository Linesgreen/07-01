import { randomUUID } from 'crypto';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Answer } from './answer.entity';
import { Game } from './game.entity';

@Entity('quiz_questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  body: string;

  @Column({ type: 'jsonb', default: [] })
  correctAnswers: string[];

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  updatedAt: Date;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];

  @ManyToMany(() => Game, (game) => game.questions)
  @JoinTable()
  games: Game[];

  //TODO убрать нафиг
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  static checkSortingField(value: any) {
    const q = new Question();
    q.id = randomUUID();
    q.body = '';
    q.published = false;
    q.createdAt = new Date();
    q.updatedAt = new Date();
    return q.hasOwnProperty(value);
  }
}
