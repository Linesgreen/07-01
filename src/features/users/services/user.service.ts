import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { EntityManager } from 'typeorm';

import { Result } from '../../../infrastructure/object-result/objcet-result';
import { User_Orm } from '../entites/user.orm.entities';
import { UserRepository } from '../repositories/user.repository';
import { UserCreateModel } from '../types/input';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}
  async createUser(userData: UserCreateModel, entityManager?: EntityManager): Promise<Result<{ id: number }>> {
    const passwordHash = await bcrypt.hash(userData.password, 12);
    const newUser: User_Orm = User_Orm.createUserModel(userData, passwordHash);

    const userId: { id: number } = await this.userRepository.save(newUser, entityManager);
    return Result.Ok(userId);
  }

  async checkCredentials(loginOrEmail: string, password: string): Promise<User_Orm | null> {
    const user = await this.userRepository.getByLoginOrEmail(loginOrEmail);
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      return user;
    }
    return null;
  }
}
