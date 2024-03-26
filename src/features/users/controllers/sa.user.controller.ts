import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';

import { QueryPaginationPipe } from '../../../infrastructure/decorators/transform/query-pagination.pipe';
import { AuthGuard } from '../../../infrastructure/guards/auth-basic.guard';
import { ErrorResulter } from '../../../infrastructure/object-result/objcet-result';
import { QueryPaginationResult } from '../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../common/types/output';
import { ORMUserQueryRepository, PostgresUserQueryRepository } from '../repositories/postgres.user.query.repository';
import { UserService } from '../services/user.service';
import { UserCreateModel } from '../types/input';
import { UserOutputType } from '../types/output';

@Controller('sa/users')
@UseGuards(AuthGuard)
export class SaUserController {
  constructor(
    protected readonly userService: UserService,
    protected readonly postsQueryRepository: PostgresUserQueryRepository,
    protected readonly oRMUserQueryRepository: ORMUserQueryRepository,
  ) {}
  @Post('')
  @HttpCode(201)
  async createUser(@Body() userCreateData: UserCreateModel): Promise<UserOutputType> {
    const result = await this.userService.addUserORM(userCreateData);
    if (result.isFailure()) ErrorResulter.proccesError(result);
    return result.value as UserOutputType;
  }
  @Get('')
  async getAllUsers(
    @Query(QueryPaginationPipe) queryData: QueryPaginationResult,
  ): Promise<PaginationWithItems<UserOutputType>> {
    return this.oRMUserQueryRepository.getAll(queryData);
  }
  @Delete(':userId')
  @HttpCode(204)
  async deleteUser(@Param('userId', ParseIntPipe) userId: number): Promise<void> {
    const result = await this.userService.deleteUser(userId);
    if (result.isFailure()) ErrorResulter.proccesError(result);
  }
}
