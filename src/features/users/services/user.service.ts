import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { ErrorStatus, Result } from '../../../infrastructure/object-result/objcet-result';
import { SessionService } from '../../security/service/session.service';
import { User_Orm } from '../entites/user.orm.entities';
import { UserRepository } from '../repositories/user.repository';
import { UserCreateModel } from '../types/input';

@Injectable()
export class UserService {
  constructor(
    private sessionService: SessionService,
    private userRepository: UserRepository,
  ) {}
  async createUser(userData: UserCreateModel): Promise<Result<{ id: number }>> {
    const passwordHash = await bcrypt.hash(userData.password, 12);
    const newUser: User_Orm = User_Orm.createUserModel(userData, passwordHash);

    const userId: { id: number } = await this.userRepository.save(newUser);
    return Result.Ok(userId);
  }

  async checkCredentials(loginOrEmail: string, password: string): Promise<User_Orm | null> {
    const user = await this.userRepository.getByLoginOrEmail(loginOrEmail);
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      return user;
    }
    return null;
  }

  async deleteUser(userId: number): Promise<Result<string>> {
    const userIsExist = await this.userRepository.checkIsExitsById(userId);
    if (!userIsExist) return Result.Err(ErrorStatus.NOT_FOUND, `User ${userId} not found`);
    //Деактивируем все сессии пользователя
    await this.sessionService.terminateAllSession(userId);
    //Отмечаем пользователя как удаленного
    await this.userRepository.deleteById(userId);
    return Result.Ok(`User ${userId} deleted`);
  }
}
