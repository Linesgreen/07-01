/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable } from '@nestjs/common';

import { ErrorStatus, Result } from '../../../infrastructure/object-result/objcet-result';
import { BlogsOrmRepository } from '../../blogs/repositories/postgres.blogs.repository';
import { Post_Orm } from '../entites/orm_post';
import { PostCreateModel } from '../entites/post';
import { PostOrmRepository } from '../repositories/post/postgres.post.repository';
import { PostInBlogUpdateType } from '../types/input';

@Injectable()
export class PostService {
  constructor(
    protected blogRepository: BlogsOrmRepository,
    protected postRepository: PostOrmRepository,
  ) {}
  async createPost(postData: PostCreateModel): Promise<Result<{ id: number } | string>> {
    const targetBlog = await this.blogRepository.getById(Number(postData.blogId));
    if (!targetBlog) return Result.Err(ErrorStatus.NOT_FOUND, 'Blog Not Found');

    const newPost = Post_Orm.createPostModel(postData);

    const { id: postId } = await this.postRepository.addPost(newPost);

    return Result.Ok({ id: postId });
  }

  async updatePost(params: PostInBlogUpdateType, postId: number, blogId: number): Promise<Result<string>> {
    const post = await this.postRepository.getPostById(postId);
    if (!post) return Result.Err(ErrorStatus.NOT_FOUND, 'Post Not Found');

    const blogIsExist = await this.blogRepository.getById(blogId);
    if (!blogIsExist) return Result.Err(ErrorStatus.NOT_FOUND, 'Blog Not Found');

    // @ts-ignore
    post.update(params);
    await this.postRepository.save(post);
    return Result.Ok('Post updated');
  }
  async deletePost(postId: number, blogId: number): Promise<Result<string>> {
    const blog = await this.blogRepository.getById(blogId);
    if (!blog) return Result.Err(ErrorStatus.NOT_FOUND, `Blog ${blogId} Not Found`);

    const post = await this.postRepository.getPostById(postId);
    if (!post) return Result.Err(ErrorStatus.NOT_FOUND, `Post ${postId} Not Found`);

    await this.postRepository.deleteById(postId);
    return Result.Ok('Post deleted');
  }
}
