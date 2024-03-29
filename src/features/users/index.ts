import { ORMUserQueryRepository, PostgresUserQueryRepository } from './repositories/postgres.user.query.repository';
import { PostgresUserRepository, UserOrmRepository } from './repositories/postgres.user.repository';
import { UserService } from './services/user.service';

export const userProviders = [
  UserOrmRepository,
  UserService,
  PostgresUserRepository,
  PostgresUserQueryRepository,
  ORMUserQueryRepository,
];
