import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, Matches, IsOptional, IsArray } from "class-validator";

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

  @ApiPropertyOptional({
    example: ['@alice', '@bob'],
    description: 'Optional list of usernames tagged in the post',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
  if (!value || value === '') return [];
  return Array.isArray(value) ? value : [value];
  })
  tags?: string[];

  
  @ApiPropertyOptional({
    type: 'string',
    description: 'Path to uploaded image (set by server)',
  })
  @IsOptional()
  @IsString()
  image?: string;
}
