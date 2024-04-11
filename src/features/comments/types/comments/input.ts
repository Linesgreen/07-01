import { IsEnum, IsString, Length } from 'class-validator';

import { Trim } from '../../../../infrastructure/decorators/transform/trim';

export enum LikeStatus {
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
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
