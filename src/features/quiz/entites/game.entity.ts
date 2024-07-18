import { randomUUID } from 'crypto';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { GameStatus } from '../enum/game-status.enum';
import { Player } from './player.entity';
import { Question } from './question.entity';

@Entity('quiz_games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: GameStatus })
  status: GameStatus;

  @CreateDateColumn({
    type: 'timestamp with time zone',
  })
  pairCreatedDate: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  startGameDate: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  finishGameDate: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  finishingExpirationDate: Date | null;

  @OneToOne(() => Player, (player) => player.game, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  playerOne: Player;

  @OneToOne(() => Player, (player) => player.game, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  playerTwo: Player;

  @ManyToMany(() => Question, (question) => question.games)
  questions: Question[];

  //TODO переделать
  static checkSortingField(value: any) {
    const g = new Game();
    g.id = randomUUID();
    g.status = GameStatus.Finished;
    g.pairCreatedDate = new Date();
    g.startGameDate = new Date();
    g.finishGameDate = new Date();
    return g.hasOwnProperty(value);
  }
}
