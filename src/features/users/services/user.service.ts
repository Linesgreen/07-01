import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { ErrorStatus, Result } from '../../../infrastructure/object-result/objcet-result';
import { SessionService } from '../../security/service/session.service';
import { User } from '../entites/user';
import { ORMUserQueryRepository } from '../repositories/postgres.user.query.repository';
import { UserOrmRepository } from '../repositories/postgres.user.repository';
import { UserCreateModel } from '../types/input';

@Injectable()
export class UserService {
  constructor(
    private sessionService: SessionService,
    private userOrmRepository: UserOrmRepository,
    private userQueryRepository: ORMUserQueryRepository,
  ) {}
  async createUser(userData: UserCreateModel): Promise<Result<{ id: number }>> {
    const passwordHash = await bcrypt.hash(userData.password, 12);
    const newUser: User = new User(userData, passwordHash);
    const userId: { id: number } = await this.userOrmRepository.createUser(newUser);
    return Result.Ok(userId);
  }

  async checkCredentials(loginOrEmail: string, password: string): Promise<User | null> {
    const user: User | null = await this.userOrmRepository.getByLoginOrEmail(loginOrEmail);
    if (user && (await bcrypt.compare(password, user.accountData.passwordHash))) {
      return user;
    }
    return null;
  }

  async deleteUser(userId: number): Promise<Result<string>> {
    const userIsExist = await this.userOrmRepository.checkIsExitsById(userId);
    if (!userIsExist) return Result.Err(ErrorStatus.NOT_FOUND, `User ${userId} not found`);
    //Деактивируем все сессии пользователя
    await this.sessionService.terminateAllSession(userId);
    //Отмечаем пользователя как удаленного
    await this.userOrmRepository.deleteById(userId);
    return Result.Ok(`User ${userId} deleted`);
  }
}
