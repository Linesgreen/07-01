import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

import { Question } from '../../entites/question.entity';

export class QueryDto {
  @Transform(({ value }) => {
    if (value.toLowerCase() === 'asc') {
      return 'ASC';
    } else {
      return 'DESC';
    }
  })
  sortDirection: 'ASC' | 'DESC' = 'DESC';

  @Transform(({ value }) => {
    if (Number(value)) {
      return Number(value);
    } else {
      return 1;
    }
  })
  pageNumber = 1;

  @Transform(({ value }) => {
    if (Number(value)) {
      return Number(value);
    } else {
      return 10;
    }
  })
  pageSize = 10;
}

export class QuestionQueryDto extends QueryDto {
  @Transform(({ value }) => {
    if (Question.checkSortingField(value)) {
      return value;
    } else {
      return 'createdAt';
    }
  })
  sortBy = 'createdAt';

  @IsOptional()
  @Transform(({ value }) => {
    if (value === PublishedStatus.Published) {
      return true;
    }
    if (value === PublishedStatus.NotPublished) {
      return false;
    }
  })
  publishedStatus: boolean | string;

  @IsOptional()
  bodySearchTerm: string;
}

export enum PublishedStatus {
  All = 'all',
  Published = 'published',
  NotPublished = 'notPublished',
}
