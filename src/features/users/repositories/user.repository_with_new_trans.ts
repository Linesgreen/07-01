/* eslint-disable @typescript-eslint/no-unused-vars,no-underscore-dangle */
// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { TransactionHelper } from '../../../infrastructure/TransactionHelper/transaction-helper';
import { User } from '../entites/user.orm.entities';
@Injectable()
export class UserRepositoryNewTrans {
  private readonly userRepository: Repository<User>;
  constructor(private readonly transactionHelper: TransactionHelper) {
    this.userRepository = this.transactionHelper.getManager().getRepository(User);
  }

  async deleteById(id: number): Promise<void> {
    const userRepository = this._getUserRepository();

    await userRepository.update({ id }, { isActive: false });
  }

  async getById(id: number): Promise<User | null> {
    const userRepository = this._getUserRepository();

    const user = await userRepository.findOne({ where: { id, isActive: true } });
    if (!user) return null;

    return user;
  }

  async getByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const userRepository = this._getUserRepository();

    const user = await userRepository.findOne({ where: [{ email: loginOrEmail }, { login: loginOrEmail }] });

    if (!user) return null;
    return user;
  }

  async findByConfirmationCode(code: string): Promise<User | null> {
    const userRepository = this._getUserRepository();

    const user = await userRepository.findOne({ where: { confirmationCode: code } });
    if (!user) return null;
    return user;
  }

  async checkIsExitsById(id: number): Promise<boolean> {
    const userRepository = this._getUserRepository();

    const user = await userRepository.count({ where: { id } });
    return !!user;
  }

  async save(user: User): Promise<{ id: number }> {
    const userRepository = this._getUserRepository();
    await userRepository.save(user);

    return { id: user.id };
  }

  private _getUserRepository(): Repository<User> {
    const userRepository = this.userRepository;

    return userRepository;
  }
}
