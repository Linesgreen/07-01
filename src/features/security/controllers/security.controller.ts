import { Controller, Delete, Get, HttpCode, NotFoundException, Param, UseGuards } from '@nestjs/common';

import { CookieJwtGuard } from '../../../infrastructure/guards/jwt-cookie.guard';
import { ErrorResulter } from '../../../infrastructure/object-result/objcet-result';
import { CurrentSession } from '../../auth/decorators/userId-sessionKey.decorator';
import { SessionOutputType } from '../../auth/types/output';
import { SessionOwnerGuard } from '../guards/session-owner.guard';
import { SessionQueryRepository } from '../repository/session.query.repository';
import { SessionService } from '../service/session.service';

@Controller('security')
export class SecurityController {
  constructor(
    private sessionQueryRepository: SessionQueryRepository,
    private sessionService: SessionService,
  ) {}

  @UseGuards(CookieJwtGuard)
  @Get('devices')
  @HttpCode(200)
  async getSessions(
    @CurrentSession() { userId }: { userId: number; tokenKey: string },
  ): Promise<SessionOutputType[] | null> {
    const sessions = await this.sessionQueryRepository.getSessionsByUserId(userId);
    if (!sessions) throw new NotFoundException();
    return sessions;
  }

  @UseGuards(CookieJwtGuard, SessionOwnerGuard)
  @Delete('devices/:id')
  @HttpCode(204)
  async terminateCurrentSession(
    @CurrentSession() { userId }: { userId: number; tokenKey: string },
    @Param('id') deviceId: string,
  ): Promise<void> {
    const result = await this.sessionService.terminateSessionByDeviceIdAndUserId(deviceId, userId);
    if (result.isFailure()) ErrorResulter.proccesError(result);
  }

  @UseGuards(CookieJwtGuard)
  @Delete('devices')
  @HttpCode(204)
  async terminateOtherSession(
    @CurrentSession() { userId, tokenKey }: { userId: number; tokenKey: string },
  ): Promise<void> {
    const result = await this.sessionService.terminateOtherSession(userId, tokenKey);
    if (result.isFailure()) ErrorResulter.proccesError(result);
  }
}
