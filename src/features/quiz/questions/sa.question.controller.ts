import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { AuthGuard } from '../../../infrastructure/guards/auth-basic.guard';
import { Paginator } from '../../../infrastructure/utils/createPagination';
import { Question } from '../entites/question.entity';
import { QuestionCreateCommand } from './command/question-create.command';
import { QuestionDeleteCommand } from './command/question-delete.command';
import { QuestionUpdateCommand } from './command/question-update.command';
import { QuestionPublishCommand } from './command/qustion-publish.command';
import { QuestionInputDto } from './dto/create-question.input.dto';
import { QuestionViewDto } from './dto/question.output.dto';
import { QuestionPublishInputDto } from './dto/question-publish.input.dto';
import { QuestionQueryDto } from './dto/sort.dto';
import { QuestionsQueryRepository } from './repositories/questions-query.repository';

@Controller('sa/quiz/questions')
export class SaQuestionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly questionsQueryRepository: QuestionsQueryRepository,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async findQuestions(@Query() query: QuestionQueryDto): Promise<Paginator<QuestionViewDto[]>> {
    return this.questionsQueryRepository.findQuestions(query);
  }

  //TODO object result
  @UseGuards(AuthGuard)
  @Post()
  async createQuestion(@Body() dto: QuestionInputDto): Promise<QuestionViewDto> {
    const questionId = await this.commandBus.execute(new QuestionCreateCommand(dto));
    return this.questionsQueryRepository.findQuestion(questionId);
  }

  //TODO object result
  @UseGuards(AuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updateQuestion(@Body() questionInputDto: QuestionInputDto, @Param('id') questionId: string): Promise<Question> {
    const result = await this.commandBus.execute(new QuestionUpdateCommand(questionInputDto, questionId));

    if (!result) throw new NotFoundException();

    return result;
  }

  @UseGuards(AuthGuard)
  @Put(':id/publish')
  @HttpCode(204)
  //TODO object result
  async publishQuestion(
    @Body() questionPublishInputDto: QuestionPublishInputDto,
    @Param('id') questionId: string,
  ): Promise<Question> {
    const result = await this.commandBus.execute(new QuestionPublishCommand(questionPublishInputDto, questionId));

    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(204)
  //TODO object result
  async deleteQuestion(@Param('id') questionId: string): Promise<void> {
    const result = await this.commandBus.execute(new QuestionDeleteCommand(questionId));

    if (!result) {
      throw new NotFoundException();
    }

    return;
  }
}
