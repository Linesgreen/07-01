import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { JwtAuthGuard } from '../../../infrastructure/guards/jwt-auth.guard';
import { ErrorResulter } from '../../../infrastructure/object-result/objcet-result';
import { Paginator } from '../../../infrastructure/utils/createPagination';
import { CurrentUserId } from '../../auth/decorators/current-user.decorator';
import { GamesQueryRepository } from '../repositories/games.query.repository';
import { UserConnectionCommand } from './command/user-connection.command';
import { GameViewDto } from './dto/games.view.output.dto';
import { GameQueryDto } from './dto/games-query.input.dto';
import { PlayerTopQueryDto } from './dto/player-top-query.input.dto';
import { StatsViewDto } from './dto/status-view.output.dto';
import { TopViewDto } from './dto/top-view.output.dto';

@Controller('pair-game-quiz')
export class PublicQuizController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly gamesQueryRepository: GamesQueryRepository,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('pairs/connection')
  async connectUser(@CurrentUserId() userId: number): Promise<GameViewDto> {
    const result = await this.commandBus.execute(new UserConnectionCommand({ userId }));
    if (result.isFailure()) ErrorResulter.proccesError(result);

    return this.gamesQueryRepository.findGameById(result.value.gameId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/my-statistic')
  async getStatistics(@CurrentUserId() userId: number): Promise<StatsViewDto> {
    return this.gamesQueryRepository.getStatistics(userId);
  }

  @Get('users/top')
  async getTop(@Query() query: PlayerTopQueryDto): Promise<Promise<Paginator<TopViewDto[]>>> {
    return this.gamesQueryRepository.getTop(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pairs/my')
  async findMyGames(@Query() query: GameQueryDto, @CurrentUserId() userId: number): Promise<Paginator<GameViewDto[]>> {
    return this.gamesQueryRepository.findMyGames(query, userId);
  }
}
