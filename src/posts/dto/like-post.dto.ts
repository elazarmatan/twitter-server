import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class LikePostDto {

  @ApiProperty({
    example: '@elazar'
  })
  @IsString()
  @Matches(/^@.+$/, {
    message: 'username must start with @'
  })
  username: string;
}