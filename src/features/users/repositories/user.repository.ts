/* eslint-disable @typescript-eslint/no-unused-vars */
// noinspection UnnecessaryLocalVariableJS

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User_Orm } from '../entites/user.orm.entities';
@Injectable()
export class UserRepository {
  constructor(@InjectRepository(User_Orm) protected userRepository: Repository<User_Orm>) {}

  async deleteById(id: number): Promise<void> {
    await this.userRepository.update({ id }, { isActive: false });
  }

  async getById(id: number): Promise<User_Orm | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return null;
    return user;
  }

  async getByLoginOrEmail(loginOrEmail: string): Promise<User_Orm | null> {
    const user = await this.userRepository.findOne({ where: [{ email: loginOrEmail }, { login: loginOrEmail }] });

    if (!user) return null;
    return user;
  }

  async findByConfirmationCode(code: string): Promise<User_Orm | null> {
    const user = await this.userRepository.findOne({ where: { confirmationCode: code } });
    if (!user) return null;
    return user;
  }

  async checkIsExitsById(id: number): Promise<boolean> {
    const user = await this.userRepository.count({ where: { id } });
    return !!user;
  }

  async save(user: User_Orm): Promise<{ id: number }> {
    await user.save();
    return { id: user.id };
  }
}
