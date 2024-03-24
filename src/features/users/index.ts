import { PostgresUserQueryRepository } from './repositories/postgres.user.query.repository';
import { PostgresUserRepository } from './repositories/postgres.user.repository';
import { UserService } from './services/user.service';

export const userProviders = [UserService, PostgresUserRepository, PostgresUserQueryRepository];
