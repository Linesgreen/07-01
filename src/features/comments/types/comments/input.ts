import { IsEnum, IsString, Length } from 'class-validator';

import { Trim } from '../../../../infrastructure/decorators/transform/trim';
//TODO перевести на enum
export enum LikeStatusE {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export class CommentUpdateModel {
  @Trim()
  @IsString()
  @Length(30, 300)
  content: string;
}

export class LikeCreateModel {
  @IsEnum(LikeStatusE)
  likeStatus: LikeStatusE;
}

export type LikeStatusType = 'None' | 'Like' | 'Dislike';
