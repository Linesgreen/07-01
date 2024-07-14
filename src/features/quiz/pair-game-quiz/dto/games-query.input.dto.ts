import { Transform } from 'class-transformer';

import { Game } from '../../entites/game.entity';
import { QueryDto } from '../../questions/dto/sort.dto';

export class GameQueryDto extends QueryDto {
  @Transform(({ value }) => {
    if (Game.checkSortingField(value)) {
      return value;
    } else {
      return 'pairCreatedDate';
    }
  })
  sortBy = 'pairCreatedDate';
}
