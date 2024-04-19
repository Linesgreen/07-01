/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-function-return-type */
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { SessionRepository } from '../../features/security/repository/session.repository';
import { UserRepository } from '../../features/users/repositories/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    console.log(payload);
    const session = await this.sessionRepository.getByDeviceId(payload.deviceId);
    if (!session) throw new UnauthorizedException();
    const user = await this.userRepository.getById(payload.userId);
    if (!user) throw new ForbiddenException();
    return { id: payload.userId };
  }
}
