/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as process from 'process';

import { authProviders, authUseCases } from './features/auth';
import { AuthController } from './features/auth/controllers/auth.controller';
import { GetInformationAboutUserCase } from './features/auth/service/useCases/user-get-information-about-me.useCase';
import { blogsProviders, blogsUseCases } from './features/blogs';
import { BlogsController } from './features/blogs/controllers/blogs.controller';
import { SaBlogsController } from './features/blogs/controllers/sa.blogs.controller';
import { BlogIsExistConstraint } from './features/blogs/decorators/blog-is-exist.decorator';
import { Blog_Orm } from './features/blogs/entites/blog.orm.entities';
import { commentProviders, commentUseCases } from './features/comments';
import { CommentsController } from './features/comments/controller/comments.controller';
import { Comment_Orm } from './features/comments/entites/comment.orm.entities';
import { Comment_like_Orm } from './features/comments/entites/comment-like.entities';
import { postProviders, postsUseCases } from './features/posts';
import { PostsController } from './features/posts/controllers/posts.controller';
import { Post_Orm } from './features/posts/entites/post.orm.entities';
import { Post_like_Orm } from './features/posts/entites/post-like.orm.entities';
import { SecurityController } from './features/security/controllers/security.controller';
import { Session_Orm } from './features/security/entites/session.orm.entities';
import { TestingController } from './features/testing/controllers/testing.controller';
import { userProviders } from './features/users';
import { SaUserController } from './features/users/controllers/sa.user.controller';
import { User_Orm } from './features/users/entites/user.orm.entities';
import { UserRepository } from './features/users/repositories/user.repository';
import { DeleteUserUseCase } from './features/users/services/useCase/delete-user.useCase';
import { QueryPaginationPipe } from './infrastructure/decorators/transform/query-pagination.pipe';
import { ConfCodeIsValidConstraint } from './infrastructure/decorators/validate/conf-code.decorator';
import { EmailIsConformedConstraint } from './infrastructure/decorators/validate/email-is-conformed.decorator';
import { NameIsExistConstraint } from './infrastructure/decorators/validate/name-is-exist.decorator';
import { RecoveryCodeIsValidConstraint } from './infrastructure/decorators/validate/password-recovery-code.decorator';
import { PostIsExistConstraint } from './infrastructure/decorators/validate/post-is-exist.decorator';
import { PayloadFromJwtMiddleware } from './infrastructure/middleware/payload-from-jwt.middleware';
import { CookieJwtStrategy } from './infrastructure/strategies/cookie.jwt.strategy';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { MailModule } from './mail/mail.module';
import { configService } from './settings/config.service';

const strategies = [LocalStrategy, JwtStrategy, CookieJwtStrategy];
const decorators = [
  NameIsExistConstraint,
  EmailIsConformedConstraint,
  ConfCodeIsValidConstraint,
  PostIsExistConstraint,
  BlogIsExistConstraint,
  RecoveryCodeIsValidConstraint,
];
//TODo на фор рут асин и вынести ттл в enw
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5000,
      },
    ]),
    ConfigModule.forRoot({ isGlobal: true }),
    //Регистрируем для работы в postgres
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TypeOrmModule.forFeature([User_Orm, Session_Orm, Blog_Orm, Post_Orm, Comment_Orm, Comment_like_Orm, Post_like_Orm]),
    //Регистрируем для испльзования Passport strategy
    PassportModule,
    //Регистрируем для испльзования @CommandHandler
    CqrsModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
    MailModule,
  ],
  controllers: [
    BlogsController,
    SaBlogsController,
    PostsController,
    SaUserController,
    AuthController,
    TestingController,
    CommentsController,
    SecurityController,
  ],
  providers: [
    ...blogsProviders,
    ...postProviders,
    ...userProviders,
    ...authProviders,
    ...commentProviders,
    ...authUseCases,
    ...blogsUseCases,
    ...commentUseCases,
    ...postsUseCases,
    DeleteUserUseCase,
    GetInformationAboutUserCase,
    ...strategies,
    ...decorators,
    QueryPaginationPipe,
    UserRepository,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PayloadFromJwtMiddleware)
      .forRoutes(
        { path: 'comments/:commentId', method: RequestMethod.GET },
        { path: 'posts/:postId', method: RequestMethod.GET },
        { path: 'posts/:postId/comments', method: RequestMethod.GET },
        { path: 'posts', method: RequestMethod.GET },
        { path: 'blogs/:blogId/posts', method: RequestMethod.GET },
        { path: 'comments/:commentId', method: RequestMethod.GET },
      );
  }
}
