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

  @Column({ name: 'correct_answers', type: 'jsonb', default: [] })
  correctAnswers;

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  updatedAt: Date;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];

  @ManyToMany(() => Game, (game) => game.questions)
  @JoinTable()
  games: Game[];

  static create({ body, correctAnswers }: { body: string; correctAnswers: string[] }): Question {
    const question = new Question();
    question.body = body;
    question.correctAnswers = correctAnswers;
    question.published = false;
    question.createdAt = new Date();
    return question;
  }

  static checkSortingField(value: any): boolean {
    const mockQuestion = new Question();
    mockQuestion.id = randomUUID();
    mockQuestion.body = '';
    mockQuestion.published = false;
    mockQuestion.createdAt = new Date();
    mockQuestion.updatedAt = new Date();
    return mockQuestion.hasOwnProperty(value);
  }

  update({ body, correctAnswers }: { body: string; correctAnswers: string[] }): void {
    this.body = body;
    this.correctAnswers = correctAnswers;
    this.updatedAt = new Date();
  }
}
