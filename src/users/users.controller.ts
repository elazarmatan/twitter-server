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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
    return await this.usersService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
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
    return user;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const success = await this.usersService.remove(+id);
    if (!success) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: `User with ID ${id} removed successfully` };
  }
}
