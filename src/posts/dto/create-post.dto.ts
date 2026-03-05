import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches } from "class-validator";

export class CreatePostDto {
 @ApiProperty({
    example: '@elazar',
    description: 'username must start with @',
  })
  @IsString()
  @Matches(/^@.+$/, {
    message: 'username must start with @',
  })
  username: string;

  @ApiProperty({
    example: 'my post',
  })
  @IsString()
  description: string;
}
