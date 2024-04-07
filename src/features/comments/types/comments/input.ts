import { IsEnum, IsString, Length } from 'class-validator';

import { Trim } from '../../../../infrastructure/decorators/transform/trim';
import { LikeStatus } from '../../../../infrastructure/decorators/validate/like-status.decorator';
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
  @LikeStatus()
  @IsEnum(LikeStatusE)
  likeStatus: LikeStatusE;
}

export type LikeStatusType = 'None' | 'Like' | 'Dislike';
