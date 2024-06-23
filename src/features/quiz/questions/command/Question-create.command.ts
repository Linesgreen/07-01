import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { QuestionInputDto } from '../dto/create-question.input.dto';

export class QuestionCreateCommand {
  constructor(public questionInputDto: QuestionInputDto) {}
}

@CommandHandler(QuestionCreateCommand)
export class QuestionCreateUseCase implements ICommandHandler<QuestionCreateCommand> {
  constructor() {}

  async execute(command: QuestionCreateCommand): Promise<string> {
    return 'TODO';
  }
}
