/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-types */
import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { BlogsRepository } from '../repositories/blog.repository';

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
  constructor(private readonly blogRepository: BlogsRepository) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const blog = await this.blogRepository.getById(value);
    if (!blog) return false;
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'blog dont exist';
  }
}
