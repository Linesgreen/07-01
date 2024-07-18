/* eslint-disable @typescript-eslint/no-unused-vars,no-underscore-dangle */
// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { User } from '../entites/user.orm.entities';
@Injectable()
export class UserRepository {
  constructor(@InjectRepository(User) protected userRepository: Repository<User>) {}

  async deleteById(id: number, entityManager?: EntityManager): Promise<void> {
    const userRepository = this._getUserRepository(entityManager);

    await userRepository.update({ id }, { isActive: false });
  }

  async getById(id: number, entityManager?: EntityManager): Promise<User | null> {
    const userRepository = this._getUserRepository(entityManager);

    const user = await userRepository.findOne({ where: { id, isActive: true } });
    if (!user) return null;

    return user;
  }

  async getByLoginOrEmail(loginOrEmail: string, entityManager?: EntityManager): Promise<User | null> {
    const userRepository = this._getUserRepository(entityManager);

    const user = await userRepository.findOne({ where: [{ email: loginOrEmail }, { login: loginOrEmail }] });

    if (!user) return null;
    return user;
  }

  async findByConfirmationCode(code: string, entityManager?: EntityManager): Promise<User | null> {
    const userRepository = this._getUserRepository(entityManager);

    const user = await userRepository.findOne({ where: { confirmationCode: code } });
    if (!user) return null;
    return user;
  }

  async checkIsExitsById(id: number, entityManager?: EntityManager): Promise<boolean> {
    const userRepository = this._getUserRepository(entityManager);

    const user = await userRepository.count({ where: { id } });
    return !!user;
  }

  async save(user: User, entityManager?: EntityManager): Promise<{ id: number }> {
    const userRepository = this._getUserRepository(entityManager);
    await userRepository.save(user);

    return { id: user.id };
  }

  private _getUserRepository(entityManager?: EntityManager): Repository<User> {
    let userRepository = this.userRepository;
    if (entityManager) {
      userRepository = entityManager.getRepository(User);
    }
    return userRepository;
  }
}
