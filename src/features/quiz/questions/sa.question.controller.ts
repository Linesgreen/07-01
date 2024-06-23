import { Body, Controller } from '@nestjs/common';

import { QuestionInputDto } from './dto/create-question.input.dto';

@Controller('sa/quiz/questions')
export class SaQuestionController {
  constructor() {}

  async createQuestion(@Body() dto: QuestionInputDto) {}
}
