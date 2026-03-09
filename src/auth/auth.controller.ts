import { Controller, Post, Body, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

class LoginDto {
  username: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private readonly logger = new Logger(AuthController.name);

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    // delegate to auth service which will call users service
    const result = await this.authService.register(createUserDto);
    this.logger.log(`register response:`, JSON.stringify(result));
    return result;
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const result = this.authService.login(user);
    this.logger.log(`login response:`, JSON.stringify({ ...result, user }));
    return { ...result, user };
  }
}
