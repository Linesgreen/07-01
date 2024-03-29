/* eslint-disable no-underscore-dangle */
import { add } from 'date-fns';
import { Exception } from 'handlebars';

import { UserCreateData } from '../types/input';
import { UserOutputType, UserPgDb } from '../types/output';

// noinspection RegExpRedundantEscape

export class AccountData {
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export class EmailConfirmation {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
}

//TODO удалить null в id
export class User {
  accountData: AccountData;
  emailConfirmation: EmailConfirmation;
  id: number | null;
  constructor(userData: UserCreateData, passwordHash: string) {
    this.id = null;
    this.accountData = {
      login: userData.login,
      email: userData.email,
      passwordHash: passwordHash,
      createdAt: new Date(),
    };
    this.emailConfirmation = {
      confirmationCode: crypto.randomUUID(),
      expirationDate: add(new Date(), {
        hours: 1,
      }),
      isConfirmed: false,
    };
  }
  static fromDbToInstance(userData: UserPgDb): User {
    const newUser = Object.create(User.prototype);
    newUser.id = userData.id;
    newUser.accountData = {
      login: userData.login,
      email: userData.email,
      passwordHash: userData.passwordHash,
      createdAt: userData.createdAt.toISOString(),
    };

    newUser.emailConfirmation = {
      confirmationCode: userData.confirmationCode,
      expirationDate: userData.expirationDate,
      isConfirmed: userData.isConfirmed,
    };

    return newUser;
  }
  toDto(): UserOutputType {
    if (!this.id) throw new Exception('пытаешься сделать дто без id');
    return {
      id: this.id.toString(),
      login: this.accountData.login,
      email: this.accountData.email,
      createdAt: this.accountData.createdAt.toISOString(),
    };
  }
  updateConfirmationCode(): void {
    this.emailConfirmation.confirmationCode = crypto.randomUUID();
    this.emailConfirmation.expirationDate = add(new Date(), { hours: 1 });
  }
  updateConfirmationStatus(status: boolean): void {
    this.emailConfirmation.isConfirmed = status;
  }
}
