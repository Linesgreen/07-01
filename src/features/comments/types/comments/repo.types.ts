import { LikeStatus } from './input';

export type RawCommentType = {
  comment_id: number;
  comment_content: string;
  comment_createdAt: Date;
  comment_userId: number;
  user_login: string;
  likes_likeStatus: LikeStatus | null;
  likes_likeCount: null | number;
  likes_dislikeCount: null | number;
};
