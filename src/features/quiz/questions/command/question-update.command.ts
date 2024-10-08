import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Question } from '../../entites/question.entity';
import { QuestionInputDto } from '../dto/create-question.input.dto';
import { QuestionsRepository } from '../repositories/questions.repository';

export class QuestionUpdateCommand {
  constructor(
    public questionInputDto: QuestionInputDto,
    public questionId: string,
  ) {}
}

@CommandHandler(QuestionUpdateCommand)
export class QuestionUpdateUseCase implements ICommandHandler<QuestionUpdateCommand> {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: QuestionUpdateCommand): Promise<Question | null> {
    const question = await this.questionsRepository.findQuestion(command.questionId);

    if (!question) {
      return null;
    }

    question.update({
      body: command.questionInputDto.body,
      correctAnswers: command.questionInputDto.correctAnswers,
    });

    await this.questionsRepository.saveQuestion(question);
    return question;
  }
}
