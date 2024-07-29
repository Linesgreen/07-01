import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Question } from '../../entites/question.entity';
import { QuestionInputDto } from '../dto/create-question.input.dto';
import { QuestionsRepository } from '../repositories/questions.repository';

export class QuestionCreateCommand {
  constructor(public questionInputDto: QuestionInputDto) {}
}

@CommandHandler(QuestionCreateCommand)
export class QuestionCreateUseCase implements ICommandHandler<QuestionCreateCommand> {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: QuestionCreateCommand): Promise<string> {
    const question = Question.create({
      body: command.questionInputDto.body,
      correctAnswers: command.questionInputDto.correctAnswers,
    });

    return this.questionsRepository.saveQuestion(question);
  }
}
