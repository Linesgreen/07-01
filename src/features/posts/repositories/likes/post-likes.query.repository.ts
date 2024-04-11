import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Post_like_Orm } from '../../entites/orm_post.likes';

@Injectable()
export class PostLikeRepository {
  constructor(@InjectRepository(Post_like_Orm) private readonly postLikeRepository: Repository<Post_like_Orm>) {}
  async findByUserIdAndPostId(userId: number, postId: number): Promise<Post_like_Orm | null> {
    const like = await this.postLikeRepository.findOneBy({ userId, postId });
    return like;
  }

  async save(like: Post_like_Orm): Promise<void> {
    await like.save();
  }
}
