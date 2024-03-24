/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-types */
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { PostgresPostRepository } from '../../../features/posts/repositories/post/postgres.post.repository';

export function PostIsExist(property?: string, validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: PostIsExistConstraint,
    });
  };
}

// Обязательна регистрация в ioc
@ValidatorConstraint({ name: 'PostIsExist', async: true })
@Injectable()
export class PostIsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly postsQueryRepository: PostgresPostRepository) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const targerPost = await this.postsQueryRepository.chekPostIsExist(value);
    if (!targerPost) throw new NotFoundException();
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'post dont exist';
  }
}
