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

  //TODO переделать на конструктор
  async execute(command: QuestionCreateCommand): Promise<string> {
    const question = new Question();
    question.body = command.questionInputDto.body;
    question.correctAnswers = command.questionInputDto.correctAnswers;
    question.published = false;
    question.createdAt = new Date();

    return this.questionsRepository.saveQuestion(question);
  }
}
