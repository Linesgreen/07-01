export class UserOrmType {
  id: number;
  login: string;
  email: string;
  passwordHash: string;
  confirmationCode: string;
  expirationDate: Date;
  createdAt: Date;
  isConfirmed: boolean;
  isActive: boolean;
}

export class UserToDB {
  login: string;
  email: string;
  passwordHash: string;
  confirmationCode: string;
  expirationDate: Date;
  createdAt: Date;
  isConfirmed: boolean;
}
