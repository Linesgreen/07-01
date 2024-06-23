import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, Length } from 'class-validator';

export class QuestionInputDto {
  @IsNotEmpty()
  @Length(10, 500)
  body: string;

  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => {
    return value.map((a) => a.toString().trim());
  })
  correctAnswers: string[];
}
