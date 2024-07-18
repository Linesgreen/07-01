import { UserQueryRepository } from './repositories/user.query.repository';
import { UserRepository } from './repositories/user.repository';
import { UserRepositoryNewTrans } from './repositories/user.repository_with_new_trans';
import { UserService } from './services/user.service';

export const userProviders = [UserRepository, UserService, UserQueryRepository, UserRepositoryNewTrans];
