/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-types */
import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { PostgresBlogsRepository } from '../repositories/postgres.blogs.repository';

export function BlogIsExist(property?: string, validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: BlogIsExistConstraint,
    });
  };
}

// Обязательна регистрация в ioc
@ValidatorConstraint({ name: 'BlogIsExist', async: true })
@Injectable()
export class BlogIsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly postgresBlogsRepository: PostgresBlogsRepository) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    return this.postgresBlogsRepository.chekBlogIsExist(value);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'blog dont exist';
  }
}
