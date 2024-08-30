import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../../users/entites/user.orm.entities';
import { Answer } from './answer.entity';
import { Game } from './game.entity';

@Entity('quiz_players')
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'score',
    type: 'int',
  })
  score: number;

  @OneToOne(() => Game)
  game: Game;

  @OneToMany(() => Answer, (answer) => answer.player)
  answers: Answer[];

  @ManyToOne(() => User, (user) => user.player, {
    onDelete: 'CASCADE',
  })
  user: User;
}
