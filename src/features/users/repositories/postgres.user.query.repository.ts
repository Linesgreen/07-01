import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';

import { QueryPaginationResult } from '../../../infrastructure/types/query-sort.type';
import { PaginationWithItems } from '../../common/types/output';
import { User_Orm } from '../entites/orm_user';
import { User } from '../entites/user';
import { UserOutputType } from '../types/output';

@Injectable()
export class ORMUserQueryRepository {
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

@Injectable()
export class PostgresUserQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getUserById(userId: string): Promise<UserOutputType | null> {
    const user = await this.dataSource.query(
      `SELECT id, login, email, "passwordHash", "confirmationCode", "expirationDate","createdAt", "isConfirmed"
        FROM public.users
        WHERE "id" = $1`,
      [userId],
    );
    if (user.length === 0) return null;
    return User.fromDbToInstance(user[0]).toDto();
  }

  private async isTextColumn(tableName: string, columnName: string): Promise<boolean> {
    const columnType = await this.getColumnType(tableName, columnName);
    return columnType === 'text' || columnType === 'character varying';
  }

  private async getColumnType(tableName: string, columnName: string): Promise<string> {
    const query = `
      SELECT data_type
      FROM information_schema.columns
      WHERE table_name = '${tableName}' AND column_name = '${columnName}'
    `;
    const result = await this.dataSource.query(query);
    if (result.length > 0) {
      return result[0].data_type;
    } else {
      throw new Error('Column not found');
    }
  }
}
