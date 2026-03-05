import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

interface JwtPayload {
	username: string;
	sub: number;
}

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
	) {}

	async validateUser(username: string, pass: string): Promise<any> {
		const user = await this.usersService.validateUser(username, pass);
		if (user) {
			return user;
		}
		return null;
	}

	async login(user: any) {
		const payload: JwtPayload = { username: user.username, sub: user.id };
		return {
			access_token: this.jwtService.sign(payload),
		};
	}

	async register(createUserDto: CreateUserDto) {
		return this.usersService.create(createUserDto);
	}
}
