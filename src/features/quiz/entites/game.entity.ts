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
    name: 'pair_created_date',
    type: 'timestamp with time zone',
  })
  pairCreatedDate: Date;

  @Column({
    name: 'start_game_date',
    type: 'timestamp with time zone',
    nullable: true,
  })
  startGameDate: Date | null;

  @Column({
    name: 'finish_game_date',
    type: 'timestamp with time zone',
    nullable: true,
  })
  finishGameDate: Date | null;

  @Column({
    name: 'finishing_expiration_date',
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

  static checkSortingField(value: any): boolean {
    const game = new Game();
    game.id = randomUUID();
    game.status = GameStatus.Finished;
    game.pairCreatedDate = new Date();
    game.startGameDate = new Date();
    game.finishGameDate = new Date();
    return game.hasOwnProperty(value);
  }
}
