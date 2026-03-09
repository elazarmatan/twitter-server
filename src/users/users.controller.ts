import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UploadedFile,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FollowUserDto } from './dto/follow-user.dto';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  private readonly logger = new Logger(UsersController.name);

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: async (req, file, cb) => {
          const dest = join(process.cwd(), 'uploads', 'users');
          await import('fs').then(fs => fs.promises.mkdir(dest, { recursive: true }));
          cb(null, dest);
        },
        filename: (req, file, cb) => {
          const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, name + extname(file.originalname));
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        username: { type: 'string' },
        password: { type: 'string' },
        phone: { type: 'string' },
        email: { type: 'string' },
        birthDate: { type: 'string' },
        bio: { type: 'string' },
        image: { type: 'string', format: 'binary' },
      },
      required: ['name', 'username', 'password', 'phone', 'email'],
    },
  })
  async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file?: any,
  ) {
    if (file) {
      createUserDto.image = `/uploads/users/${file.filename}`;
    }
    const result = await this.usersService.create(createUserDto);
    this.logger.log(`create response:`, JSON.stringify(result));
    return result;
  }

  @Get()
  async findAll() {
    const result = await this.usersService.findAll();
    this.logger.log(`findAll response:`, JSON.stringify(result));
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.logger.log(`findOne response:`, JSON.stringify(user));
    return user;
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: async (req, file, cb) => {
          const dest = join(process.cwd(), 'uploads', 'users');
          await import('fs').then(fs => fs.promises.mkdir(dest, { recursive: true }));
          cb(null, dest);
        },
        filename: (req, file, cb) => {
          const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, name + extname(file.originalname));
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        username: { type: 'string' },
        password: { type: 'string' },
        phone: { type: 'string' },
        email: { type: 'string' },
        birthDate: { type: 'string' },
        bio: { type: 'string' },
        image: { type: 'string', format: 'binary' },
      },
      // update is partial; no required fields
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: any,
  ) {
    if (file) {
      updateUserDto.image = `/uploads/users/${file.filename}`;
    }
    const user = await this.usersService.update(+id, updateUserDto);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.logger.log(`update response:`, JSON.stringify(user));
    return user;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const success = await this.usersService.remove(+id);
    if (!success) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const result = { message: `User with ID ${id} removed successfully` };
    this.logger.log(`remove response:`, JSON.stringify(result));
    return result;
  }

  @Post('follow')
  async followUser(@Body() followUserDto: FollowUserDto) {
    // In a real app, you'd get the current user from JWT token
    // For now, expect it in the body
    const user = await this.usersService.followUser(followUserDto.username, followUserDto.username);
    if (!user) {
      throw new NotFoundException('User not found or invalid follow action');
    }
    this.logger.log(`follow response:`, JSON.stringify(user));
    return user;
  }

  @Post('unfollow')
  async unfollowUser(@Body() followUserDto: FollowUserDto) {
    // In a real app, you'd get the current user from JWT token
    // For now, expect it in the body
    const user = await this.usersService.unfollowUser(followUserDto.username, followUserDto.username);
    if (!user) {
      throw new NotFoundException('User not found or invalid unfollow action');
    }
    this.logger.log(`unfollow response:`, JSON.stringify(user));
    return user;
  }

  @Get('findByUsername/:username')
  async findByUsername(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new NotFoundException(`User ${username} not found`);
    }
    this.logger.log(`findByUsername response:`, JSON.stringify(user));
    return user;
  }
}
