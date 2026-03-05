import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class AddCommentDto {
  @ApiProperty({
    example: '@elazar'
  })
  @IsString()
  @Matches(/^@.+$/, {
    message: 'username must start with @'
  })
  username: string;

  @ApiProperty({
    example: 'זה פוסט מעניין!'
  })
  @IsString()
  description: string;
}