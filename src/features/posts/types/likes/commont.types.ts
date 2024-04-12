import { LikeStatus } from '../../../comments/types/comments/input';

export type LastLikeFromDB = {
  login: string;
  id: number;
  createdAt: Date;
  postId: number;
  userId: number;
  likeStatus: LikeStatus;
  rn: string;
};

export type LastLike = {
  postId: number;
  addedAt: string;
  userId: string;
  login: string;
};

export type LikeCount = { postId: number; likesCount: number; dislikesCount: number };
