import { IsString, Length } from 'class-validator';

import { Trim } from '../../../infrastructure/decorators/transform/trim';

export class PostInBlogUpdateType {
  @Trim()
  @Length(1, 30)
  title: string;
  @Trim()
  @Length(1, 30)
  shortDescription: string;
  @Trim()
  @Length(1, 1000)
  content: string;
}

export class CommentCreateModel {
  @Trim()
  @IsString()
  @Length(20, 300)
  content: string;
}

export class PostCreateModel {
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
}

export class CommentCreateData extends CommentCreateModel {
  postId: number;
  userId: number;
}
