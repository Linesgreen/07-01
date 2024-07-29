/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { DataSource } from 'typeorm';

import { Question } from '../../../src/features/quiz/entites/question.entity';

const questions = [
  { body: 'Вопрос 1', answer: ['Ответ 1'] },
  { body: 'Вопрос 2', answer: ['Ответ 2'] },
  { body: 'Вопрос 3', answer: ['Ответ 3'] },
  { body: 'Вопрос 4', answer: ['Ответ 4'] },
  { body: 'Вопрос 5', answer: ['Ответ 5'] },
];

export class TestQuestionManager {
  private questionRepository;

  constructor(private dataSource: DataSource) {
    this.questionRepository = this.dataSource.getRepository(Question);
  }

  // Метод для заполнения базы данных тестовыми вопросами
  async insertTestQuestions() {
    for (const question of questions) {
      const newQuestion = this.questionRepository.create({
        body: question.body,
        correctAnswers: question.answer,
        published: true,
        createdAt: new Date(),
      });

      await this.questionRepository.save(newQuestion);
    }
  }

  // Метод для получения вопроса по номеру (1-based index)
  async getQuestionByNumber(number: number): Promise<Question | null> {
    if (number < 1 || number > questions.length) {
      return null;
    }
  }
}
