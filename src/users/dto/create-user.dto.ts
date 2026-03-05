import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsEmail, IsPhoneNumber, IsOptional, IsDateString } from "class-validator";

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '@johndoe',
    description: 'Unique username starting with @',
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'P@ssw0rd',
    description: 'Password for the user account',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    example: '1990-01-01',
    description: 'Birth date (optional)',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    example: 'Software developer passionate about technology',
    description: 'User biography (optional)',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Profile image URL (optional)',
  })
  @IsOptional()
  @IsString()
  image?: string;
}
