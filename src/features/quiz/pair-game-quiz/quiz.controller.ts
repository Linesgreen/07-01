import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { validate as isUuid } from 'uuid';

import { JwtAuthGuard } from '../../../infrastructure/guards/jwt-auth.guard';
import { ErrorResulter } from '../../../infrastructure/object-result/objcet-result';
import { TransactionHelper } from '../../../infrastructure/TransactionHelper/transaction-helper';
import { Paginator } from '../../../infrastructure/utils/createPagination';
import { CurrentUserId } from '../../auth/decorators/current-user.decorator';
import { GamesQueryRepository } from '../repositories/games.query.repository';
import { AnswerSendCommand } from './command/answer-send.command';
import { UserConnectionCommand } from './command/user-connection.command';
import { AnswerInputDto } from './dto/answers.input.dto';
import { AnswerViewDto, GameViewDto } from './dto/games.view.output.dto';
import { GameQueryDto } from './dto/games-query.input.dto';
import { PlayerTopQueryDto } from './dto/player-top-query.input.dto';
import { StatsViewDto } from './dto/status-view.output.dto';
import { TopViewDto } from './dto/top-view.output.dto';

@Controller('pair-game-quiz')
export class PublicQuizController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly gamesQueryRepository: GamesQueryRepository,
    private readonly transactionHelper: TransactionHelper,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('pairs/connection')
  @HttpCode(200)
  async connectUser(@CurrentUserId() userId: number): Promise<GameViewDto> {
    return this.transactionHelper.doTransactional(async () => {
      const result = await this.commandBus.execute(new UserConnectionCommand({ userId }));
      if (result.isFailure()) ErrorResulter.proccesError(result);
      console.log(result, 'result');
      console.log(result.value, 'result.value');
      console.log(result.value.gameId, 'result.value.gameId');
      const currentGame = await this.gamesQueryRepository.findGameById(result.value.gameId);
      console.log(currentGame, 'currentGame');
      return currentGame;
    });
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

  @UseGuards(JwtAuthGuard)
  @Get('pairs/my-current')
  async findCurrentGame(@CurrentUserId() userId: number): Promise<GameViewDto> {
    const game = await this.gamesQueryRepository.findCurrentGame(userId);

    if (!game) throw new NotFoundException();
    return game;
  }

  @UseGuards(JwtAuthGuard)
  @Get('pairs/:id')
  async findGame(@Param('id') gameId: string, @CurrentUserId() userId: number): Promise<GameViewDto> {
    if (!isUuid(gameId) && !isNaN(Number(gameId))) throw new NotFoundException();

    if (!isUuid(gameId)) throw new BadRequestException();

    const currentGame = await this.gamesQueryRepository.findGameById(gameId);

    if (!currentGame) throw new NotFoundException();

    const playerOneProgress = currentGame.firstPlayerProgress;
    const playerTwoProgress = currentGame.secondPlayerProgress;

    if (playerOneProgress && !playerTwoProgress) {
      if (playerOneProgress.player.id !== userId.toString()) {
        throw new ForbiddenException();
      }
    }

    if (playerOneProgress.player.id !== userId.toString() && playerTwoProgress!.player.id !== userId.toString()) {
      throw new ForbiddenException();
    }

    return currentGame;
  }

  @UseGuards(JwtAuthGuard)
  @Post('pairs/my-current/answers')
  @HttpCode(200)
  async sendAnswer(@Body() answerInputDto: AnswerInputDto, @CurrentUserId() userId: number): Promise<AnswerViewDto> {
    return this.transactionHelper.doTransactional(async (): Promise<AnswerViewDto> => {
      const result = await this.commandBus.execute(new AnswerSendCommand({ answerInputDto, userId }));
      if (result.isFailure()) ErrorResulter.proccesError(result);

      const { gameId } = result.value;
      return this.gamesQueryRepository.findAnswerInGame(gameId, userId);
    });
  }
}
