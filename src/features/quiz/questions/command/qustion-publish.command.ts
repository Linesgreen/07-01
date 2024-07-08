import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Question } from '../../entites/question.entity';
import { QuestionPublishInputDto } from '../dto/question-publish.input.dto';
import { QuestionsRepository } from '../repositories/questions.repository';

export class QuestionPublishCommand {
  constructor(
    public questionPublishInputDto: QuestionPublishInputDto,
    public questionId: string,
  ) {}
}

@CommandHandler(QuestionPublishCommand)
export class QuestionPublishUseCase implements ICommandHandler<QuestionPublishCommand> {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async execute(command: QuestionPublishCommand): Promise<Question | null> {
    const question = await this.questionsRepository.findQuestion(command.questionId);

    if (!question) {
      return null;
    }

    question.published = command.questionPublishInputDto.published;
    question.updatedAt = new Date();
    await this.questionsRepository.saveQuestion(question);
    return question;
  }
}
