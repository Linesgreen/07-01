import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Paginator } from '../../../../infrastructure/utils/createPagination';
import { Question } from '../../entites/question.entity';
import { QuestionViewDto } from '../dto/question.output.dto';
import { QuestionQueryDto } from '../dto/sort.dto';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}

  async findQuestion(questionId: string): Promise<QuestionViewDto> {
    const questions = await this.questionsRepository
      .createQueryBuilder('q')
      .where(`q.id = :questionId`, {
        questionId: questionId,
      })
      .getMany();

    const mappedQuestions = await this.questionsMapping(questions);
    return mappedQuestions[0];
  }

  async findQuestions(query: QuestionQueryDto): Promise<Paginator<QuestionViewDto[]>> {
    const questions = await this.questionsRepository
      .createQueryBuilder('q')
      .where(
        `${
          query.publishedStatus === true || query.publishedStatus === false
            ? 'q.published = :publishedStatus'
            : 'q.published is not null'
        }`,
        { publishedStatus: query.publishedStatus },
      )
      .andWhere(`${query.bodySearchTerm ? `q.body ilike :bodyTerm` : 'q.body is not null'}`, {
        bodyTerm: `%${query.bodySearchTerm}%`,
      })
      .orderBy(`q.${query.sortBy}`, query.sortDirection)
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getMany();

    const totalCount = await this.questionsRepository
      .createQueryBuilder('q')
      .where(
        `${
          query.publishedStatus === true || query.publishedStatus === false
            ? 'q.published = :publishedStatus'
            : 'q.published is not null'
        }`,
        { publishedStatus: query.publishedStatus },
      )
      .andWhere(`${query.bodySearchTerm ? `q.body ilike :bodyTerm` : 'q.body is not null'}`, {
        bodyTerm: `%${query.bodySearchTerm}%`,
      })
      .getCount();

    return Paginator.paginate({
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: await this.questionsMapping(questions),
    });
  }

  private async questionsMapping(array: Question[]): Promise<QuestionViewDto[]> {
    return array.map((q) => {
      return {
        id: q.id.toString(),
        body: q.body,
        correctAnswers: q.correctAnswers,
        published: q.published,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
      };
    });
  }
}
