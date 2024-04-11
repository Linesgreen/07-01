import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { QueryPaginationResult } from '../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../common/types/output';
import { User_Orm } from '../entites/user.orm.entities';
import { UserOutputType } from '../types/output';

@Injectable()
export class UserQueryRepository {
  constructor(@InjectRepository(User_Orm) protected userRepository: Repository<User_Orm>) {}

  async getUserById(userId: number): Promise<UserOutputType | null> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) return null;
    return this.userMapping(user);
  }

  async getAll(sortData: QueryPaginationResult): Promise<PaginationWithItems<UserOutputType>> {
    const skip = (sortData.pageNumber - 1) * sortData.pageSize;
    const serachLoginTerm = sortData.searchLoginTerm ?? '';
    const searchEmailTerm = sortData.searchEmailTerm ?? '';
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where([
        { isActive: true, login: ILike(`%${serachLoginTerm}%`) },
        { isActive: true, email: ILike(`%${searchEmailTerm}%`) },
      ])
      .orderBy(`user.${sortData.sortBy}`, `${sortData.sortDirection}`)
      .take(sortData.pageSize)
      .skip(skip)
      .getMany();

    const totalCount = await this.userRepository
      .createQueryBuilder('user')
      .where([
        { isActive: true, login: ILike(`%${serachLoginTerm}%`) },
        { isActive: true, email: ILike(`%${searchEmailTerm}%`) },
      ])
      .getCount();

    const usersDto: UserOutputType[] = users.map((user) => this.userMapping(user));

    const usersOutput: PaginationWithItems<UserOutputType> = new PaginationWithItems(
      sortData.pageNumber,
      sortData.pageSize,
      totalCount,
      usersDto,
    );
    return usersOutput;
  }

  private userMapping(user: User_Orm): UserOutputType {
    return {
      id: user.id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
