import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { QueryPaginationPipe } from '../../../infrastructure/decorators/transform/query-pagination.pipe';
import { AuthGuard } from '../../../infrastructure/guards/auth-basic.guard';
import { ErrorResulter } from '../../../infrastructure/object-result/objcet-result';
import { QueryPaginationResult } from '../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../../infrastructure/utils/createPagination';
import { UserQueryRepository } from '../repositories/user.query.repository';
import { DeleteUserCommand } from '../services/useCase/delete-user.useCase';
import { UserService } from '../services/user.service';
import { UserCreateModel } from '../types/input';
import { UserOutputType } from '../types/output';

@Controller('sa/users')
@UseGuards(AuthGuard)
export class SaUserController {
  constructor(
    protected readonly userService: UserService,
    protected readonly userQueryRepository: UserQueryRepository,
    protected readonly commandBus: CommandBus,
  ) {}

  //TODO и шо тут делать по итогу?
  @Post('')
  @HttpCode(201)
  async createUser(@Body() userCreateData: UserCreateModel): Promise<UserOutputType> {
    const result = await this.userService.createUser(userCreateData);
    const { id } = result.value;

    const user = await this.userQueryRepository.getUserById(id);
    if (!user) throw new HttpException('User create error', 500);

    return user;
  }

  @Get('')
  async getAllUsers(
    @Query(QueryPaginationPipe) queryData: QueryPaginationResult,
  ): Promise<PaginationWithItems<UserOutputType>> {
    return this.userQueryRepository.getAll(queryData);
  }

  @Delete(':userId')
  @HttpCode(204)
  async deleteUser(@Param('userId', ParseIntPipe) userId: number): Promise<void> {
    const result = await this.commandBus.execute(new DeleteUserCommand(userId));
    if (result.isFailure()) ErrorResulter.proccesError(result);
  }
}
